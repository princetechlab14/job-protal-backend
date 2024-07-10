const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Function to hash a password
exports.hashPassword = async (password) => {
  const saltRounds = 8;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

// Function to compare passwords
exports.comparePassword = async (plainPassword, hashedPassword) => {
  const isPasswordValid = await bcrypt.compare(plainPassword, hashedPassword);
  return isPasswordValid;
};

// Function to generate JWT token
exports.generateJWTToken = async (employeeId) => {
  const payload = {
    employeeId,
  };
  const options = {
    expiresIn: "1h", // Token expires in 1 hour
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};
