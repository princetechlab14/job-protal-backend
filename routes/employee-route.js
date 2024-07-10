// routes/employeeRoutes.js

const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee-controller");
const { authenticateToken } = require("../middleware/verifyToken");

router.post("/register", employeeController.registerEmployee);
router.post("/login", employeeController.loginEmployee);
router.put("/profile", authenticateToken, employeeController.updateProfile); // Assuming authenticateMiddleware is implemented
router.get("/profile", authenticateToken, employeeController.getProfile);

module.exports = router;
