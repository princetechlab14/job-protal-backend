const { OtherJobApply, OtherJob } = require("../models");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/responseUtils");
const { otherJobApplySchema } = require("../validators/otherJobApplyValidator");

exports.otherJobApplyPost = async (req, res) => {
  try {
    const { error, value } = otherJobApplySchema.validate(req.body);
    if (error) return sendErrorResponse(res, { message: error.details[0].message }, 400);
    await OtherJobApply.create(value);
    sendSuccessResponse(res, { message: "Request send successfully" }, 201);
  } catch (error) {
    console.error("Error registering or logging in employer:", error);
    sendErrorResponse(res, { message: "Error registering or logging in employer" }, 500);
  }
};

exports.getAllOtherJobs = async (req, res) => {
  try {
    const otherJobs = await OtherJob.findAll({
      order: [["shorting", "ASC"], ["createdAt", "DESC"]],
      attributes: ["id", "title", "image", "link", "description", "short_desc", "shorting", "createdAt"],
    });
    sendSuccessResponse(res, otherJobs);
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    sendErrorResponse(res, "Error retrieving jobs", 500);
  }
};

exports.getSingleOtherJobs = async (req, res) => {
  const { id } = req.params;
  try {
    const otherJob = await OtherJob.findOne({ where: { id }, attributes: ["id", "title", "image", "link", "description", "short_desc", "shorting", "createdAt"] });
    if (!otherJob) return sendErrorResponse(res, { message: "Job record not found" }, 400);
    sendSuccessResponse(res, otherJob);
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    sendErrorResponse(res, "Error retrieving jobs", 500);
  }
};