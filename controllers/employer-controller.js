const {
  Employer,
  AppliedJob,
  Job,
  Employee,
  sequelize,
  JobPreferences,
  Language,
  Skill,
  Experience,
  Education,
  Resume,
  Roles,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const {
  hashPassword,
  comparePassword,
  generateJWTToken,
} = require("../utils/passwordUtils");
const { registerSchema } = require("../validators/employerValidator");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const { ensureEmployer } = require("../middleware/ensureEmployer");
const s3 = require("../utils/aws-config");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Register new employer
exports.registerOrLoginEmployer = async (req, res) => {
  try {
    // Validate request body against Joi schema
    const { error, value } = registerSchema.validate(req.body);

    // If validation fails, return error response
    if (error) {
      return sendErrorResponse(res, { message: error.details[0].message }, 400);
    }

    const { fullName, email, password } = value; // Use validated values from Joi

    const existingEmployer = await Employer.findOne({ where: { email } });
    if (existingEmployer) {
      // Email exists, validate password for login
      const isPasswordValid = await comparePassword(
        password,
        existingEmployer.password
      );
      if (!isPasswordValid) {
        return sendErrorResponse(res, { message: "Invalid password" }, 400);
      }

      // Generate token for existing employee
      const token = await generateJWTToken({
        employerId: existingEmployer.id,
        userType: "employer",
      });

      return sendSuccessResponse(
        res,
        {
          message: "Logged in successfully",
          userType: "employer",
          employer: existingEmployer,
          token,
        },
        200
      );
    }

    // Email does not exist, proceed with registration
    const hashedPassword = await hashPassword(password);

    const payload = {
      fullName,
      email,
      password: hashedPassword,
    };

    const newEmployer = await Employer.create(payload);

    // Generate token for new employee
    const token = await generateJWTToken({
      employerId: newEmployer.id,
      userType: "employer",
    });

    sendSuccessResponse(
      res,
      {
        message: "Registered successfully",
        userType: "employer",
        employer: newEmployer,
        token,
      },
      201
    );
  } catch (error) {
    console.error("Error registering or logging in employer:", error);
    sendErrorResponse(
      res,
      { message: "Error registering or logging in employer" },
      500
    );
  }
};

// Update employer profile
exports.updateProfile = [
  ensureEmployer,
  async (req, res) => {
    try {
      // Validate request body against Joi schema

      const { employerId } = req.user;
      const value = req.body;
      // Find the employer by ID
      let employer = await Employer.findByPk(employerId);

      // If employer not found, return error
      if (!employer) {
        return sendErrorResponse(res, { message: "Employer not found" }, 404);
      }

      // Update only the fields provided in the request body
      Object.keys(value).forEach((key) => {
        if (value[key] !== "") employer[key] = value[key];
      });
      const imgUrl = req.body.imageUrl;

      if (employer.profile) {
        const oldKey = employer.profile.split("/").pop();
        if (oldKey !== req.body.fileName) {
          // Extract file name from S3 URL
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `images/${oldKey}`,
          };
          try {
            await s3.send(new DeleteObjectCommand(deleteParams));
            console.log("Delete successfully");
          } catch (deleteError) {
            console.error("Error deleting old resume from S3:", deleteError);
            return res.status(500).send("Error deleting old resume from S3");
          }
        }
      }
      employer.profile = imgUrl ? imgUrl : employer.profile;

      // Save the updated employer
      await employer.save();

      sendSuccessResponse(res, { employer }, 200);
    } catch (error) {
      console.error("Error updating employer profile:", error);
      sendErrorResponse(
        res,
        { message: "Error updating employer profile" },
        500
      );
    }
  },
];

// Get employer profile
exports.getProfile = [
  ensureEmployer,
  async (req, res) => {
    try {
      // Get employer ID from authenticated user (assuming it's stored in req.user.id)
      const { employerId } = req.user;

      // Find the employer by ID
      let employer = await Employer.findByPk(employerId);

      // If employer not found, return error
      if (!employer) {
        return sendErrorResponse(res, { message: "Employer not found" }, 404);
      }

      sendSuccessResponse(res, { employer }, 200);
    } catch (error) {
      console.error("Error fetching employer profile:", error);
      sendErrorResponse(
        res,
        { message: "Error fetching employer profile" },
        500
      );
    }
  },
];

// Update employer status for an applied job
exports.updateEmployerStatus = [
  ensureEmployer,
  async (req, res) => {
    try {
      const { appliedJobId } = req.params;
      const { employerStatus } = req.body;
      if (!employerStatus) {
        return sendErrorResponse(
          res,
          { message: "Please provide employer status" },
          400
        );
      }
      // Find the applied job by ID
      const appliedJob = await AppliedJob.findByPk(appliedJobId);
      if (!appliedJob) {
        return sendErrorResponse(
          res,
          { message: "Applied job not found" },
          404
        );
      }

      // Update the employer status
      await appliedJob.update({ employerStatus });

      sendSuccessResponse(res, { appliedJob }, 200);
    } catch (error) {
      console.error("Error updating employer status:", error);
      sendErrorResponse(
        res,
        { message: "Error updating employer status" },
        500
      );
    }
  },
];

// Get alive jobs by employer ID
exports.getJobsByEmployeeId = [
  ensureEmployer,
  async (req, res) => {
    const { employerId } = req.user;
    const { jobTitle, location, sortOrder, startDate, endDate } = req.body;

    try {
      const employee = await Employer.findByPk(employerId);
      if (!employee) {
        return sendErrorResponse(res, { message: "Employer not found" }, 404);
      }

      // Prepare filter conditions for jobs
      const filterConditions = {
        employerId: employerId,
        status: {
          [Op.in]: ["Open", "Paused"],
          // Filter by status = "Open" or "Paused"
        },
      };

      // Optional filters based on query parameters
      if (jobTitle) {
        filterConditions.jobTitle = {
          [Op.like]: `%${jobTitle}%`,
        };
      }
      if (location) {
        filterConditions.city = {
          [Op.like]: `%${location}%`,
        };
      }
      if (startDate && endDate) {
        filterConditions.createdAt = {
          [Op.between]: [startDate, endDate], // Assuming startDate and endDate are Date objects or ISO strings
        };
      }

      // Sorting options
      orderBy = [["createdAt", "ASC"]]; // Default sort by createdAt in ascending order
      if (sortOrder === "dsc") {
        orderBy = [["createdAt", "DESC"]]; // Default sort by createdAt in ascending order
      } else {
        orderBy = [["createdAt", "ASC"]]; // Default sort by createdAt in ascending order
      }

      // Query jobs with filters and sorting
      const jobs = await Job.findAll({
        where: filterConditions,
        order: orderBy,
      });
      if (process.env.DEV_TYPE === "local") {
        // Parse jobTypes field for each job (assuming jobTypes is stored as JSON)
        jobs.forEach((job) => {
          job.jobTypes = JSON.parse(job.jobTypes);
          job.skills = JSON.parse(job.skills);
          job.languages = JSON.parse(job.languages);
          job.education = JSON.parse(job.education);
        });
      }

      sendSuccessResponse(res, jobs);
    } catch (error) {
      console.error("Error retrieving jobs by employer ID:", error);
      sendErrorResponse(
        res,
        { message: "Error retrieving jobs by employer ID" },
        500
      );
    }
  },
];

// Get closed Jobs by employer id
exports.getClosedJobsByEmployeeId = [
  ensureEmployer,
  async (req, res) => {
    const { employerId } = req.user;

    try {
      const employer = await Employer.findByPk(employerId);
      if (!employer) {
        return sendErrorResponse(res, { message: "Employer not found" }, 404);
      }

      const jobs = await Job.findAll({
        where: {
          employerId,
          [Op.or]: [
            {
              deadline: "Yes",
              deadlineDate: { [Op.lt]: new Date() },
            },
            {
              status: "Closed",
            },
          ],
        },
      });
      if (process.env.DEV_TYPE === "local") {
        // Parse jobTypes field for each job
        jobs.forEach((job) => {
          job.jobTypes = JSON.parse(job.jobTypes);
          job.skills = JSON.parse(job.skills);
          job.languages = JSON.parse(job.languages);
          job.education = JSON.parse(job.education);
        });
      }
      sendSuccessResponse(res, jobs);
    } catch (error) {
      console.error("Error retrieving closed jobs by employer ID:", error);
      sendErrorResponse(
        res,
        { message: "Error retrieving closed jobs by employer ID" },
        500
      );
    }
  },
];

// Get applicants for a specific job
exports.getApplicant = [
  ensureEmployer,
  async (req, res) => {
    const { jobId } = req.params;

    try {
      // Find the job by ID
      const job = await Job.findByPk(jobId);

      if (!job) {
        return sendErrorResponse(res, { message: "Job not found" }, 404);
      }

      // Retrieve applicants for the job
      const applicants = await AppliedJob.findAll({
        attributes: ["id", "applicationDate", "employerStatus"],
        where: { jobId },
        include: [
          {
            attributes: [
              "id",
              "firstName",
              "lastName",
              "phoneNumber",
              "city",
              "area",
              "pincode",
              "streetAddress",
              "role",
              "email",
            ],
            model: Employee,
            as: "employee",
          },
        ],
      });

      sendSuccessResponse(res, applicants);
    } catch (error) {
      console.error("Error retrieving applicants for job:", error);
      sendErrorResponse(
        res,
        { message: "Error retrieving applicants for job" },
        500
      );
    }
  },
];

// Update job status
exports.updateJobStatus = [
  ensureEmployer,
  async (req, res) => {
    try {
      const { jobId } = req.params;
      const { status } = req.body;

      // Validate status
      if (!["Open", "Paused", "Closed"].includes(status)) {
        return sendErrorResponse(res, { message: "Invalid status" }, 400);
      }

      // Find the job by ID
      const job = await Job.findByPk(jobId);
      if (!job) {
        return sendErrorResponse(res, { message: "Job not found" }, 404);
      }

      // Update only the status field
      await job.update({ status });

      sendSuccessResponse(
        res,
        {
          message: "Status Updated!!",
        },
        200
      );
    } catch (error) {
      console.error("Error updating job status:", error);
      sendErrorResponse(res, { message: "Error updating job status" }, 500);
    }
  },
];

// Search employees by role and/or city
exports.searchEmployees = [
  ensureEmployer,
  async (req, res) => {
    const { role, city } = req.query;
    try {
      let whereClause = {};

      // Build the where clause based on provided parameters
      if (role && city) {
        whereClause = {
          [Op.or]: [
            { role: { [Op.like]: `%${role}%` } },
            { city: { [Op.like]: `%${city}%` } },
          ],
        };
      } else if (role) {
        whereClause = {
          role: { [Op.like]: `%${role}%` },
        };
      } else if (city) {
        whereClause = {
          city: { [Op.like]: `%${city}%` },
        };
      } else {
        return sendErrorResponse(
          res,
          { message: "Please provide at least one search parameter" },
          400
        );
      }

      // Perform the search
      const employees = await Employee.findAll({
        where: whereClause,
        attributes: [
          "id",
          "firstName",
          "lastName",
          "phoneNumber",
          "city",
          "role",
        ],
        include: [
          {
            model: Experience,
            as: "experiences",
          },
          {
            model: Education,
            as: "educations",
          },
          {
            model: Skill,
            as: "skills",
          },
          {
            model: Language,
            as: "languages",
          },
          {
            model: JobPreferences,
            as: "jobPreferences",
          },
        ],
      });
      if (process.env.DEV_TYPE === "local") {
        // Parse JSON fields for jobPreferences for each employee
        employees.forEach((employee) => {
          if (employee.jobPreferences) {
            employee.jobPreferences.jobTitles = JSON.parse(
              employee.jobPreferences.jobTitles
            );
            employee.jobPreferences.jobTypes = JSON.parse(
              employee.jobPreferences.jobTypes
            );
            employee.jobPreferences.workDays = JSON.parse(
              employee.jobPreferences.workDays
            );
            employee.jobPreferences.shifts = JSON.parse(
              employee.jobPreferences.shifts
            );
          }
        });
      }

      sendSuccessResponse(res, employees);
    } catch (error) {
      console.error("Error searching employees:", error);
      sendErrorResponse(res, { message: "Error searching employees" }, 500);
    }
  },
];

// Get details of an application by application ID
exports.getApplicationDetailsById = [
  ensureEmployer,
  async (req, res) => {
    const { appliedJobId } = req.params;

    try {
      // Find the applied job by ID
      const appliedJob = await AppliedJob.findByPk(appliedJobId, {
        include: [
          {
            model: Job,
            as: "job",
          },
          {
            model: Employee,
            as: "employee",
            attributes: [
              "id",
              "email",
              "firstName",
              "lastName",
              "phoneNumber",
              "city",
              "role",
            ],
            include: [
              {
                model: Experience,
                as: "experiences",
              },
              {
                model: Education,
                as: "educations",
              },
              {
                model: Skill,
                as: "skills",
              },
              {
                model: Language,
                as: "languages",
              },
              {
                model: JobPreferences,
                as: "jobPreferences",
              },
              {
                model: Resume,
                as: "resume",
              },
            ],
          },
        ],
      });

      if (!appliedJob) {
        return sendErrorResponse(
          res,
          { message: "Application not found" },
          404
        );
      }
      // Parse jobTypes field for each job
      if (process.env.DEV_TYPE === "local") {
        appliedJob.job.jobTypes = JSON.parse(appliedJob.job.jobTypes);
        appliedJob.job.skills = JSON.parse(appliedJob.job.skills);
        appliedJob.job.languages = JSON.parse(appliedJob.job.languages);
        appliedJob.job.education = JSON.parse(appliedJob.job.education);
      }
      sendSuccessResponse(res, appliedJob);
    } catch (error) {
      console.error("Error retrieving application details:", error);
      sendErrorResponse(
        res,
        { message: "Error retrieving application details" },
        500
      );
    }
  },
];

// Get all jobs by employer ID and total count of applicants
exports.getAllJobsWithApplicantsCount = [
  ensureEmployer,
  async (req, res) => {
    const { employerId } = req.user;

    try {
      const jobs = await Job.findAll({
        where: { employerId },
        attributes: [
          "id",
          "jobTitle",
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM \`AppliedJobs\` AS \`appliedJobs\`
              WHERE \`appliedJobs\`.\`jobId\` = \`Job\`.\`id\`
            )`),
            "applicantsCount",
          ],
        ],
      });

      sendSuccessResponse(res, jobs);
    } catch (error) {
      console.error("Error retrieving jobs by employer ID:", error);
      sendErrorResponse(
        res,
        { message: "Error retrieving jobs by employer ID" },
        500
      );
    }
  },
];

// Get all applied count  by employerId
exports.getCountOfApplicantHired = async (req, res) => {
  const { employerId } = req.user;

  try {
    // Step 1: Fetch jobs for the given employerId
    const jobs = await Job.findAll({
      where: { employerId },
      attributes: ["id"], // Fetch only job IDs
    });

    // Extract job IDs from the jobs
    const jobIds = jobs.map((job) => job.id);

    // Step 2: Fetch counts of all application statuses for the fetched job IDs
    const counts = await AppliedJob.findAll({
      attributes: [
        "employerStatus",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      where: {
        jobId: {
          [Op.in]: jobIds,
        },
        employerStatus: {
          [Op.in]: [
            "Applied",
            "Interviewing",
            "Offer received",
            "Not selected by employer",
            "No longer interested",
            "Hired",
          ],
        },
      },
      group: "employerStatus",
      raw: true,
    });

    // Initialize counts
    const statusCounts = {
      Applied: 0,
      Interviewing: 0,
      "Offer received": 0,
      "Not selected by employer": 0,
      "No longer interested": 0,
      Hired: 0,
    };

    // Aggregate counts
    let totalApplicationsCount = 0;
    counts.forEach((item) => {
      if (statusCounts.hasOwnProperty(item.employerStatus)) {
        const count = parseInt(item.count, 10);
        statusCounts[item.employerStatus] = count;
        totalApplicationsCount += count; // Sum up all application counts
      }
    });

    // Separate hiredCount from otherStatusCounts
    const { Hired: hiredCount } = statusCounts;

    // Step 3: Create the response object
    const result = {
      hiredCount,
      totalApplicationsCount, // Include total applications count
    };

    // Step 4: Send the response
    sendSuccessResponse(res, { status: true, count: result }, 200);
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, { message: "Internal Server Error" }, 400);
  }
};
exports.getSkillsByRole = async (req, res) => {
  const { roleName } = req.params;
  try {
    // Find the role by name
    const role = await Roles.findOne({
      where: {
        role: {
          [Op.like]: `%${roleName}%`, // Using LIKE operator for partial matching
        },
      },
    });

    if (!role) {
      return sendErrorResponse(res, "Role not found", 500);
    }

    return sendSuccessResponse(res, { data: role }, 200);
  } catch (error) {
    console.error("Error retrieving skills:", error);
    return sendErrorResponse(res, "Error retrieving skills", 500);
  }
};
