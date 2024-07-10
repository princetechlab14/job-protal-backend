// controllers/employeeController.js

const { Employee } = require("../models");
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
  loginSchema,
  updateProfileSchema,
} = require("../validators/employeeValidation");

// Register new employee
exports.registerEmployee = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
    }

    const hashedPassword = await hashPassword(value.password);

    const newEmployee = await Employee.create({
      ...value,
      password: hashedPassword,
    });

    const token = await generateJWTToken(newEmployee.id);

    sendSuccessResponse(res, { employee: newEmployee, token }, 201);
  } catch (error) {
    console.error("Error registering employee:", error);
    sendErrorResponse(res, "Error registering employee", 500);
  }
};

// Login employee
exports.loginEmployee = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return sendErrorResponse(res, error.details[0].message, 400);
    }

    const { email, password } = value;

    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      return sendErrorResponse(res, "Employee not found", 404);
    }

    const isPasswordValid = await comparePassword(password, employee.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, "Invalid password", 401);
    }

    const token = await generateJWTToken(employee.id);

    sendSuccessResponse(res, { token }, 200);
  } catch (error) {
    console.error("Error logging in employee:", error);
    sendErrorResponse(res, "Error logging in employee", 500);
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
