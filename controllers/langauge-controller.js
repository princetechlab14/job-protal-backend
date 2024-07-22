const { Language } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Language
exports.addOrUpdateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;
    const { language, proficiency } = req.body;

    if (!language || !proficiency) {
      return sendErrorResponse(
        res,
        "Language and proficiency are required",
        400
      );
    }

    if (id) {
      // Update existing language
      const existingLanguage = await Language.findByPk(id);
      if (!existingLanguage) {
        return sendErrorResponse(res, "Language not found", 404);
      }

      existingLanguage.language = language;
      existingLanguage.proficiency = proficiency;
      existingLanguage.employeeId = employeeId;
      await existingLanguage.save();
      return sendSuccessResponse(res, {
        message: "Language updated successfully",
        language: existingLanguage,
      });
    } else {
      // Add new language
      const newLanguage = await Language.create({
        language,
        proficiency,
        employeeId,
      });
      return sendSuccessResponse(
        res,
        { message: "Language added successfully", language: newLanguage },
        201
      );
    }
  } catch (error) {
    console.error("Error adding or updating language:", error);
    return sendErrorResponse(res, error.message);
  }
};

// Delete Language
exports.deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;
    if (!id) {
      return sendErrorResponse(res, "Language ID is required", 400);
    }

    const language = await Language.findOne({ where: { id, employeeId } });
    if (!language) {
      return sendErrorResponse(res, { message: "Language not found" }, 404);
    }

    await language.destroy();
    return sendSuccessResponse(res, {
      message: "Language deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting language:", error);
    return sendErrorResponse(res, error.message);
  }
};
