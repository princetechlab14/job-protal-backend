const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job-controller");
const { authenticateToken } = require("../middleware/verifyToken");

// POST /jobs - Create a new job
router.post("/", authenticateToken, jobController.createJob);

// GET /jobs - Get all jobs
router.get("/", authenticateToken, jobController.getAllJobs);

// GET /jobs/:jobId - Get job by ID
router.get("/:jobId", authenticateToken, jobController.getJobById);

// PUT /jobs/:jobId - Update job by ID
router.put("/:jobId", authenticateToken, jobController.updateJob);

// DELETE /jobs/:jobId - Delete job by ID
router.delete("/:jobId", authenticateToken, jobController.deleteJob);

// Route to get jobs by employee ID
router.get("/employer/:employeeId", jobController.getJobsByEmployeeId);

// Route to get jobs closed by employer ID
router.get(
  "/employer/closed/:employeeId",
  jobController.getClosedJobsByEmployeeId
);

module.exports = router;
