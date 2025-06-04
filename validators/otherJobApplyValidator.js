const Joi = require('joi');

exports.otherJobApplySchema = Joi.object({
  otherJobId: Joi.number().integer().optional().allow(null),
  name: Joi.string().max(500).required(),
  birth_date: Joi.date().optional().allow(null),
  gender: Joi.string().valid('male', 'female').optional().allow(null),
  mobile_code: Joi.string().optional().allow(null, ''),
  mobile_no: Joi.string().optional().allow(null, ''),
  email: Joi.string().email().max(500).optional().allow(null, ''),
  job_title: Joi.string().max(500).optional().allow(null, ''),
  job_name: Joi.string().max(500).optional().allow(null, ''),
  income: Joi.string().max(500).optional().allow(null, ''),
  currency: Joi.string().max(500).optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  note: Joi.string().optional().allow(null, '')
});

