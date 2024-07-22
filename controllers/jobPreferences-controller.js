const { JobPreferences } = require("../models");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils");

// Add or Update Job Preferences
exports.addOrUpdateJobPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTitles, jobTypes, workDays, shifts, readyToWork } = req.body;
    const { employeeId } = req.user;

    if (id) {
      // Update existing job preferences
      const existingPreferences = await JobPreferences.findByPk(id);
      if (!existingPreferences) {
        return sendErrorResponse(res, "Job Preferences not found", 404);
      }

      existingPreferences.jobTitles = jobTitles;
      existingPreferences.jobTypes = jobTypes;
      existingPreferences.workDays = workDays;
      existingPreferences.shifts = shifts;
      existingPreferences.readyToWork = readyToWork;
      existingPreferences.employeeId = employeeId;
      await existingPreferences.save();
      return sendSuccessResponse(res, existingPreferences);
    } else {
      // Add new job preferences
      const newPreferences = await JobPreferences.create({
        jobTitles,
        jobTypes,
        workDays,
        shifts,
        readyToWork,
        employeeId,
      });
      return sendSuccessResponse(res, newPreferences, 201);
    }
  } catch (error) {
    console.error("Error adding or updating job preferences:", error);
    return sendErrorResponse(res, error.message);
  }
};

// Delete Job Preferences
exports.deleteJobPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.user;
    if (!id) {
      return sendErrorResponse(res, "Job Preferences ID is required", 400);
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
    return sendErrorResponse(res, error.message);
  }
};
