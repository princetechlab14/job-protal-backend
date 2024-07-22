const { Admin } = require("../models");
const { hashPassword } = require("../utils/passwordUtils");

const admin = async () => {
  const generated = await hashPassword("Little@2025Tech", 8);
  try {
    const insertRecords = [
      {
        email: "littlesolution3@gmail.com",
        name: "admin",
        password: generated,
        status: "active",
      },
    ];
    await Admin.bulkCreate(insertRecords);
  } catch (error) {
    console.log("states seeder:", error);
  }
};
module.exports = { admin };
