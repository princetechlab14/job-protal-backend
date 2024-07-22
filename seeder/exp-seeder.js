const { Experience } = require("../models");

const experienceData = async () => {
  try {
    const insertRecords = [
      {
        jobTitle: "Software Engineer",
        companyName: "Tech Innovations Inc.",
        employeeId: 43,
        isPresent: false,
        createdAt: new Date("2024-07-20T09:42:28Z"),
        updatedAt: new Date("2024-07-20T09:42:28Z"),
      },
      {
        jobTitle: "Software Engineer",
        companyName: "Tech Innovations Inc.",
        employeeId: 44,
        isPresent: false,
        createdAt: new Date("2024-07-20T09:42:28Z"),
        updatedAt: new Date("2024-07-20T09:42:28Z"),
      },
    ];

    await Experience.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { experienceData };
