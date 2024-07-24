// validators/employeeValidator.js

const Joi = require("joi");

exports.registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^\d{10}$/)
    .optional(), // Assuming phone number is a 10-digit string
  city: Joi.string().trim().optional(),
  area: Joi.string().trim().optional(),
  pincode: Joi.string().trim().optional(),
  role: Joi.string().trim().optional(),
  streetAddress: Joi.string().trim().optional(),
});
