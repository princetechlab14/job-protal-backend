const { ensureEmployee } = require("../middleware/ensureEmployee");
const { Education } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Education
exports.addOrUpdateEducation = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { levelOfEducation, fieldOfStudy, startDate, endDate, id } =
        req.body;

      if (id) {
        // Update existing education
        const education = await Education.findByPk(id);
        if (education) {
          // Update only provided fields
          education.levelOfEducation =
            levelOfEducation !== undefined
              ? levelOfEducation
              : education.levelOfEducation;
          education.fieldOfStudy =
            fieldOfStudy !== undefined ? fieldOfStudy : education.fieldOfStudy;
          education.startDate =
            startDate !== undefined ? startDate : education.startDate;
          education.endDate =
            endDate !== undefined ? endDate : education.endDate;

          await education.save();
          return sendSuccessResponse(res, {
            data: education,
            message: "Education record updated successfully",
          });
        } else {
          return sendErrorResponse(
            res,
            { message: "Education record not found" },
            404
          );
        }
      } else {
        // Add new education
        if (!levelOfEducation || !fieldOfStudy) {
          return sendErrorResponse(
            res,
            { message: "Required fields missing for new education" },
            400
          );
        }

        const newEducation = await Education.create({
          levelOfEducation,
          fieldOfStudy,
          employeeId: req.user.employeeId, // Assuming employeeId is in req.user
          startDate,
          endDate,
        });
        return sendSuccessResponse(
          res,
          {
            data: newEducation,
            message: "Education record added successfully",
          },
          201
        );
      }
    } catch (error) {
      console.error("Error adding or updating education:", error);
      return sendErrorResponse(res, "Error adding or updating education", 500);
    }
  },
];

// Delete Education
exports.deleteEducation = [
  ensureEmployee,
  async (req, res) => {
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
  },
];
