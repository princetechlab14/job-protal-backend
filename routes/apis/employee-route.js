const express = require("express");
const router = express.Router();
const employeeController = require("../../controllers/employee-controller");
const { authenticateToken } = require("../../middleware/verifyToken");
const {
  upload,
  convertPdfToBase64,
  uploadImageToS3,
} = require("../../middleware/pdfTobase64");
const {
  addOrUpdateExperience,
  deleteExperience,
} = require("../../controllers/experience-controller");
const {
  addOrUpdateEducation,
  deleteEducation,
} = require("../../controllers/education-controller");
const {
  addOrUpdateSkill,
  deleteSkill,
} = require("../../controllers/skill-controller");
const {
  deleteLanguage,
  addOrUpdateLanguage,
} = require("../../controllers/langauge-controller");
const {
  deleteJobPreferences,
  addOrUpdateJobPreferences,
  UpdateReadyToWork,
} = require("../../controllers/jobPreferences-controller");

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
 *                 format: email
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
 *         multipart/form-data:
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
 *               profile:
 *                 type: string
 *                 format: binary
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
router.put(
  "/profile",
  authenticateToken,
  upload.single("profile"),
  uploadImageToS3,
  employeeController.updateProfile
);

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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: integer
 *                 description: The ID of the job to apply for
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
router.post("/apply-job", authenticateToken, employeeController.applyJob);

/**
 * @swagger
 * /employee/applied-jobs/{appliedJobId}/update-application-status:
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
 *               employeeStatus:
 *                 type: string
 *                 enum: [ "Applied","Interviewing","Offer received","Hired","Not selected by employer","No longer interested"]
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
  "/applied-jobs/:appliedJobId/update-application-status",
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
 *
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post("/salary-range", employeeController.getFilteredJobsWithSalary);

/**
 * @swagger
 * /employee/unsave-job/{jobId}:
 *   delete:
 *     summary: Unsave a job
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the job to unsave
 *     responses:
 *       200:
 *         description: Job unsaved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/unsave-job/:jobId",
  authenticateToken,
  employeeController.unsavedJob
);

/**
 * @swagger
 * /employee/skills:
 *   get:
 *     summary: Get all unique skills from jobs
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: Successfully retrieved unique skills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get("/skills", employeeController.getAllSkills);

/**
 * @openapi
 * /employee/experience:
 *   post:
 *     summary: Add or update experience
 *     description: Add a new experience or update an existing one.
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
 *               id:
 *                 type: integer
 *                 example: 1
 *               jobTitle:
 *                 type: string
 *                 example: Software Engineer
 *               companyName:
 *                 type: string
 *                 example: Tech Inc.
 *               startDate:
 *                 type: string
 *                 example: 2024/12/13
 *               endDate:
 *                 type: string
 *                 example: 2024/12/13
 *               isPresent:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: education successfully updated
 *       201:
 *         description: Experience successfully created
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */
router.post("/experience", authenticateToken, addOrUpdateExperience);

/**
 * @openapi
 * /employee/experience/{id}:
 *   delete:
 *     summary: Delete experience
 *     description: Delete an existing experience by ID.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Experience successfully deleted
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */

router.delete("/experience/:id", authenticateToken, deleteExperience);

/**
 * @openapi
 * /employee/education:
 *   post:
 *     summary: Add or update education
 *     description: Add a new education or update an existing one.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               university:
 *                 type: string
 *                 example: Software Engineer
 *               fieldOfStudy:
 *                 type: string
 *                 example: Tech Inc.
 *               startDate:
 *                 type: string
 *                 example: 2024/12/13
 *               endDate:
 *                 type: string
 *                 example: 2024/12/13
 *               isPresent:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: education successfully updated
 *       201:
 *         description: education successfully created
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */
router.post("/education", authenticateToken, addOrUpdateEducation);

/**
 * @openapi
 * /employee/education/{id}:
 *   delete:
 *     summary: Delete education
 *     description: Delete an existing education by ID.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: education successfully deleted
 *       404:
 *         description: education not found
 *       500:
 *         description: Internal server error
 */

router.delete("/education/:id", authenticateToken, deleteEducation);

/**
 * @openapi
 * /employee/skill:
 *   post:
 *     summary: Add or update skill
 *     description: Add a new skill or update an existing one.
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
 *               id:
 *                 type: integer
 *                 example: 1
 *               skill:
 *                 type: string
 *                 example: React
 *               yearsOfExperience:
 *                 type: string
 *                 example: 1
 *     responses:
 *       200:
 *         description: skill successfully updated
 *       201:
 *         description: skill successfully created
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */
router.post("/skill", authenticateToken, addOrUpdateSkill);

/**
 * @openapi
 * /employee/skill/{id}:
 *   delete:
 *     summary: Delete skill
 *     description: Delete an existing skill by ID.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: skill successfully deleted
 *       404:
 *         description: skill not found
 *       500:
 *         description: Internal server error
 */

router.delete("/skill/:id", authenticateToken, deleteSkill);

/**
 * @openapi
 * /employee/language:
 *   post:
 *     summary: Add or update language
 *     description: Add a new language or update an existing one.
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
 *               id:
 *                 type: integer
 *                 example: 1
 *               language:
 *                 type: string
 *                 example: hindi
 *               proficiency:
 *                 type: string
 *                 example: Advanced.
 *     responses:
 *       200:
 *         description: language successfully updated
 *       201:
 *         description: language successfully created
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */
router.post("/language", authenticateToken, addOrUpdateLanguage);

/**
 * @openapi
 * /employee/language/{id}:
 *   delete:
 *     summary: Delete language
 *     description: Delete an existing language by ID.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: language successfully deleted
 *       404:
 *         description: language not found
 *       500:
 *         description: Internal server error
 */

router.delete("/language/:id", authenticateToken, deleteLanguage);

/**
 * @openapi
 * /employee/jobPreferences:
 *   post:
 *     summary: Add or update jobPreferences
 *     description: Add a new jobPreferences or update an existing one.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the job preferences to update (leave blank to create new).
 *               jobTitles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Software Engineer", "Data Scientist"]
 *                 description: List of preferred job titles.
 *               jobTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Full-time", "Part-time"]
 *                 description: List of preferred job types.
 *               workDays:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
 *                 description: List of preferred work days.
 *               shifts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Day", "Night"]
 *                 description: List of preferred shifts.
 *               basePay:
 *                 type: number
 *                 example: 458978
 *               payType:
 *                 type: string
 *                 example: "Per Month"
 *               employeeId:
 *                 type: integer
 *                 example: 123
 *                 description: The ID of the employee associated with the job preferences.
 *     responses:
 *       200:
 *         description: jobPreferences successfully updated
 *       201:
 *         description: jobPreferences successfully created
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */
router.post("/jobPreferences", authenticateToken, addOrUpdateJobPreferences);

/**
 * @openapi
 * /employee/readyToWork:
 *   post:
 *     summary: Add or update readyToWork
 *     description: Add a new readyToWork or update an existing one.
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
 *               readyToWork:
 *                 type: boolean
 *                 example: true
 *                 description: Whether the employee is ready to work.
 *     responses:
 *       200:
 *         description: readyToWork successfully updated
 *       201:
 *         description: readyToWork successfully created
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */
router.post("/readyToWork", authenticateToken, UpdateReadyToWork);

/**
 * @openapi
 * /employee/jobPreferences/delete:
 *   delete:
 *     summary: Delete jobPreferences
 *     description: Delete an existing jobPreferences by ID.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: jobPreferences successfully deleted
 *       404:
 *         description: jobPreferences not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/jobPreferences/delete",
  authenticateToken,
  deleteJobPreferences
);

/**
 * @swagger
 * /employee/resume:
 *   post:
 *     summary: Add or update employee resume
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
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: Resume file in PDF format
 *     responses:
 *       200:
 *         description: Resume added or updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.post(
  "/resume",
  authenticateToken,
  upload.single("cv"),
  convertPdfToBase64,
  employeeController.addOrUpdateResume
);

/**
 * @swagger
 * /employee/resume:
 *   delete:
 *     summary: Delete employee resume
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *       404:
 *         description: Resume not found
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Server error
 */
router.delete("/resume", authenticateToken, employeeController.deleteResume);

module.exports = router;
