const { ensureEmployee } = require("../middleware/ensureEmployee");
const db = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update experience
exports.addOrUpdateExperience = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;
      const { id, jobTitle, companyName, startDate, endDate, isPresent } =
        req.body;

      if (id) {
        // Update existing experience
        const experience = await db.Experience.findByPk(id);
        if (experience) {
          // Update only provided fields
          experience.jobTitle =
            jobTitle !== undefined ? jobTitle : experience.jobTitle;
          experience.companyName =
            companyName !== undefined ? companyName : experience.companyName;
          experience.startDate =
            startDate !== undefined ? startDate : experience.startDate;
          experience.endDate =
            isPresent === true
              ? null
              : endDate !== undefined
              ? endDate
              : experience.endDate;
          experience.isPresent =
            isPresent !== undefined
              ? isPresent
              : startDate && !endDate
              ? true
              : experience.isPresent;
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
          endDate: isPresent === true ? null : endDate,
          isPresent:
            isPresent !== undefined
              ? isPresent
              : startDate && !endDate
              ? true
              : false,
          employeeId,
        });
        return sendSuccessResponse(
          res,
          {
            data: newExperience,
            message: "Experience added successfully",
          },
          201
        );
      }
    } catch (error) {
      console.error("Error adding or updating experience:", error);
      return sendErrorResponse(
        res,
        { message: "Error adding or updating experience" },
        500
      );
    }
  },
];

// Delete experience
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
