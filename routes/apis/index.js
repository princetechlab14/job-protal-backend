const employerRoutes = require("./employer-route");
const employeeRoutes = require("./employee-route");
const reviewRoutes = require("./review-route");
const jobsRoute = require("./job-route");
const express = require("express");
const app = express();
// Routes
app.use("/employer", employerRoutes);
app.use("/jobs", jobsRoute);
app.use("/employee", employeeRoutes);
app.use("/reviews", reviewRoutes);

module.exports = {
  apiRoutes: app,
};
