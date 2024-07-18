const express = require("express");
const router = express.Router();
const employerController = require("../../controllers/employer-controller");
const jobController = require("../../controllers/job-controller");
const { authenticateToken } = require("../../middleware/verifyToken");

/**
 * @swagger
 * tags:
 *   name: Employers
 *   description: Operations related to employers
 */

/**
 * @swagger
 * /employer/register:
 *   post:
 *     summary: Register a new employer
 *     tags: [Employers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Employer registered successfully
 *       400:
 *         description: Bad request - Validation error
 *       500:
 *         description: Server error
 */
router.post("/register", employerController.registerOrLoginEmployer);

/**
 * @swagger
 * /employer/profile:
 *   put:
 *     summary: Update employer profile
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               companyName:
 *                 type: string
 *               numberOfEmployees:
 *                 type: integer
 *               howHeard:
 *                 type: string
 *               hiringManager:
 *                 type: string
 *                 enum: [Yes, No]
 *               phoneNumber:
 *                 type: string
 *                 format: phone-number
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Employer profile updated successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Employer not found
 *       500:
 *         description: Server error
 */
router.put("/profile", authenticateToken, employerController.updateProfile);

/**
 * @swagger
 * /employer/profile:
 *   get:
 *     summary: Get employer profile
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with employer profile
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Employer not found
 *       500:
 *         description: Server error
 */
router.get("/profile", authenticateToken, employerController.getProfile);

/**
 * @swagger
 * /employer/applied-jobs/{appliedJobId}/update-employer-status:
 *   put:
 *     summary: Update employer status for an applied job
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appliedJobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the applied job to update status for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, pending]
 *     responses:
 *       200:
 *         description: Employer status updated successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Applied job not found
 *       500:
 *         description: Server error
 */
router.put(
  "/applied-jobs/:appliedJobId/update-employer-status",
  authenticateToken,
  employerController.updateEmployerStatus
);

/**
 * @swagger
 * /employer/jobs/live:
 *   post:
 *     summary: Get jobs by employer ID with optional filters and sorting
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 description: Filter jobs by title containing the specified string
 *               location:
 *                 type: string
 *                 description: Filter jobs by location containing the specified string
 *               sortBy:
 *                 type: string
 *                 enum: [createdAt, updatedAt, jobTitle] 
 *                 description: Field to sort by (createdAt, updatedAt, jobTitle)
 *               sortOrder:
 *                 type: string
 *                 enum: [asc, desc]
 *                 description: Sort order (ascending 'asc' or descending 'desc')
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date to filter jobs created after this date (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date to filter jobs created before this date (YYYY-MM-DD)
 *     responses: 
 *       200:
 *         description: Successful response with jobs matching the criteria
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post(
  "/jobs/live",
  authenticateToken,
  employerController.getJobsByEmployeeId
);

/**
 * @swagger
 * /employer/jobs/closed:
 *   get:
 *     summary: Get closed jobs by employer ID
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with closed jobs
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.get(
  "/jobs/closed",
  authenticateToken,
  employerController.getClosedJobsByEmployeeId
);

/**
 * @swagger
 * /employer/{jobId}/applicants:
 *   get:
 *     summary: Get applicants for a specific job
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the job to fetch applicants for
 *     responses:
 *       200:
 *         description: Successful response with applicants
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:jobId/applicants",
  authenticateToken,
  employerController.getApplicant
);

/**
 * @swagger
 * /employer/jobs/{jobId}/status:
 *   put:
 *     summary: Update job status by employer
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the job to update status for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Open, Paused, Closed]
 *                 description: The new status of the job
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.put(
  "/jobs/:jobId/status",
  authenticateToken,
  employerController.updateJobStatus
);

/**
 * @swagger
 * /employer/search-employees:
 *   get:
 *     summary: Search employees by role and/or city
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Role of the employee to search for
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City of the employee to search for
 *     responses:
 *       200:
 *         description: Successful response with employees matching the criteria
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.get(
  "/search-employees",
  authenticateToken,
  employerController.searchEmployees
);

/**
 * @swagger
 * /employer/applications/{appliedJobId}:
 *   get:
 *     summary: Get application details by applied job ID
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appliedJobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the applied job to fetch details for
 *     responses:
 *       200:
 *         description: Successful response with application details
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Applied job not found
 *       500:
 *         description: Server error
 */
router.get(
  "/applications/:appliedJobId",
  authenticateToken,
  employerController.getAllJobsByEmployerId
);

module.exports = router;
