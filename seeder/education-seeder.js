const { Education } = require("../models");

const educationData = async () => {
  try {
    const insertRecords = [
      {
        university: "Bachelor's Degree",
        fieldOfStudy: "Computer Science",
        employeeId: 44, // Ensure this ID exists in the Employee table
        isPresent: false,
        createdAt: new Date("2024-07-20T09:42:28Z"),
        updatedAt: new Date("2024-07-20T09:42:28Z"),
      },
      {
        university: "Bachelor's Degree",
        fieldOfStudy: "Computer Science",
        employeeId: 43, // Ensure this ID exists in the Employee table
        isPresent: false,
        createdAt: new Date("2024-07-20T09:42:28Z"),
        updatedAt: new Date("2024-07-20T09:42:28Z"),
      },
    ];

    await Education.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { educationData };
