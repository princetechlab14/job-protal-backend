// controllers/employeeController.js

const { Op, Sequelize } = require("sequelize");
const { Employee, SavedJob, Job, AppliedJob, Employer } = require("../models");
const {
  hashPassword,
  comparePassword,
  generateJWTToken,
} = require("../utils/passwordUtils");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const {
  registerSchema,
  updateProfileSchema,
} = require("../validators/employeeValidation");

// Middleware to check if the user is an employee
const ensureEmployee = (req, res, next) => {
  if (req.user.userType !== "employee") {
    return sendErrorResponse(res, "Employer cannot access this API", 403);
  }
  next();
};

// Register new employee or login
exports.registerOrLoginEmployee = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return sendErrorResponse(
        res,
        error.details.map((err) => err.message).join(", "),
        400
      );
    }

    const { email, password } = value;

    const existingEmployee = await Employee.findOne({
      where: { email, status: true },
    });
    if (existingEmployee) {
      const isPasswordValid = await comparePassword(
        password,
        existingEmployee.password
      );
      if (!isPasswordValid) {
        return sendErrorResponse(res, "Invalid password", 400);
      }

      const token = await generateJWTToken({
        employeeId: existingEmployee.id,
        userType: "employee",
      });

      return sendSuccessResponse(
        res,
        {
          message: "Logged in successfully",
          userType: "employee",
          employee: existingEmployee,
          token,
        },
        200
      );
    }

    const hashedPassword = await hashPassword(password);

    const newEmployee = await Employee.create({
      ...value,
      password: hashedPassword,
    });

    const token = await generateJWTToken({
      employeeId: newEmployee.id,
      userType: "employee",
    });

    sendSuccessResponse(
      res,
      {
        message: "Registered successfully",
        userType: "employee",
        employee: newEmployee,
        token,
      },
      201
    );
  } catch (error) {
    console.error("Error registering or logging in employee:", error);
    sendErrorResponse(res, "Error registering or logging in employee", 500);
  }
};

// Update employee profile
exports.updateProfile = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { error, value } = updateProfileSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        return sendErrorResponse(res, error.details[0].message, 400);
      }

      const { employeeId } = req.user;

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return sendErrorResponse(res, "Employee not found", 404);
      }

      // Update only the fields provided in the request body
      Object.keys(value).forEach((key) => {
        employee[key] = value[key];
      });

      await employee.save();

      sendSuccessResponse(res, { employee }, 200);
    } catch (error) {
      console.error("Error updating employee profile:", error);
      sendErrorResponse(res, "Error updating employee profile", 500);
    }
  },
];

// Get employee profile
exports.getProfile = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const employee = await Employee.findByPk(employeeId);

      if (!employee) {
        return sendErrorResponse(res, "Employee not found", 404);
      }

      sendSuccessResponse(res, { employee }, 200);
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      sendErrorResponse(res, "Error fetching employee profile", 500);
    }
  },
];

// Save a job
exports.saveJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { jobId } = req.body;

      const job = await Job.findByPk(jobId);
      if (!job) {
        return sendErrorResponse(res, "Job not found", 404);
      }

      const existingSavedJob = await SavedJob.findOne({
        where: { employeeId, jobId },
      });
      if (existingSavedJob) {
        return sendErrorResponse(res, "Job already saved", 400);
      }

      const savedJob = await SavedJob.create({
        employeeId,
        jobId,
      });

      sendSuccessResponse(res, { savedJob }, 201);
    } catch (error) {
      console.error("Error saving job:", error);
      sendErrorResponse(res, "Error saving job", 500);
    }
  },
];  

// Apply for a job
exports.applyJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { jobId, jobTitle, companyName, availableDates, experience } =
        req.body;
      const cv = req.body.cvBase64;

      const job = await Job.findByPk(jobId);
      if (!job) {
        return sendErrorResponse(res, "Job not found", 404);
      }

      const existingAppliedJob = await AppliedJob.findOne({
        where: { employeeId, jobId },
      });
      if (existingAppliedJob) {
        return sendErrorResponse(res, "Job already applied for", 400);
      }

      const appliedJob = await AppliedJob.create({
        employeeId,
        jobId,
        jobTitle,
        companyName,
        availableDates,
        experience,
        cv,
      });

      sendSuccessResponse(res, { appliedJob }, 201);
    } catch (error) {
      console.error("Error applying for job:", error);
      sendErrorResponse(res, "Error applying for job", 500);
    }
  },
];

// Update employee status for an applied job
exports.updateEmployeeStatus = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { appliedJobId } = req.params;
      const { employeeStatus } = req.body;

      const appliedJob = await AppliedJob.findByPk(appliedJobId);
      if (!appliedJob) {
        return sendErrorResponse(res, "Applied job not found", 404);
      }

      await appliedJob.update({ employeeStatus });

      sendSuccessResponse(res, { appliedJob }, 200);
    } catch (error) {
      console.error("Error updating employee status:", error);
      sendErrorResponse(res, "Error updating employee status", 500);
    }
  },
];

// Remove applied job
exports.removeAppliedJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { appliedJobId } = req.params;

      const appliedJob = await AppliedJob.findByPk(appliedJobId);
      if (!appliedJob) {
        return sendErrorResponse(res, "Applied job not found", 404);
      }

      await appliedJob.destroy();

      sendSuccessResponse(
        res,
        { message: "Applied job removed successfully" },
        200
      );
    } catch (error) {
      console.error("Error removing applied job:", error);
      sendErrorResponse(res, "Error removing applied job", 500);
    }
  },
];

// Get all applied jobs by employee
exports.getAllAppliedJobs = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;

      const appliedJobs = await AppliedJob.findAll({
        where: { employeeId },
        attributes: [
          "id",
          "applicationDate",
          "employeeStatus",
          "employerStatus",
        ],
        include: [
          {
            model: Job,
            as: "job",
            attributes: ["id", "jobTitle", "city", "area", "streetAddress"],
            include: {
              model: Employer,
              as: "employer",
              attributes: ["companyName"],
            },
          },
        ],
      });

      appliedJobs.forEach((appliedJob) => {
        const { job } = appliedJob;
        if (job && job.jobTypes) {
          job.jobTypes = JSON.parse(job.jobTypes);
          job.skills = JSON.parse(job.skills);
          job.languages = JSON.parse(job.languages);
        }
      });

      sendSuccessResponse(res, { appliedJobs }, 200);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      sendErrorResponse(res, "Error fetching applied jobs", 500);
    }
  },
];

// Get all saved jobs by employee
exports.getAllSavedJobs = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;

      const savedJobs = await SavedJob.findAll({
        where: { employeeId },
        include: [{ model: Job, as: "job" }],
      });

      savedJobs.forEach((savedJob) => {
        const { job } = savedJob;
        if (job && job.jobTypes) {
          job.jobTypes = JSON.parse(job.jobTypes);
          job.skills = JSON.parse(job.skills);
          job.languages = JSON.parse(job.languages);
        }
      });

      sendSuccessResponse(res, { savedJobs }, 200);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      sendErrorResponse(res, "Error fetching saved jobs", 500);
    }
  },
];

// get average salary
exports.getFilteredJobsWithSalary = [
  ensureEmployee,
  async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default page is 1, limit is 10 per page
    const { jobTitle, location } = req.body;
    const offset = (page - 1) * limit;

    // Construct the where clause for filtering
    const whereClause = {
      status: "Open", // Filter by status = "Open"
    };

    // Filter by jobTitle with partial matching
    if (jobTitle) {
      whereClause[Op.and] = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("jobTitle")),
        "LIKE",
        `%${jobTitle.toLowerCase()}%`
      );
    }

    // Filter by location (city or state)
    if (location) {
      whereClause[Op.and] = [
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("city")),
          "LIKE",
          `%${location.toLowerCase()}%`
        ),
      ];
    }

    try {
      // Retrieve jobs based on the where clause
      const { count, rows: jobs } = await Job.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
      });
      // // Parse JSON fields for each job
      jobs.forEach((job) => {
        job.jobTypes = JSON.parse(job.jobTypes);
        job.skills = JSON.parse(job.skills);
        job.languages = JSON.parse(job.languages);
        job.education = JSON.parse(job.education);
      });

      // Calculate average salary
      const salaries = jobs
        .map((job) => {
          if (job.payType === "Range") {
            return (job.minimumPay + job.maximumPay) / 2;
          } else if (job.payType === "Exact") {
            return job.exactPay;
          }
          return 0;
        })
        .filter((salary) => salary > 0);

      const totalSalary = salaries.reduce((acc, salary) => acc + salary, 0);
      const averageSalary = totalSalary / salaries.length;

      // Convert the average salary to hourly, daily, and weekly rates
      const averageHourly = averageSalary / 2080; // 2080 working hours in a year (40 hours/week * 52 weeks)
      const averageDaily = averageSalary / 260; // 260 working days in a year (5 days/week * 52 weeks)
      const averageWeekly = averageSalary / 52; // 52 weeks in a year

      // Construct pagination metadata
      const totalPages = Math.ceil(count / limit);
      const currentPage = parseInt(page);

      sendSuccessResponse(res, {
        jobs,
        totalPages,
        currentPage,
        averageSalary: {
          yearly: averageSalary,
          hourly: averageHourly,
          daily: averageDaily,
          weekly: averageWeekly,
        },
      });
    } catch (error) {
      console.error("Error retrieving jobs:", error);
      sendErrorResponse(res, "Error retrieving jobs", 500);
    }
  },
];

// Unsaved a job
exports.unsavedJob = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { jobId } = req.params;

      const savedJob = await SavedJob.findOne({
        where: { employeeId, jobId },
      });
      if (!savedJob) {
        return sendErrorResponse(res, "Saved job not found", 404);
      }

      await savedJob.destroy();

      sendSuccessResponse(res, { message: "Job unsaved successfully" }, 200);
    } catch (error) {
      console.error("Error unsaving job:", error);
      sendErrorResponse(res, "Error unsaving job", 500);
    }
  },
];
