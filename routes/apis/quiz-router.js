const express = require("express");
const quizController = require("../../controllers/quiz-controller");

const router = express.Router();

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
router.get("/", quizController.getAllQuizzes);

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
router.get("/:id", quizController.getQuizById);

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
router.post("/", quizController.createQuiz);

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
router.put("/:id", quizController.updateQuiz);

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
router.delete("/:id", quizController.deleteQuiz);

module.exports = router;
