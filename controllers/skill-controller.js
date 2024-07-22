const { Skill } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Skill
exports.addOrUpdateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;
    const { skill, yearsOfExperience } = req.body;

    if (!skill || !yearsOfExperience || !employeeId) {
      return sendErrorResponse(
        res,
        "Skill, yearsOfExperience, and employeeId are required",
        400
      );
    }

    if (id) {
      // Update existing skill
      const existingSkill = await Skill.findByPk(id);
      if (!existingSkill) {
        return sendErrorResponse(res, "Skill not found", 404);
      }

      existingSkill.skill = skill;
      existingSkill.yearsOfExperience = yearsOfExperience;
      existingSkill.employeeId = employeeId;
      await existingSkill.save();
      return sendSuccessResponse(res, {
        message: "Skill updated successfully",
        skill: existingSkill,
      });
    } else {
      // Add new skill
      const newSkill = await Skill.create({
        skill,
        yearsOfExperience,
        employeeId,
      });
      return sendSuccessResponse(
        res,
        { message: "Skill added successfully", skill: newSkill },
        201
      );
    }
  } catch (error) {
    console.error("Error adding or updating skill:", error);
    return sendErrorResponse(res, error.message);
  }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;
    if (!id) {
      return sendErrorResponse(res, "Skill ID is required", 400);
    }

    const skill = await Skill.findOne({ where: { id, employeeId } });
    if (!skill) {
      return sendErrorResponse(res, { message: "Skill not found" }, 404);
    }

    await skill.destroy();
    return sendSuccessResponse(res, { message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return sendErrorResponse(res, error.message);
  }
};
