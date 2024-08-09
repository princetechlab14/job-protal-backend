const Joi = require("joi");

exports.jobSchema = Joi.object({
  jobTitle: Joi.string().allow(""),
  jobLocation: Joi.string().valid("On-site", "Remote"),
  specificCity: Joi.string().allow(""),
  advertiseCity: Joi.string().allow(""),
  city: Joi.string().allow(""),
  state: Joi.string().allow(""),
  area: Joi.string().allow(""),
  pincode: Joi.string().allow(""),
  streetAddress: Joi.string().allow(""),
  jobTypes: Joi.array().items(
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
  ),
  skills: Joi.array().items(Joi.string()),
  languages: Joi.array(),
  education: Joi.array().items(Joi.string()),
  minimumPay: Joi.number().integer().allow(""),
  maximumPay: Joi.number().integer().allow(""),
  payType: Joi.string().valid("Exact amount", "Range").allow(""),
  exactPay: Joi.number().integer().allow(""),
  payRate: Joi.string()
    .valid("per hour", "per day", "per month", "per year")
    .allow(""),
  jobDescription: Joi.string().allow(""),
  numberOfPeople: Joi.number().integer().allow(""),
  mobileNumber: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  deadline: Joi.string().valid("Yes", "No").allow(""),
  experience: Joi.string().allow(""),
  deadlineDate: Joi.when("deadline", {
    is: "Yes",
    then: Joi.date().required(),
    otherwise: Joi.alternatives().try(
      Joi.date().allow(null),
      Joi.string().allow("")
    ),
  }),
});
