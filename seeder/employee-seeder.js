const { Employee } = require("../models");
const { hashPassword } = require("../utils/passwordUtils");

const employeeData = async () => {
  try {
    const insertRecords = [
      {
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
        city: "New York",
        area: "Manhattan",
        role: "Full stack developer",
        pincode: "10001",
        streetAddress: "123 Main St",
        email: "johndoe@example.com",
        password: await hashPassword("password123"),
      },
      {
        firstName: "teste",
        lastName: "teste",
        phoneNumber: "1234567890",
        city: "New York",
        area: "Manhattan",
        role: "backend developer",
        pincode: "10001",
        streetAddress: "123 Main St",
        email: "tester@example.com",
        password: await hashPassword("password123"),
      },
    ];
    await Employee.bulkCreate(insertRecords);
  } catch (error) {
    console.log("Coupon seeder:", error);
  }
};

module.exports = { employeeData };
