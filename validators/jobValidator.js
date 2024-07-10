const Joi = require("joi");

exports.jobSchema = Joi.object({
  jobTitle: Joi.string().required(),
  jobLocation: Joi.string().valid("On-site", "Remote").required(),
  specificCity: Joi.string(),
  advertiseCity: Joi.string().required(),
  city: Joi.string().required(),
  area: Joi.string().required(),
  pincode: Joi.string().required(),
  streetAddress: Joi.string().required(),
  jobTypes: Joi.array()
    .items(
      Joi.string().valid(
        "Full-time",
        "Permanent",
        "Fresher",
        "Part-time",
        "Internship",
        "Temporary",
        "Freelance",
        "Volunteer"
      )
    )
    .required(),
  minimumPay: Joi.number().integer().allow(null),
  maximumPay: Joi.number().integer().allow(null),
  payType: Joi.string().valid("Exact", "Range").allow(null),
  exactPay: Joi.number().integer().allow(null),
  payRate: Joi.string()
    .valid("per hour", "per day", "per month", "per year")
    .allow(null),
  jobDescription: Joi.string().required(),
  numberOfPeople: Joi.number().integer().required(),
  mobileNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  deadline: Joi.string().required(),
  deadlineDate: Joi.date().allow(null),
});
