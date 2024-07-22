const { SavedJob } = require("../models");

const savedJobData = async () => {
  try {
    const insertRecords = [
      {
        employeeId: 44,
        jobId: 2,
        createdAt: "2024-07-20 09:42:28",
        updatedAt: "2024-07-20 09:42:28",
      },
    ];

    await SavedJob.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { savedJobData };
