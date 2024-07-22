const { Education } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Education
exports.addOrUpdateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const { levelOfEducation, fieldOfStudy, startDate, endDate } = req.body;

    if (id) {
      // Update existing education
      const education = await Education.findByPk(id);
      if (education) {
        // Update only provided fields
        if (levelOfEducation !== undefined)
          education.levelOfEducation = levelOfEducation;
        if (fieldOfStudy !== undefined) education.fieldOfStudy = fieldOfStudy;
        if (startDate !== undefined) education.startDate = startDate;
        if (endDate !== undefined) education.endDate = endDate;

        await education.save();
        return sendSuccessResponse(res, education);
      } else {
        return sendErrorResponse(res, "Education not found", 404);
      }
    } else {
      // Add new education
      const newEducation = await Education.create({
        levelOfEducation,
        fieldOfStudy,
        employeeId: req.user.employeeId, // Assuming employeeId is in req.user
        startDate,
        endDate,
      });
      return sendSuccessResponse(res, newEducation, 201);
    }
  } catch (error) {
    console.error("Error adding or updating education:", error);
    return sendErrorResponse(res, error.message);
  }
};

// Delete Education
exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.params;
    const education = await Education.findOne({ where: { id, employeeId } });

    if (education) {
      await education.destroy();
      return sendSuccessResponse(res, { message: "Education deleted" });
    } else {
      return sendErrorResponse(res, { message: "Education not found" }, 404);
    }
  } catch (error) {
    console.error("Error deleting education:", error);
    return sendErrorResponse(res, error.message);
  }
};
