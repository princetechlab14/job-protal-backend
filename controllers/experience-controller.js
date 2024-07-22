const db = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

exports.addOrUpdateExperience = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { id, jobTitle, companyName, startDate, endDate } = req.body;

    if (id) {
      // Update existing experience
      const experience = await db.Experience.findByPk(id);
      if (experience) {
        // Update only provided fields
        if (jobTitle !== undefined) experience.jobTitle = jobTitle;
        if (companyName !== undefined) experience.companyName = companyName;
        if (startDate !== undefined) experience.startDate = startDate;
        if (endDate !== undefined) experience.endDate = endDate;

        // Set employeeId only if it is not already set
        if (experience.employeeId === undefined)
          experience.employeeId = employeeId;

        await experience.save();
        return sendSuccessResponse(res, experience);
      } else {
        return sendErrorResponse(res, "Experience not found", 404);
      }
    } else {
      // Add new experience
      const newExperience = await db.Experience.create({
        jobTitle,
        companyName,
        startDate,
        endDate,
        employeeId,
      });
      return sendSuccessResponse(res, newExperience, 201);
    }
  } catch (error) {
    console.error("Error adding or updating experience:", error);
    return sendErrorResponse(res, error.message);
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;
    const experience = await db.Experience.findOne({
      where: { id, employeeId },
    });

    if (experience) {
      await experience.destroy();
      return sendSuccessResponse(res, { message: "Experience deleted" });
    } else {
      return sendErrorResponse(res, { message: "Experience not found" }, 404);
    }
  } catch (error) {
    return sendErrorResponse(res, error.message);
  }
};
