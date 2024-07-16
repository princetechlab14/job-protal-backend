const express = require("express");
const router = express.Router();
const employeeController = require("../../controllers/employee-controller");
const { authenticateToken } = require("../../middleware/verifyToken");
const { upload, convertPdfToBase64 } = require("../../middleware/pdfTobase64");

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Operations related to employees
 */

/**
 * @swagger
 * securityDefinitions:
 *   bearerAuth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 *     description: Enter JWT token in the format 'Bearer <token>'
 */

/**
 * @swagger
 * /employee/register:
 *   post:
 *     summary: Register a new employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Employee registered successfully
 *       400:
 *         description: Bad request - Validation error
 *       500:
 *         description: Server error
 */
router.post("/register", employeeController.registerOrLoginEmployee);

/**
 * @swagger
 * /employee/profile:
 *   put:
 *     summary: Update employee profile
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               city:
 *                 type: string
 *               role:
 *                 type: string
 *               area:
 *                 type: string
 *               pincode:
 *                 type: string
 *               streetAddress:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee profile updated successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.put("/profile", authenticateToken, employeeController.updateProfile);

/**
 * @swagger
 * /employee/profile:
 *   get:
 *     summary: Get employee profile
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with employee profile
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get("/profile", authenticateToken, employeeController.getProfile);

/**
 * @swagger
 * /employee/save-job:
 *   post:
 *     summary: Save a job
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Job saved successfully
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post("/save-job", authenticateToken, employeeController.saveJob);

/**
 * @swagger
 * /employee/apply-job:
 *   post:
 *     summary: Apply for a job
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: integer
 *                 description: The ID of the job to apply for
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: The CV file in PDF format
 *               jobTitle:
 *                 type: string
 *                 description: The job title the employee is applying for
 *               companyName:
 *                 type: string
 *                 description: The name of the company the employee is applying to
 *               availableDates:
 *                 type: string
 *                 description: The dates the employee is available for interviews or starting the job
 *               experience:
 *                 type: string
 *                 description: The experience details of the employee
 *     responses:
 *       201:
 *         description: Applied successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post(
  "/apply-job",
  authenticateToken,
  upload.single("cv"),
  convertPdfToBase64,
  employeeController.applyJob
);

/**
 * @swagger
 * /employee/applied-jobs/{appliedJobId}/update-status:
 *   put:
 *     summary: Update employee status for an applied job
 *     tags: [Employees]
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
 *         description: Employee status updated successfully
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
  "/applied-jobs/:appliedJobId/update-status",
  authenticateToken,
  employeeController.updateEmployeeStatus
);

/**
 * @swagger
 * /employee/applied-jobs/{appliedJobId}:
 *   delete:
 *     summary: Remove applied job
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appliedJobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the applied job to remove
 *     responses:
 *       200:
 *         description: Applied job removed successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Applied job not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/applied-jobs/:appliedJobId",
  authenticateToken,
  employeeController.removeAppliedJob
);

/**
 * @swagger
 * /employee/applied-jobs:
 *   get:
 *     summary: Get all applied jobs by employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with applied jobs
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.get(
  "/applied-jobs",
  authenticateToken,
  employeeController.getAllAppliedJobs
);

/**
 * @swagger
 * /employee/saved-jobs:
 *   get:
 *     summary: Get all saved jobs for an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with saved jobs
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.get(
  "/saved-jobs",
  authenticateToken,
  employeeController.getAllSavedJobs
);

/**
 * @swagger
 * /employee/salary-range:
 *   post:
 *     summary: Get filtered jobs with average salary
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     requestBody:
 *       required: true
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
 *         description: Successful response with filtered jobs and average salary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       jobTitle:
 *                         type: string
 *                       location:
 *                         type: string
 *                       salary:
 *                         type: number
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 averageSalary:
 *                   type: object
 *                   properties:
 *                     yearly:
 *                       type: number
 *                     hourly:
 *                       type: number
 *                     daily:
 *                       type: number
 *                     weekly:
 *                       type: number
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post(
  "/salary-range",
  authenticateToken,
  employeeController.getFilteredJobsWithSalary
);
  
module.exports = router;
