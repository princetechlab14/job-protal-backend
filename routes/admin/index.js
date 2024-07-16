const express = require("express");
const router = express.Router();
const { Employee, AppliedJob, Employer } = require("../../models"); // Define routes
router.get("/", (req, res) => {
  res.render("login", { title: "Login Page", error: "" });
});

// Route to render the dashboard page
router.get("/dashboard", async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const totalEmployers = await Employer.count();
    const totalAppliedJobs = await AppliedJob.count();

    res.render("admin", {
      title: "Dashboard",
      totalEmployees,
      totalAppliedJobs,
      totalEmployers,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to render the Employee page
router.get("/employee", async (req, res) => {
  try {
    const employees = await Employee.findAll(); // Fetch all employees from the database
    res.render("employee", { employees, title: "Employee List" });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to render the Employer page
router.get("/employer", async (req, res) => {
  try {
    const employers = await Employer.findAll(); // Fetch all employees from the database
    res.render("employer", { employers, title: "Employer List" });
  } catch (error) {
    console.error("Error fetching employers:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/employees/:employeeId/status", async (req, res) => {
  const employeeId = req.params.employeeId;
  const { status } = req.body;

  try {
    // Update employee status in the database
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    // Update the status status
    employee.status = status;
    await employee.save();

    // Respond with success message or updated employee data
    res
      .status(200)
      .json({ message: "Employee status updated successfully", employee });
  } catch (error) {
    console.error("Error updating employee status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/employers/:employerId/status", async (req, res) => {
  const employerId = req.params.employerId;
  const { status } = req.body;

  try {
    // Update employee status in the database
    const employer = await Employer.findByPk(employerId);
    if (!employer) {
      return res.status(404).json({ error: "Employee not found" });
    }
    // Update the status status
    employer.status = status;
    await employer.save();

    // Respond with success message or updated employer data
    res
      .status(200)
      .json({ message: "Employee status updated successfully", employer });
  } catch (error) {
    console.error("Error updating employee status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
