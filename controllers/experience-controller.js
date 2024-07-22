const { ensureEmployee } = require("../middleware/ensureEmployee");
const db = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

exports.addOrUpdateExperience = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { id, jobTitle, companyName, startDate, endDate } = req.body;

      if (id) {
        // Update existing experience
        const experience = await db.Experience.findByPk(id);
        if (experience) {
          // Update only provided fields
          experience.jobTitle = req?.body?.jobTitle
            ? jobTitle
            : experience?.jobTitle;
          experience.companyName = req?.body?.companyName
            ? companyName
            : experience?.companyName;
          experience.startDate = req?.body?.startDate
            ? startDate
            : experience?.startDate;
          experience.endDate = req?.body?.endDate
            ? endDate
            : experience?.endDate;
          experience.employeeId = employeeId;
          await experience.save();
          return sendSuccessResponse(res, {
            data: experience,
            message: "Experience updated successfully",
          });
        } else {
          return sendErrorResponse(
            res,
            { message: "Experience not found" },
            404
          );
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
        return sendSuccessResponse(
          res,
          { data: newExperience, message: "Experience added successfully" },
          201
        );
      }
    } catch (error) {
      console.error("Error adding or updating experience:", error);
      return sendErrorResponse(res, error.message);
    }
  },
];

exports.deleteExperience = [
  ensureEmployee,
  async (req, res) => {
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
  },
];
