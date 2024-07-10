// routes/employee.js

const express = require("express");
const router = express.Router();
const {
  registerEmployee,
  loginEmployee,
  updateProfile,
  getProfile,
} = require("../controllers/employer-controller");
const { authenticateToken } = require("../middleware/verifyToken");

// Register a new employee
router.post("/register", registerEmployee);

// Login employee
router.post("/login", loginEmployee);

// Update Employee
router.put("/profile", authenticateToken, updateProfile);

// Update Employee
router.get("/profile", authenticateToken, getProfile);

module.exports = router;
