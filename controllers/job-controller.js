const { Job, Employer, Review, sequelize } = require("../models");
const { jobSchema } = require("../validators/jobValidator");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const { Op, fn, col } = require("sequelize");

// Middleware to check if the user is an employee
const ensureEmployer = (req, res, next) => {
  if (req.user.userType !== "employer") {
    return sendErrorResponse(
      res,
      { message: "Employee cannot access this API" },
      403
    );
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
        return sendErrorResponse(
          res,
          { message: error.details[0].message },
          400
        );
      }

      const employer = await Employer.findByPk(employerId);
      if (!employer) {
        return sendErrorResponse(res, { message: "Employer not found" }, 404);
      }

      // Append employerId to job data
      let jobData = { ...req.body, employerId };

      // Handle deadlineDate
      console.log(jobData?.deadlineDate, "<-jobData?.deadlineDate");
      if (jobData.deadline === "Yes") {
        jobData.deadlineDate = jobData.deadlineDate;
      } else {
        jobData.deadlineDate = null;
      }

      // Create new job
      const newJob = await Job.create(jobData);

      // Send success response
      sendSuccessResponse(res, newJob, 201);
    } catch (error) {
      console.error("Error creating job:", error);
      sendErrorResponse(res, { message: "Error creating job" }, 500);
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
        return sendErrorResponse(res, { message: "Job not found" }, 404);
      }

      // Append city to jobPostingLocation if advertise is true
      let jobData = { ...req.body };

      const updatedJob = await job.update(jobData);
      sendSuccessResponse(res, updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      sendErrorResponse(res, { message: "Error updating job" }, 500);
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
  const offset = (Number(page) - 1) * Number(limit);

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
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn("LOWER", sequelize.col("jobTitle")),
        "LIKE",
        `%${jobTitle.toLowerCase()}%`
      ),
    ];
  }

  if (location) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn("LOWER", sequelize.col("city")),
        "LIKE",
        `%${location.toLowerCase()}%`
      ),
      sequelize.where(
        sequelize.fn("LOWER", sequelize.col("state")),
        "LIKE",
        `%${location.toLowerCase()}%`
      ),
    ];
  }

  if (datePosted) {
    const pastDate = getPastDate(datePosted);
    if (pastDate) {
      whereClause.createdAt = { [Op.gte]: pastDate };
    }
  }

  if (jobLocation) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn("LOWER", sequelize.col("jobLocation")),
        "LIKE",
        `%${jobLocation.toLowerCase()}%`
      ),
    ];
  }

  if (minPay) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(sequelize.col("minimumPay"), ">=", minPay),
    ];
  }

  if (maxPay) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(sequelize.col("maximumPay"), "<=", maxPay),
    ];
  }

  if (jobType) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn(
          "JSON_CONTAINS",
          sequelize.col("jobTypes"),
          process.env.DEV_TYPE === "local" && JSON.stringify([jobType])
        ),
        true
      ),
    ];
  }

  if (skills) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn(
          "JSON_CONTAINS",
          sequelize.col("skills"),
          process.env.DEV_TYPE === "local" && JSON.stringify([skills])
        ),
        true
      ),
    ];
  }

  if (education) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn(
          "JSON_CONTAINS",
          sequelize.col("education"),
          process.env.DEV_TYPE === "local" && JSON.stringify([education])
        ),
        true
      ),
    ];
  }

  if (language) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn(
          "JSON_CONTAINS",
          sequelize.col("languages"),
          process.env.DEV_TYPE === "local" && JSON.stringify([language])
        ),
        true
      ),
    ];
  }

  if (city) {
    whereClause[Op.or] = [
      ...(whereClause[Op.or] || []),
      sequelize.where(
        sequelize.fn("LOWER", sequelize.col("city")),
        "LIKE",
        `%${city.toLowerCase()}%`
      ),
    ];
  }

  try {
    const count = await Job.count({
      where: whereClause,
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
      distinct: true,
      col: "id",
    });

    // Main query
    const jobs = await Job.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Employer, // Assuming `Company` is the model name
          attributes: ["id", "companyName"],
          as: "employer",
          include: [
            {
              model: Review,
              as: "reviews",
              attributes: [[fn("AVG", col("rating")), "averageReviewRating"]],
            },
          ],
        },
      ],
      group: [
        "Job.id",
        "Job.jobTitle",
        "Job.jobLocation",
        "Job.employerId",
        "Job.specificCity",
        "Job.advertiseCity",
        "Job.city",
        "Job.state",
        "Job.area",
        "Job.pincode",
        "Job.streetAddress",
        "Job.jobTypes",
        "Job.education",
        "Job.skills",
        "Job.languages",
        "Job.minimumPay",
        "Job.maximumPay",
        "Job.payType",
        "Job.exactPay",
        "Job.payRate",
        "Job.jobDescription",
        "Job.numberOfPeople",
        "Job.mobileNumber",
        "Job.email",
        "Job.deadline",
        "Job.deadlineDate",
        "Job.status",
        "Job.experience",
        "Job.createdAt",
        "Job.updatedAt",
        "Job.employer.id",
        "Job.employer.companyName",
        "Job.employer->reviews.id",
      ],
    });

    if (process.env.DEV_TYPE === "local") {
      // Parse JSON fields for each job
      jobs.forEach((job) => {
        job.jobTypes = JSON.parse(job.jobTypes);
        job.skills = JSON.parse(job.skills);
        job.languages = JSON.parse(job.languages);
        job.education = JSON.parse(job.education);
      });
    }

    // Construct pagination metadata
    const totalPages = Math.ceil(count / limit);
    const currentPage = parseInt(page);

    sendSuccessResponse(res, { jobs, totalPages, currentPage });
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    sendErrorResponse(res, "Error retrieving jobs", 500);
  }
};

const getPastDate = (datePosted) => {
  const currentDate = new Date();
  switch (datePosted.toLowerCase()) {
    case "last 14 hours":
      return new Date(currentDate.getTime() - 14 * 60 * 60 * 1000);
    case "last 3 days":
      return new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    case "last 7 days":
      return new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "last 14 days":
      return new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendErrorResponse(res, { message: "Job not found" }, 404);
    }
    if (process.env.DEV_TYPE === "local") {
      // Parse jobTypes field
      job.jobTypes = JSON.parse(job.jobTypes);
      job.languages = JSON.parse(job.languages);
      job.skills = JSON.parse(job.skills);
      job.education = JSON.parse(job.education);
    }

    sendSuccessResponse(res, { job });
  } catch (error) {
    console.error("Error retrieving job:", error);
    sendErrorResponse(res, { message: "Error retrieving job" }, 500);
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
        return sendErrorResponse(res, { message: "Job not found" }, 404);
      }
      await job.destroy();
      sendSuccessResponse(res, { message: "Job deleted successfully" });
    } catch (error) {
      console.error("Error deleting job:", error);
      sendErrorResponse(res, { message: "Error deleting job" }, 500);
    }
  },
];
