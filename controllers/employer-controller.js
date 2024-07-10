const { Employer } = require("../models");
const {
  hashPassword,
  comparePassword,
  generateJWTToken,
} = require("../utils/passwordUtils");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validators/employerValidator");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Register new employer
exports.registerEmployee = async (req, res) => {
  try {
    // Validate request body against Joi schema
    const { error, value } = registerSchema.validate(req.body);

    // If validation fails, return error response
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
    }

    const { fullName, email, password } = value; // Use validated values from Joi

    const hashedPassword = await hashPassword(password);

    let newEmployee;
    try {
      // Check if email already exists
      const existingEmployee = await Employer.findOne({ where: { email } });
      if (existingEmployee) {
        return sendErrorResponse(res, "Email already exists", 400);
      }

      const payload = {
        fullName,
        email,
        password: hashedPassword,
      };

      // Create new employer if email is not found
      newEmployee = await Employer.create(payload);
    } catch (error) {
      console.error("Error creating employer in database:", error);
      return sendErrorResponse(res, "Error creating employer in database", 500);
    }

    const token = await generateJWTToken(newEmployee.id); // Assuming newEmployee has id field

    sendSuccessResponse(res, { employer: newEmployee, token }, 201);
  } catch (error) {
    console.error("Error registering employer:", error);
    sendErrorResponse(res, "Error registering employer", 500);
  }
};

// Login employer
exports.loginEmployee = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
    }

    const { email, password } = req.body;
    let employer;
    try {
      employer = await Employer.findOne({ where: { email } });
    } catch (error) {
      console.error("Error querying employer in database:", error);
      return sendErrorResponse(res, "Error querying employer in database", 500);
    }

    if (!employer) {
      return sendErrorResponse(res, "Employer not found", 404);
    }

    let isPasswordValid;
    try {
      isPasswordValid = await comparePassword(password, employer.password);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return sendErrorResponse(res, "Error comparing passwords", 500);
    }

    if (!isPasswordValid) {
      return sendErrorResponse(res, "Invalid password", 401);
    }

    const token = await generateJWTToken(employer.id);

    sendSuccessResponse(res, { token }, 200);
  } catch (error) {
    console.error("Error logging in employer:", error);
    sendErrorResponse(res, "Error logging in employer", 500);
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
    const { employeeId } = req.user;
console.log(employeeId)
    // Find the employer by ID
    let employer = await Employer.findByPk(employeeId);

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
    const { employeeId } = req.user;

    // Find the employer by ID
    let employer = await Employer.findByPk(employeeId);

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
