const express = require("express");
const router = express.Router();
const otherJobsController = require("../../controllers/other-job-controller");

/**
 * @swagger
 * tags:
 *   name: OtherJobs
 *   description: Operations related to other jobs
 */

/**
 * @swagger
 * /other-jobs:
 *   get:
 *     summary: Retrieve all other jobs
 *     tags: [OtherJobs]
 *     responses:
 *       200:
 *         description: A list of other jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     otherJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 3
 *                           title:
 *                             type: string
 *                             example: "jkmjkj"
 *                           shorting:
 *                             type: integer
 *                             example: 0
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-27T05:53:40.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-27T05:53:40.000Z"
 *                           other_jobs:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 1
 *                                 otherCategoryId:
 *                                   type: integer
 *                                   example: 2
 *                                 title:
 *                                   type: string
 *                                   example: "sdas update"
 *                                 image:
 *                                   type: string
 *                                   format: uri
 *                                   example: "https://github.com/princetechlab14/job-protal-backend update"
 *                                 description:
 *                                   type: string
 *                                   example: "<p>dsdasddsdsd dsdsdsdsdsdsdsadsdsdsd update</p>\r\n"
 *                                 shorting:
 *                                   type: integer
 *                                   example: 6966
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2025-03-27T05:54:20.000Z"
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                                   example: "2025-03-27T06:02:30.000Z"
 *       500:
 *         description: Server error
 */
router.get("/", otherJobsController.getAllOtherJobs);

/**
 * @swagger
 * /other-jobs/{id}:
 *   get:
 *     summary: Get a single other job by ID
 *     tags: [OtherJobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the other job
 *     responses:
 *       200:
 *         description: Successfully retrieved the other job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     otherJob:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         otherCategoryId:
 *                           type: integer
 *                           example: 2
 *                         title:
 *                           type: string
 *                           example: "sdas update"
 *                         image:
 *                           type: string
 *                           format: uri
 *                           example: "https://github.com/princetechlab14/job-protal-backend update"
 *                         description:
 *                           type: string
 *                           example: "<p>dsdasddsdsd dsdsdsdsdsdsdsadsdsdsd update</p>\r\n"
 *                         shorting:
 *                           type: integer
 *                           example: 6966
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-03-27T05:54:20.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-03-27T06:02:30.000Z"
 *                         other_category:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 2
 *                             title:
 *                               type: string
 *                               example: "dsads"
 *                             shorting:
 *                               type: integer
 *                               example: 0
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-03-27T05:53:33.000Z"
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-03-27T05:53:33.000Z"
 *                     otherCategoryJobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           otherCategoryId:
 *                             type: integer
 *                             example: 2
 *                           title:
 *                             type: string
 *                             example: "sdas update"
 *                           image:
 *                             type: string
 *                             format: uri
 *                             example: "https://github.com/princetechlab14/job-protal-backend update"
 *                           description:
 *                             type: string
 *                             example: "<p>dsdasddsdsd dsdsdsdsdsdsdsadsdsdsd update</p>\r\n"
 *                           shorting:
 *                             type: integer
 *                             example: 6966
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-27T05:54:20.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-27T06:02:30.000Z"
 *       400:
 *         description: Bad request - Invalid ID supplied
 *       404:
 *         description: Other job not found
 *       500:
 *         description: Server error
 */
router.get("/:id", otherJobsController.getSingleOtherJobs);

module.exports = router;
