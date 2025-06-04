const express = require("express");
const router = express.Router();
const otherJobApplyController = require("../../controllers/otherJobApplyController");

router.get("/", otherJobApplyController.getAllOtherJobs);
router.get("/:id", otherJobApplyController.getSingleOtherJobs);
router.post("/", otherJobApplyController.otherJobApplyPost);
module.exports = router;