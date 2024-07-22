const { Appl, AppliedJobiedJob, AppliedJob } = require("../models");

const applideData = async () => {
  try {
    const insertRecords = [
      {
        employeeId: 42,
        jobId: 5,
        applicationDate: "2024-07-19 06:17:12",
        employeeStatus: null,
        employerStatus: "Applied",
        jobTitle: "stringe",
        companyName: "string",
        availableDates: "string",
        experience: "string",
        createdAt: "2024-07-19 06:17:12",
        updatedAt: "2024-07-19 06:17:12",
      },
      {
        employeeId: 43,
        jobId: 6,
        applicationDate: "2024-07-19 07:22:53",
        employeeStatus: null,
        employerStatus: "Applied",
        jobTitle: "Mern stack dev",
        companyName: "techpedia",
        availableDates: "30",
        experience: "2",
        createdAt: "2024-07-19 07:22:53",
        updatedAt: "2024-07-19 07:22:53",
      },
      {
        employeeId: 44,
        jobId: 1,
        applicationDate: "2024-07-19 11:49:36",
        employeeStatus: null,
        employerStatus: "Applied",
        jobTitle: "react",
        companyName: "techlab",
        availableDates: "16-08-2024",
        experience: "1",
        createdAt: "2024-07-19 11:49:36",
        updatedAt: "2024-07-19 11:49:36",
      },
      {
        employeeId: 44,
        jobId: 3,
        applicationDate: "2024-07-20 08:26:57",
        employeeStatus: null,
        employerStatus: "Applied",
        jobTitle: "react js",
        companyName: "techlab",
        availableDates: "12",
        experience: "2",
        createdAt: "2024-07-20 08:26:57",
        updatedAt: "2024-07-20 08:26:57",
      },
    ];

    await AppliedJob.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { applideData };
