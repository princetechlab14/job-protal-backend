const express = require("express");
const quizController = require("../../controllers/quiz-controller");
const { authenticateToken } = require("../../middleware/verifyToken");

const router = express.Router();

router.get("/employees/:id", authenticateToken, quizController.employeeQuizList);

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Assign a quiz to an employee
 *     description: Assigns a quiz to an employee by creating a record in the employeeQuiz table. If the combination of employeeId and quizId already exists, it prevents duplication.
 *     tags:
 *       - Employee Quiz
 *     security:
 *       - bearerAuth: [] # Assumes you are using bearer token authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 description: ID of the employee
 *                 example: 101
 *               quizId:
 *                 type: integer
 *                 description: ID of the quiz
 *                 example: 202
 *     responses:
 *       200:
 *         description: Quiz successfully assigned to the employee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Employee quiz added successfully
 *       400:
 *         description: Validation error or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid employeeId or quizId."
 *       409:
 *         description: Employee quiz record already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Employee quiz record already exists.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error occurred."
 */
router.post("/employees", authenticateToken, quizController.employeeQuiz);

/**
 * @swagger
 * /quiz:
 *   get:
 *     summary: Get all quizzes
 *     responses:
 *       200:
 *         description: A list of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   questions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         question:
 *                           type: string
 *                         type:
 *                           type: string
 *                           enum: [Single, Multiple]
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                         rightAnswers:
 *                           type: array
 *                           items:
 *                             type: integer
 *                   employerId:
 *                     type: integer
 *                   userRole:
 *                     type: string
 *                   jobId:
 *                     type: integer
 *                   role:
 *                     type: string
 *                   adminId:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/", authenticateToken, quizController.getAllQuizzes);

/**
 * @swagger
 * /quiz/{id}:
 *   get:
 *     summary: Get a quiz by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The quiz ID
 *     responses:
 *       200:
 *         description: A quiz object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [Single, Multiple]
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                       rightAnswers:
 *                         type: array
 *                         items:
 *                           type: integer
 *                 employerId:
 *                   type: integer
 *                 userRole:
 *                   type: string
 *                 jobId:
 *                   type: integer
 *                 role:
 *                   type: string
 *                 adminId:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Quiz not found
 */
router.get("/:id", authenticateToken, quizController.getQuizById);

/**
 * @swagger
 * /quiz:
 *   post:
 *     summary: Create a new quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [Single, Multiple]
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     rightAnswers:
 *                       type: array
 *                       items:
 *                         type: integer
 *               employerId:
 *                 type: integer
 *               role:
 *                 type: string
 *               userRole:
 *                 type: string
 *               jobId:
 *                 type: integer
 *               adminId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created a new quiz
 *       400:
 *         description: Invalid input
 */
router.post("/", authenticateToken, quizController.createQuiz);

/**
 * @swagger
 * /quiz/{id}:
 *   put:
 *     summary: Update a quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [Single, Multiple]
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     rightAnswers:
 *                       type: array
 *                       items:
 *                         type: integer
 *               employerId:
 *                 type: integer
 *               role:
 *                 type: string
 *               userRole:
 *                 type: string
 *               jobId:
 *                 type: integer
 *               adminId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated quiz
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Quiz not found
 */
router.put("/:id", authenticateToken, quizController.updateQuiz);

/**
 * @swagger
 * /quiz/{id}:
 *   delete:
 *     summary: Delete a quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted
 *       404:
 *         description: Quiz not found
 */
router.delete("/:id", authenticateToken, quizController.deleteQuiz);

module.exports = router;
