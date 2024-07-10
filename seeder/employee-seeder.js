const { Employee } = require("../models");

const employeeData = async () => {
  try {
    const insertRecords = [
      {
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
        city: "New York",
        area: "Manhattan",
        pincode: "10001",
        streetAddress: "123 Main St",
        email: "johndoe@example.com",
        password: "password123",
      },
    ];
    await Employee.bulkCreate(insertRecords);
  } catch (error) {
    console.log("Coupon seeder:", error);
  }
};

module.exports = { employeeData };
