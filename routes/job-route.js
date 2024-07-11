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

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *               jobLocation:
 *                 type: string
 *                 enum: [On-site, Remote]
 *               employeeId:
 *                 type: integer
 *               specificCity:
 *                 type: string
 *               advertiseCity:
 *                 type: string
 *                 enum: [Yes, No]
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *               pincode:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               jobTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - Full-time
 *                     - Permanent
 *                     - Fresher
 *                     - Part-time
 *                     - Internship
 *                     - Temporary
 *                     - Freelance
 *                     - Volunteer
 *               minimumPay:
 *                 type: integer
 *               maximumPay:
 *                 type: integer
 *               payType:
 *                 type: string
 *                 enum: [Exact, Range]
 *               exactPay:
 *                 type: integer
 *               payRate:
 *                 type: string
 *                 enum: [per hour, per day, per month, per year]
 *               jobDescription:
 *                 type: string
 *               numberOfPeople:
 *                 type: integer
 *               mobileNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               deadline:
 *                 type: string
 *                 enum: [Yes, No]
 *               deadlineDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post("/", authenticateToken, jobController.createJob);

/**
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
 *               location:
 *                 type: string
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

/**
 * @swagger
 * /jobs/{jobId}:
 *   put:
 *     summary: Update job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the job to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *               jobLocation:
 *                 type: string
 *                 enum: [On-site, Remote]
 *               specificCity:
 *                 type: string
 *               advertiseCity:
 *                 type: string
 *                 enum: [Yes, No]
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *               pincode:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               jobTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - Full-time
 *                     - Permanent
 *                     - Fresher
 *                     - Part-time
 *                     - Internship
 *                     - Temporary
 *                     - Freelance
 *                     - Volunteer
 *               minimumPay:
 *                 type: integer
 *               maximumPay:
 *                 type: integer
 *               payType:
 *                 type: string
 *                 enum: [Exact, Range]
 *               exactPay:
 *                 type: integer
 *               payRate:
 *                 type: string
 *                 enum: [per hour, per day, per month, per year]
 *               jobDescription:
 *                 type: string
 *               numberOfPeople:
 *                 type: integer
 *               mobileNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               deadline:
 *                 type: string
 *                 enum: [Yes, No]
 *               deadlineDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.put("/:jobId", authenticateToken, jobController.updateJob);

/**
 * @swagger
 * /jobs/{jobId}:
 *   delete:
 *     summary: Delete job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the job to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.delete("/:jobId", authenticateToken, jobController.deleteJob);

module.exports = router;
