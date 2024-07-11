const { Employer, AppliedJob, Job, Employee } = require("../models");
const {
  hashPassword,
  comparePassword,
  generateJWTToken,
} = require("../utils/passwordUtils");
const {
  registerSchema,
  updateProfileSchema,
} = require("../validators/employerValidator");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");
const { Op } = require("sequelize");

// Register new employer
exports.registerOrLoginEmployer = async (req, res) => {
  try {
    // Validate request body against Joi schema
    const { error, value } = registerSchema.validate(req.body);

    // If validation fails, return error response
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
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
        return sendErrorResponse(res, "Invalid password", 400);
      }

      // Generate token for existing employee
      const token = await generateJWTToken({ employerId: existingEmployer.id });

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
    const token = await generateJWTToken({ employerId: newEmployer.id });

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
    sendErrorResponse(res, "Error registering or logging in employer", 500);
  }
};

// Update employer profile
exports.updateProfile = async (req, res) => {
  try {
    // Validate request body against Joi schema
    const { error, value } = updateProfileSchema.validate(req.body);

    // If validation fails, return error response
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
    }

    const {
      fullName,
      companyName,
      numberOfEmployees,
      howHeard,
      hiringManager,
      phoneNumber,
    } = value; // Use validated values from Joi

    // Get employer ID from authenticated user (assuming it's stored in req.user.id)
    const { employerId } = req.user;
    console.log(req.user);
    // Find the employer by ID
    let employer = await Employer.findByPk(employerId);

    // If employer not found, return error
    if (!employer) {
      return sendErrorResponse(res, "Employer not found", 404);
    }

    // Update employer's profile fields
    employer.fullName = fullName;
    employer.companyName = companyName;
    employer.numberOfEmployees = numberOfEmployees;
    employer.howHeard = howHeard;
    employer.hiringManager = hiringManager;
    employer.phoneNumber = phoneNumber;

    // Save the updated employer
    await employer.save();

    sendSuccessResponse(res, { employer }, 200);
  } catch (error) {
    console.error("Error updating employer profile:", error);
    sendErrorResponse(res, "Error updating employer profile", 500);
  }
};

// Get employer profile
exports.getProfile = async (req, res) => {
  try {
    // Get employer ID from authenticated user (assuming it's stored in req.user.id)
    const { employerId } = req.user;

    // Find the employer by ID
    let employer = await Employer.findByPk(employerId);

    // If employer not found, return error
    if (!employer) {
      return sendErrorResponse(res, "Employer not found", 404);
    }

    sendSuccessResponse(res, { employer }, 200);
  } catch (error) {
    console.error("Error fetching employer profile:", error);
    sendErrorResponse(res, "Error fetching employer profile", 500);
  }
};

// Update employer status for an applied job
exports.updateEmployerStatus = async (req, res) => {
  try {
    const { appliedJobId } = req.params;
    const { employerStatus } = req.body;

    // Find the applied job by ID
    const appliedJob = await AppliedJob.findByPk(appliedJobId);
    if (!appliedJob) {
      return sendErrorResponse(res, "Applied job not found", 404);
    }

    // Update the employer status
    await appliedJob.update({ employerStatus });

    sendSuccessResponse(res, { appliedJob }, 200);
  } catch (error) {
    console.error("Error updating employer status:", error);
    sendErrorResponse(res, "Error updating employer status", 500);
  }
};

// Get alive jobs by employer ID
exports.getJobsByEmployeeId = async (req, res) => {
  const { employerId } = req.user;
  console.log(employerId);
  try {
    const employee = await Employer.findByPk(employerId);
    if (!employee) {
      return sendErrorResponse(res, "Employer not found", 404);
    }

    const jobs = await Job.findAll({
      where: {
        employerId: employerId, // Assuming the foreign key is employerId in the Job model
        status: {
          [Op.in]: ["Open", "Paused"], // Filter by status = "Open" or "Paused"
        },
        [Op.or]: [
          { deadline: "No" },
          { deadlineDate: { [Op.gt]: new Date() } },
        ],
      },
    });

    // Parse jobTypes field for each job
    jobs.forEach((job) => {
      job.jobTypes = JSON.parse(job.jobTypes);
    });

    sendSuccessResponse(res, jobs);
  } catch (error) {
    console.error("Error retrieving jobs by employee ID:", error);
    sendErrorResponse(res, "Error retrieving jobs by employee ID");
  }
};

// Get closed Jobs by employer id
exports.getClosedJobsByEmployeeId = async (req, res) => {
  const { employerId } = req.user;

  try {
    const employer = await Employer.findByPk(employerId);
    if (!employer) {
      return sendErrorResponse(res, "Employer not found", 404);
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

    // Parse jobTypes field for each job
    jobs.forEach((job) => {
      job.jobTypes = JSON.parse(job.jobTypes);
    });

    sendSuccessResponse(res, jobs);
  } catch (error) {
    console.error("Error retrieving closed jobs by employer ID:", error);
    sendErrorResponse(res, "Error retrieving closed jobs by employer ID");
  }
};

// Get applicants for a specific job
exports.getApplicant = async (req, res) => {
  const { jobId } = req.params;

  try {
    // Find the job by ID
    const job = await Job.findByPk(jobId);

    if (!job) {
      return sendErrorResponse(res, "Job not found", 404);
    }

    // Retrieve applicants for the job
    const applicants = await AppliedJob.findAll({
      attributes: ["id", "applicationDate", "employerStatus"],
      // include: [
      //   {
      //     model: Job,
      //     as: "job",
      //     where: { id: jobId }, // Filter by the specific job ID
      //   },
      // ],
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
    sendErrorResponse(res, "Error retrieving applicants for job", 500);
  }
};

// Update job status
exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["Open", "Paused", "Closed"].includes(status)) {
      return sendErrorResponse(res, "Invalid status", 400);
    }

    // Find the job by ID
    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendErrorResponse(res, "Job not found", 404);
    }

    // Update job status
    job.status = status;
    await job.save();

    sendSuccessResponse(
      res,
      {
        message: "Status Updated!!",
      },
      200
    );
  } catch (error) {
    console.error("Error updating job status:", error);
    sendErrorResponse(res, "Error updating job status", 500);
  }
};
// Search employees by role and/or city
exports.searchEmployees = async (req, res) => {
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
        "Please provide at least one search parameter",
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
    });

    sendSuccessResponse(res, employees);
  } catch (error) {
    console.error("Error searching employees:", error);
    sendErrorResponse(res, "Error searching employees", 500);
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  const { appliedJobId } = req.params;

  try {
    // Find the applied job by ID
    const appliedJob = await AppliedJob.findByPk(appliedJobId, {
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "phoneNumber",
            "city",
            "role",
          ],
        },
      ],
    });

    if (!appliedJob) {
      return sendErrorResponse(res, "Application not found", 404);
    }

    sendSuccessResponse(res, appliedJob);
  } catch (error) {
    console.error("Error retrieving application:", error);
    sendErrorResponse(res, "Error retrieving application", 500);
  }
};

// Get details of an application by application ID
exports.getApplicationDetailsById = async (req, res) => {
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
            "firstName",
            "lastName",
            "phoneNumber",
            "city",
            "role",
          ],
        },
      ],
    });
    // Parse jobTypes field for each job
    appliedJob.job.jobTypes = JSON.parse(appliedJob.job.jobTypes);

    if (!appliedJob) {
      return sendErrorResponse(res, "Application not found", 404);
    }

    sendSuccessResponse(res, appliedJob);
  } catch (error) {
    console.error("Error retrieving application details:", error);
    sendErrorResponse(res, "Error retrieving application details", 500);
  }
};
