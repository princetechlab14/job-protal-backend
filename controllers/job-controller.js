const { Job, Employer } = require("../models");
const { jobSchema } = require("../validators/jobValidator");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const { Op } = require("sequelize");

// Create a new job
exports.createJob = async (req, res) => {
  const { employerId } = req.user;
  try {
    const { error } = jobSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
    }

    const employee = await Employer.findByPk(employerId);
    if (!employee) {
      return sendErrorResponse(res, "Employer not found", 404);
    }

    // Append city to employerId if advertise is true
    let jobData = { ...req.body, employerId };

    const newJob = await Job.create(jobData);
    sendSuccessResponse(res, newJob, 201);
  } catch (error) {
    console.error("Error creating job:", error);
    sendErrorResponse(res, "Error creating job");
  }
};

// Update job by ID
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { error } = jobSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
    }

    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendErrorResponse(res, "Job not found", 404);
    }

    // Append city to jobPostingLocation if advertise is true
    let jobData = { ...req.body };

    const updatedJob = await job.update(jobData);
    sendSuccessResponse(res, updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    sendErrorResponse(res, "Error updating job");
  }
};

// Get all jobs with pagination and optional filtering
exports.getAllJobs = async (req, res) => {
  const { page = 1, limit = 2 } = req.query; // Default page is 1, limit is 2 per page
  const { jobTitle, location } = req.body;
  const offset = (page - 1) * limit;

  // Construct the where clause for filtering
  const whereClause = {
    status: "Open", // Filter by status = "Open"
  };
  if (jobTitle) {
    whereClause.jobTitle = { [Op.like]: `%${jobTitle}%` }; // Using Sequelize's Op.like for partial matching
  }
  if (location) {
    whereClause.city = { [Op.like]: `%${location}%` };
  }

  try {
    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
    });

    // Parse jobTypes field for each job
    jobs.forEach((job) => {
      job.jobTypes = JSON.parse(job.jobTypes);
    });

    // Construct pagination metadata
    const totalPages = Math.ceil(count / limit);
    const currentPage = parseInt(page);

    sendSuccessResponse(res, { jobs, totalPages, currentPage });
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    sendErrorResponse(res, "Error retrieving jobs", 500);
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendErrorResponse(res, "Job not found", 404);
    }

    // Parse jobTypes field
    job.jobTypes = JSON.parse(job.jobTypes);

    sendSuccessResponse(res, job);
  } catch (error) {
    console.error("Error retrieving job:", error);
    sendErrorResponse(res, "Error retrieving job");
  }
};

// Delete job by ID
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendErrorResponse(res, "Job not found", 404);
    }
    await job.destroy();
    sendSuccessResponse(res, { message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    sendErrorResponse(res, "Error deleting job");
  }
};
