const { Language } = require("../models");

const languageData = async () => {
  try {
    const insertRecords = [
      {
        language: "English",
        proficiency: "Advanced",
        employeeId: 44,
      },

      {
        language: "English",
        proficiency: "Advanced",
        employeeId: 43,
      },
    ];

    await Language.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { languageData };
