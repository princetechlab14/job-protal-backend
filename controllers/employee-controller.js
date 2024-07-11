// controllers/employeeController.js

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

// Register new employee
exports.registerOrLoginEmployee = async (req, res) => {
  try {
    // Validate request body against Joi schema
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });

    // If validation fails, return error response
    if (error) {
      return sendErrorResponse(
        res,
        error.details.map((err) => err.message).join(", "),
        400
      );
    }

    const { email, password } = value;

    // Check if the employee already exists
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      // Email exists, validate password for login
      const isPasswordValid = await comparePassword(
        password,
        existingEmployee.password
      );
      if (!isPasswordValid) {
        return sendErrorResponse(res, "Invalid password", 400);
      }

      // Generate token for existing employee
      const token = await generateJWTToken({ employeeId: existingEmployee.id });

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

    // Email does not exist, proceed with registration
    const hashedPassword = await hashPassword(password);

    const newEmployee = await Employee.create({
      ...value,
      password: hashedPassword,
    });

    // Generate token for new employee
    const token = await generateJWTToken({ employeeId: newEmployee.id });

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
exports.updateProfile = async (req, res) => {
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

    await employee.update(value);

    sendSuccessResponse(res, { employee }, 200);
  } catch (error) {
    console.error("Error updating employee profile:", error);
    sendErrorResponse(res, "Error updating employee profile", 500);
  }
};

// Get employee profile
exports.getProfile = async (req, res) => {
  try {
    const { employeeId } = req.user;
    console.log(req.user);
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      return sendErrorResponse(res, "Employee not found", 404);
    }

    sendSuccessResponse(res, { employee }, 200);
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    sendErrorResponse(res, "Error fetching employee profile", 500);
  }
};

// Save a job
exports.saveJob = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { jobId } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendErrorResponse(res, "Job not found", 404);
    }

    // Check if the job is already saved by the user
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
};

// Apply for a job
exports.applyJob = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { jobId, jobTitle, companyName, availableDates, experience } =
      req.body;
    const cv = req.body.cvBase64; // This will be set by the convertPdfToBase64 middleware

    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendErrorResponse(res, "Job not found", 404);
    }

    // Check if the job is already applied for by the user
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
};

// Update employee status for an applied job
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const { appliedJobId } = req.params;
    const { employeeStatus } = req.body;

    // Find the applied job by ID
    const appliedJob = await AppliedJob.findByPk(appliedJobId);
    if (!appliedJob) {
      return sendErrorResponse(res, "Applied job not found", 404);
    }

    // Update the employee status
    await appliedJob.update({ employeeStatus });

    sendSuccessResponse(res, { appliedJob }, 200);
  } catch (error) {
    console.error("Error updating employee status:", error);
    sendErrorResponse(res, "Error updating employee status", 500);
  }
};

// Remove applied job
exports.removeAppliedJob = async (req, res) => {
  try {
    const { appliedJobId } = req.params;

    // Find the applied job by ID
    const appliedJob = await AppliedJob.findByPk(appliedJobId);
    if (!appliedJob) {
      return sendErrorResponse(res, "Applied job not found", 404);
    }

    // Delete the applied job
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
};

// Get all applied jobs by employee
exports.getAllAppliedJobs = async (req, res) => {
  try {
    const { employeeId } = req.user;

    // Find all applied jobs for the employee including job details and employer details
    const appliedJobs = await AppliedJob.findAll({
      where: { employeeId },
      attributes: ["id", "applicationDate", "employeeStatus", "employerStatus"],
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

    // Parse jobTypes field for each job
    appliedJobs.forEach((appliedJob) => {
      const { job } = appliedJob;
      if (job && job.jobTypes) {
        job.jobTypes = JSON.parse(job.jobTypes); // Parse JSON string to object/array
      }
    });

    sendSuccessResponse(res, { appliedJobs }, 200);
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    sendErrorResponse(res, "Error fetching applied jobs", 500);
  }
};

// Get all saved jobs by employee
exports.getAllSavedJobs = async (req, res) => {
  try {
    const { employeeId } = req.user;

    // Find all saved jobs for the employee including job details
    const savedJobs = await SavedJob.findAll({
      where: { employeeId },
      include: [{ model: Job, as: "job" }],
    });

    // Parse jobTypes field for each job
    savedJobs.forEach((savedJob) => {
      const { job } = savedJob;
      if (job && job.jobTypes) {
        job.jobTypes = JSON.parse(job.jobTypes); // Parse JSON string to object/array
      }
    });

    sendSuccessResponse(res, { savedJobs }, 200);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    sendErrorResponse(res, "Error fetching saved jobs", 500);
  }
};
