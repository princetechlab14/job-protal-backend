const { Employee } = require("../models");
const { hashPassword } = require("../utils/passwordUtils");

const employeeData = async () => {
  try {
    const insertRecords = [
      // {
      //   firstName: "John",
      //   lastName: "Doe",
      //   phoneNumber: "1234567890",
      //   city: "New York",
      //   area: "Manhattan",
      //   role: "Full stack developer",
      //   pincode: "10001",
      //   streetAddress: "123 Main St",
      //   email: "johndoe@example.com",
      //   password: await hashPassword("password123"),
      // },
      {
        firstName: "Tester",
        lastName: "Testerson",
        phoneNumber: "9876543210",
        city: "Los Angeles",
        area: "Downtown",
        role: "Backend developer",
        pincode: "90001",
        streetAddress: "456 Elm St",
        email: "tester@example.com",
        password: await hashPassword("password456"),
      },
      // Add more employees as needed
    ];

    // Adding 40 employees
    for (let i = 1; i <= 40; i++) {
      insertRecords.push({
        firstName: `Employee${i}`,
        lastName: `LastName${i}`,
        phoneNumber: `123456700${i}`,
        city: "New York",
        area: "Manhattan",
        role: "Developer",
        pincode: "10001",
        streetAddress: `Street ${i}`,
        email: `employee${i}@example.com`,
        password: await hashPassword(`password${i}`),
        status: true,
      });
    }

    await Employee.bulkCreate(insertRecords);
  } catch (error) {
    console.error("Error adding employees:", error);
  }
};

module.exports = { employeeData };
