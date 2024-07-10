// validators/employeeValidator.js

const Joi = require("joi");

exports.registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^\d{10}$/), // Assuming phone number is a 10-digit string
  city: Joi.string().trim(),
  area: Joi.string().trim(),
  pincode: Joi.string().trim(),
  streetAddress: Joi.string().trim(),
});
