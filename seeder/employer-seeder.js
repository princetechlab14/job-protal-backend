const { Employer } = require("../models");

const employeeData = async () => {
  try {
    const insertRecords = [
      {
        fullName: "John",
        companyName: "Tech Solutions Inc.",
        numberOfEmployees: 100,
        isHiringManager: true,
        phoneNumber: "123-456-7890",
        email: "john.doe@example.com",
        password: "dummyPasswordHashed",
      },
      // Add more employees
      {
        fullName: "Jane",
        companyName: "Tech Solutions Inc.",
        numberOfEmployees: 100,
        isHiringManager: false,
        phoneNumber: "987-654-3210",
        email: "jane.smith@example.com",
        password: "dummyPasswordHashed",
      },
      // Add more employees as needed
    ];

    // Adding 40 employees
    for (let i = 1; i <= 40; i++) {
      insertRecords.push({
        fullName: `Employee ${i}`,
        companyName: "Tech Solutions Inc.",
        numberOfEmployees: 100+i,
        isHiringManager: "Yes",
        phoneNumber: `123-456-700${i}`,
        email: `employee${i}@example.com`,
        password: "dummyPasswordHashed",
      });
    }

    await Employer.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { employeeData };
