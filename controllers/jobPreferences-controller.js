const { ensureEmployee } = require("../middleware/ensureEmployee");
const { JobPreferences } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Job Preferences
exports.addOrUpdateJobPreferences = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { jobTitles, jobTypes, workDays, shifts, readyToWork, id } =
        req.body;
      const { employeeId } = req.user;

      if (id) {
        // Update existing job preferences
        const existingPreferences = await JobPreferences.findByPk(id);
        if (!existingPreferences) {
          return sendErrorResponse(
            res,
            { message: "Job Preferences not found" },
            404
          );
        }

        // Update only provided fields
        existingPreferences.jobTitles =
          jobTitles !== undefined ? jobTitles : existingPreferences.jobTitles;
        existingPreferences.jobTypes =
          jobTypes !== undefined ? jobTypes : existingPreferences.jobTypes;
        existingPreferences.workDays =
          workDays !== undefined ? workDays : existingPreferences.workDays;
        existingPreferences.shifts =
          shifts !== undefined ? shifts : existingPreferences.shifts;
        existingPreferences.readyToWork =
          readyToWork !== undefined
            ? readyToWork
            : existingPreferences.readyToWork;
        existingPreferences.employeeId = employeeId;

        await existingPreferences.save();
        return sendSuccessResponse(res, {
          data: existingPreferences,
          message: "Job preferences updated successfully",
        });
      } else {
        // Check if job preferences already exist for this employee
        const existingPreferences = await JobPreferences.findOne({
          where: { employeeId },
        });
        if (existingPreferences) {
          return sendErrorResponse(
            res,
            { message: "Job preferences already exist for this employee" },
            400
          );
        }

        // Add new job preferences
        const newPreferences = await JobPreferences.create({
          jobTitles,
          jobTypes,
          workDays,
          shifts,
          readyToWork,
          employeeId,
        });
        return sendSuccessResponse(
          res,
          {
            data: newPreferences,
            message: "Job preferences added successfully",
          },
          201
        );
      }
    } catch (error) {
      console.error("Error adding or updating job preferences:", error);
      return sendErrorResponse(
        res,
        { message: "Error adding or updating job preferences" },
        500
      );
    }
  },
];

// Delete Job Preferences
exports.deleteJobPreferences = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId } = req.user;
      if (!id) {
        return sendErrorResponse(
          res,
          { message: "Job Preferences ID is required" },
          400
        );
      }

      const jobPreferences = await JobPreferences.findOne({
        where: { id, employeeId },
      });
      if (!jobPreferences) {
        return sendErrorResponse(
          res,
          { message: "Job Preferences not found" },
          404
        );
      }

      await jobPreferences.destroy();
      return sendSuccessResponse(res, {
        message: "Job Preferences deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting job preferences:", error);
      return sendErrorResponse(res, { message: error.message }, 500);
    }
  },
];
