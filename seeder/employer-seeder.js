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
        email: "joshn.doe@example.com",
        password: "dummyPasswordHashed",
      },
    ];
    await Employer.bulkCreate(insertRecords);
  } catch (error) {
    console.log("Coupon seeder:", error);
  }
};

module.exports = { employeeData };
