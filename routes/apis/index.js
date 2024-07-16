const employerRoutes = require("./employer-route");
const employeeRoutes = require("./employee-route");
const jobsRoute = require("./job-route");
const express = require("express");
const app = express();
// Routes
app.use("/employer", employerRoutes);
app.use("/jobs", jobsRoute);
app.use("/employee", employeeRoutes);

module.exports = {
  apiRoutes: app,
};
