const express = require("express");
const { authenticateToken } = require("../../middleware/verifyToken");
const {
  addReview,
  deleteReview,
  getAllEmployers,
  getReviewsByEmployerId,
  getAllReviewsByEmployeeId,
} = require("../../controllers/review-controller");
const { ensureEmployee } = require("../../middleware/ensureEmployee");
const router = express.Router();

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Add a review
 *     description: Adds a review for an employee.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employerId:
 *                 type: integer
 *                 example: 1
 *               comment:
 *                 type: string
 *                 example: "Great place to work!"
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               description:
 *                 type: string
 *                 example: "hello this is description"
 *     responses:
 *       200:
 *         description: Review added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticateToken, ensureEmployee, addReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Deletes a review by its ID.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticateToken, deleteReview);

/**
 * @swagger
 * /reviews/employers:
 *   get:
 *     summary: Get all employers
 *     description: Retrieves a list of all employers.
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: companyName
 *         schema:
 *           type: string
 *         description: Compony Name of the employee to search for
 *     responses:
 *       200:
 *         description: Employers retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/employers", getAllEmployers);

/**
 * @swagger
 * /reviews/employer/{id}:
 *   get:
 *     summary: Get all reviews by employer ID
 *     description: Retrieves all reviews for a specific employer, including review counts and average rating.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employer ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Reviews not found
 *       500:
 *         description: Internal server error
 */
router.get("/employer/:id", getReviewsByEmployerId);

/**
 * @swagger
 * /reviews/employee:
 *   get:
 *     summary: Get all reviews by employee ID
 *     description: Retrieves all reviews for a specific employee, including review counts and average rating.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Reviews not found
 *       500:
 *         description: Internal server error
 */
router.get("/employee", authenticateToken, getAllReviewsByEmployeeId);

module.exports = router;
