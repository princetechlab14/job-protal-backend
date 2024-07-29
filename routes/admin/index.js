const express = require("express");
const router = express.Router();
const { Employee, AppliedJob, Employer, Job, Admin } = require("../../models"); // Define routes
const authController = require("../../controllers/auth-controller");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, "techlabJobPortal");
    console.log(decoded, "dsadasdsadsa");
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token", err);
  }
  return next();
};
router.get("/", (req, res) => {
  res.render("login", { title: "Login Page", error: "" });
});

// Route to render the dashboard page
router.get("/dashboard", authenticateJWT, async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const totalEmployers = await Employer.count();
    const totalAppliedJobs = await AppliedJob.count();
    const totalJobs = await Job.count();
    // Assuming 'hired' is a status indicating the job has been hired
    const hiredCount = await AppliedJob.count({
      where: { employerStatus: "hired" },
    });

    res.render("admin", {
      title: "Dashboard",
      totalEmployees,
      totalAppliedJobs,
      totalEmployers,
      totalJobs,
      hiredCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to render the Employee page
router.get("/employee", authenticateJWT, async (req, res) => {
  try {
    const employees = await Employee.findAll(); // Fetch all employees from the database
    res.render("employee", { employees, title: "Employee List" });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to render the Employer page
router.get("/employer", authenticateJWT, async (req, res) => {
  try {
    const employers = await Employer.findAll(); // Fetch all employees from the database
    res.render("employer", { employers, title: "Employer List" });
  } catch (error) {
    console.error("Error fetching employers:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put(
  "/employees/:employeeId/status",
  authenticateJWT,
  async (req, res) => {
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
  }
);

router.put(
  "/employers/:employerId/status",
  authenticateJWT,
  async (req, res) => {
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
  }
);
// Registration and Login Routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Logout Route
router.get("/logout", authenticateJWT, authController.logout);

// Serve EJS views
router.get("/register", (req, res) =>
  res.render("register", { title: "Register Page", error: "" })
);

// Route to render the profile page with admin details
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.user;
    const admin = await Admin.findOne({ where: { id } });
    console.log(admin);
    if (admin) {
      res.render("profile", {
        title: "Update Profile Page",
        admin, // Pass the admin object to the view
        error: "",
      });
    } else {
      res.render("profile", {
        title: "Update Profile Page",
        admin: null, // Pass null if admin is not found
        error: "Admin not found",
      });
    }
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.render("profile", {
      title: "Update Profile Page",
      admin: null, // Pass null in case of error
      error: "Internal server error",
    });
  }
});

// Route to handle profile update
router.post("/profile", authenticateJWT, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    console.log("User Data:", req.user); // Log the user data

    const { id } = req.user;
    const admin = await Admin.findOne({ where: { id } });
    if (admin) {
      admin.name = name;
      admin.email = email;
      if (password) {
        admin.password = await bcrypt.hash(password, 10);
      }
      await admin.save();
      res.redirect("/admin/profile");
    } else {
      res.render("profile", {
        title: "Update Profile Page",
        admin: null,
        error: "Admin not found",
      });
    }
  } catch (error) {
    console.error("Error updating admin details:", error);
    res.render("profile", {
      title: "Update Profile Page",
      admin: null,
      error: "Internal server error",
    });
  }
});

module.exports = router;
