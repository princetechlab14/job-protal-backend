const employerRoutes = require("./employer-route");
const employeeRoutes = require("./employee-route");
const reviewRoutes = require("./review-route");
const jobsRoute = require("./job-route");
const quizRouter = require("./quiz-router");
const otherJobs = require("./other-job");
const otherJobApply = require("./other-job-apply");
const express = require("express");
const app = express();
// Routes
app.use("/employer", employerRoutes);
app.use("/jobs", jobsRoute);
app.use("/employee", employeeRoutes);
app.use("/reviews", reviewRoutes);
app.use("/quiz", quizRouter);
app.use("/other-jobs", otherJobs);
app.use("/other-job-apply", otherJobApply);
module.exports = {
  apiRoutes: app,
};
