const { Roles } = require("../models");

const rolesData = async () => {
  try {
    const insertRecords = [
      {
        role: "Software Developer",
        skills: ["JavaScript", "Node.js", "React"],
      },
      {
        role: "Data Scientist",
        skills: ["JavaScript", "Node.js", "React"],
      },
    ];

    await Roles.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { rolesData };
