// validators/employeeValidator.js

const Joi = require("joi");

exports.registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  fullName: Joi.string().required(),
});

// Define Joi schema for updating employee profile
exports.updateProfileSchema = Joi.object({
  fullName: Joi.string(),
  companyName: Joi.string(),
  numberOfEmployees: Joi.string(),
  howHeard: Joi.string(),
  hiringManager: Joi.string(),
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^\d{10}$/), // Assuming phone number is a 10-digit string
});
