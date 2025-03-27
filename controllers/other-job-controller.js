const { OtherJob, OtherCategory } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

exports.getAllOtherJobs = async (req, res) => {
  try {
    const otherJobs = await OtherCategory.findAll({
      include: [{ model: OtherJob, as: "other_jobs" }],
      order: [["shorting", "ASC"], ["createdAt", "DESC"]],
    });

    sendSuccessResponse(res, { otherJobs });
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    sendErrorResponse(res, "Error retrieving jobs", 500);
  }
};

exports.getSingleOtherJobs = async (req, res) => {
  const { id } = req.params;
  try {
    const otherJob = await OtherJob.findOne({
      include: [{ model: OtherCategory, as: "other_category" }],
      where: { id }
    });
    if (!otherJob) return sendErrorResponse(res, { message: "Job record not found" }, 400);

    const otherCategoryJobs = await OtherJob.findAll({ where: { otherCategoryId: otherJob?.otherCategoryId || null } });
    sendSuccessResponse(res, { otherJob, otherCategoryJobs });
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    sendErrorResponse(res, "Error retrieving jobs", 500);
  }
};
