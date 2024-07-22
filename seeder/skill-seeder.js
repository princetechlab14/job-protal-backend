const { Skill } = require("../models");

const skillData = async () => {
  try {
    const insertRecords = [
      {
        skill: "JavaScript",
        yearsOfExperience: 5,
        employeeId: 1,
      },
      {
        skill: "Python",
        yearsOfExperience: 3,
        employeeId: 2,
      },
      {
        skill: "React",
        yearsOfExperience: 4,
        employeeId: 43,
      },
      {
        skill: "Node.js",
        yearsOfExperience: 6,
        employeeId: 43,
      },
      {
        skill: "SQL",
        yearsOfExperience: 2,
        employeeId: 43,
      },
    ];
    await Skill.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { skillData };
