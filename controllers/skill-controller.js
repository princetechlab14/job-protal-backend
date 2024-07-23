const { ensureEmployee } = require("../middleware/ensureEmployee");
const { Skill } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Skill
exports.addOrUpdateSkill = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { skill, yearsOfExperience, id } = req.body;

      if (id) {
        // Update existing skill
        const existingSkill = await Skill.findByPk(id);
        if (!existingSkill) {
          return sendErrorResponse(res, { message: "Skill not found" }, 404);
        }

        existingSkill.skill = req.body.skill ? skill : existingSkill?.skill;
        existingSkill.yearsOfExperience = req.body.yearsOfExperience
          ? yearsOfExperience
          : existingSkill.yearsOfExperience;
        existingSkill.employeeId = employeeId;
        await existingSkill.save();
        return sendSuccessResponse(res, {
          message: "Skill updated successfully",
          skill: existingSkill,
        });
      } else {
        if (!skill || !yearsOfExperience || !employeeId) {
          return sendErrorResponse(
            res,
            {
              message: "Skill, yearsOfExperience, and employeeId are required",
            },
            400
          );
        }
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
      return sendErrorResponse(res, { message: error.message }, 500);
    }
  },
];

// Delete Skill
exports.deleteSkill = [
  ensureEmployee,
  async (req, res) => {
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
      return sendSuccessResponse(res, {
        message: "Skill deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting skill:", error);
      return sendErrorResponse(res, { message: error.message }, 500);
    }
  },
];
