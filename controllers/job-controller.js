const { Job, Employer } = require("../models");
const { jobSchema } = require("../validators/jobValidator");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const { Op, Sequelize } = require("sequelize");

// Middleware to check if the user is an employee
const ensureEmployer = (req, res, next) => {
  if (req.user.userType !== "employer") {
    return sendErrorResponse(res, "Employee cannot access this API", 403);
  }
  next();
};

// Create a new job
exports.createJob = [
  ensureEmployer,
  async (req, res) => {
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
  },
];

// Update job by ID
exports.updateJob = [
  ensureEmployer,
  async (req, res) => {
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
  },
];

// Get all jobs with pagination and optional filtering
exports.getAllJobs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default page is 1, limit is 10 per page
  const {
    jobTitle,
    location,
    datePosted,
    jobLocation,
    minPay,
    maxPay,
    jobType,
    skills,
    language,
    city,
    education,
  } = req.body;
  const offset = (page - 1) * limit;

  // Construct the where clause for filtering
  const whereClause = {
    status: "Open", // Filter by status = "Open"
  };

  // Filter by deadline date in the future or null
  const currentDate = new Date();
  whereClause.deadlineDate = {
    [Op.or]: [
      { [Op.gt]: currentDate }, // Deadline date is in the future
      { [Op.eq]: null }, // Deadline date is null
    ],
  };

  // Filters
  if (jobTitle) {
    whereClause.jobTitle = { [Op.like]: `%${jobTitle}%` };
  }

  // Filter by jobTitle with partial matching
  if (jobTitle) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("jobTitle")),
        "LIKE",
        `%${jobTitle.toLowerCase()}%`
      ),
    ];
  }

  // Filter by location (city or state)
  if (location) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("city")),
        "LIKE",
        `%${location.toLowerCase()}%`
      ),
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("state")),
        "LIKE",
        `%${location.toLowerCase()}%`
      ),
    ];
  }

  // Filter by date posted
  if (datePosted) {
    const currentDate = new Date();
    let pastDate;
    switch (datePosted.toLowerCase()) {
      case "last 14 hours":
        pastDate = new Date(currentDate.getTime() - 14 * 60 * 60 * 1000);
        break;
      case "last 3 days":
        pastDate = new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case "last 7 days":
        pastDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last 14 days":
        pastDate = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      default:
        pastDate = null;
    }
    if (pastDate) {
      whereClause.createdAt = { [Op.gte]: pastDate };
    }
  }

  // Filter by jobLocation with partial matching
  if (jobLocation) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("jobLocation")),
        "LIKE",
        `%${jobLocation.toLowerCase()}%`
      ),
    ];
  }

  // Filter by minimum pay
  if (minPay) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(Sequelize.col("minimumPay"), ">=", minPay),
    ];
  }

  // Filter by maximum pay
  if (maxPay) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(Sequelize.col("maximumPay"), "<=", maxPay),
    ];
  }

  // Filter by jobType using JSON_CONTAINS for array field
  if (jobType) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn(
          "JSON_CONTAINS",
          Sequelize.col("jobTypes"),
          JSON.stringify([jobType])
        ),
        true
      ),
    ];
  }

  // Filter by skills using JSON_CONTAINS for array field
  if (skills) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn(
          "JSON_CONTAINS",
          Sequelize.col("skills"),
          JSON.stringify([skills])
        ),
        true
      ),
    ];
  }
  // Filter by education using JSON_CONTAINS for array field
  if (education) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn(
          "JSON_CONTAINS",
          Sequelize.col("education"),
          JSON.stringify([education])
        ),
        true
      ),
    ];
  }

  // Filter by language using JSON_CONTAINS for array field
  if (language) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn(
          "JSON_CONTAINS",
          Sequelize.col("languages"),
          JSON.stringify([language])
        ),
        true
      ),
    ];
  }

  // Filter by city with partial matching
  if (city) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("city")),
        "LIKE",
        `%${city.toLowerCase()}%`
      ),
    ];
  }

  try {
    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
    });

    // Parse JSON fields for each job
    jobs.forEach((job) => {
      job.jobTypes = JSON.parse(job.jobTypes);
      job.skills = JSON.parse(job.skills);
      job.languages = JSON.parse(job.languages);
      job.education = JSON.parse(job.education);
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
    job.languages = JSON.parse(job.languages);
    job.skills = JSON.parse(job.skills);
    job.education = JSON.parse(job.education);

    sendSuccessResponse(res, job);
  } catch (error) {
    console.error("Error retrieving job:", error);
    sendErrorResponse(res, "Error retrieving job");
  }
};

// Delete job by ID
exports.deleteJob = [
  ensureEmployer,
  async (req, res) => {
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
  },
];
