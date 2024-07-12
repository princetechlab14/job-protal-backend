const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job-controller");
const { authenticateToken } = require("../middleware/verifyToken");

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Operations related to jobs
 */

/**+
 * @swagger
 * /jobs/getall:
 *   post:
 *     summary: Get all jobs with pagination and filtering
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items per page (default is 2)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 description: Filter by job title
 *               location:
 *                 type: string
 *                 description: Filter by job location
 *               datePosted:
 *                 type: string
 *                 format: date
 *               jobLocation:
 *                 type: string
 *                 description: Filter by job location
 *               education:
 *                 type: string
 *                 description: Filter by job education
 *               minPay:
 *                 type: number
 *                 description: Filter by minimum pay
 *               maxPay:
 *                 type: number
 *                 description: Filter by maximum pay
 *               jobType:
 *                 type: string
 *                 description: Filter by job type
 *               skills:
 *                 type: string
 *                 description: Filter by required skills
 *               language:
 *                 type: string
 *                 description: Filter by required languages
 *               city:
 *                 type: string
 *                 description: Filter by city
 *     responses:
 *       200:
 *         description: Successful response with jobs
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post("/getall", authenticateToken, jobController.getAllJobs);

/**
 * @swagger
 * /jobs/{jobId}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the job to get
 *     responses:
 *       200:
 *         description: Successful response with job details
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get("/:jobId", authenticateToken, jobController.getJobById);

module.exports = router;
