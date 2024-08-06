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
        skills: {
          languages: ["Python", "R"],
          tools: ["TensorFlow", "Keras"],
        },
      },
    ];

    await Roles.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { rolesData };
