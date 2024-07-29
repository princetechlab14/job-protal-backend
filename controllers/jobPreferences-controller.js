const { ensureEmployee } = require("../middleware/ensureEmployee");
const { JobPreferences, Employee } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Job Preferences
exports.addOrUpdateJobPreferences = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { jobTitles, jobTypes, workDays, shifts, payType, id, basePay } =
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
        existingPreferences.basePay =
          basePay !== undefined ? basePay : existingPreferences.basePay;
        existingPreferences.payType =
          payType !== undefined ? payType : existingPreferences.payType;
        existingPreferences.shifts =
          shifts !== undefined ? shifts : existingPreferences.shifts;
        existingPreferences.readyToWork = existingPreferences.readyToWork;
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
          basePay,
          payType,
          readyToWork: false,
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
      const { employeeId } = req.user;

      const jobPreferences = await JobPreferences.findOne({
        where: { employeeId },
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

exports.UpdateReadyToWork = [
  ensureEmployee,
  async (req, res) => {
    try {
      const { employeeId } = req.user;

      const readyToWork = await Employee.findOne({
        where: { id: employeeId },
      });
      if (!readyToWork) {
        return sendErrorResponse(res, { message: "Employee Not Found" }, 404);
      }

      await Employee.update(
        {
          readyToWork: req.body.readyToWork,
        },
        {
          where: { id: employeeId },
        }
      );

      return sendSuccessResponse(res, {
        readyToWork: req.body.readyToWork,
        message: "updated successfully",
      });
    } catch (error) {
      console.error("Error updating job preferences:", error);
      return sendErrorResponse(res, { message: error.message }, 500);
    }
  },
];
