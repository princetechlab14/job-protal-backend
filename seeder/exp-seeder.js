const { Experience } = require("../models");

const experienceData = async () => {
  try {
    const insertRecords = [
      {
        jobTitle: "Software Engineer",
        companyName: "Tech Innovations Inc.",
        employeeId: 43,
      },
      {
        jobTitle: "Software Engineer",
        companyName: "Tech Innovations Inc.",
        employeeId: 44,
      },
    ];

    await Experience.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { experienceData };
