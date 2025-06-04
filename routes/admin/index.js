const express = require("express");
const router = express.Router();
const {
  Employee,
  AppliedJob,
  Employer,
  Job,
  Admin,
  Roles,
  Quiz,
  OtherCategory,
  OtherJob,
  OtherJobApply
} = require("../../models"); // Define routes
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
router.get("/logout", authController.logout);

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
// Utility function to parse skills if in local environment
function parseSkillsForLocal(roles) {
  if (process.env.DEV_TYPE === "local") {
    return roles.map((role) => {
      role.skills = JSON.parse(role.skills);
      return role;
    });
  }
  return roles;
}
// Get roles index
router.get("/roles", authenticateJWT, async (req, res) => {
  try {
    let roles = await Roles.findAll();
    // roles = parseSkillsForLocal(roles);
    res.render("roles/index", { roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get create form
router.get("/roles/create", authenticateJWT, (req, res) => {
  res.render("roles/create");
});

// Handle create form submission
router.post("/roles/create", authenticateJWT, async (req, res) => {
  const { role, skills } = req.body;
  try {
    console.log(skills);
    if (!role || !skills) {
      return res.status(400).send("Role and Skills are required");
    }
    await Roles.create({ role, skills });
    res.redirect("/admin/roles");
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get edit form
router.get("/roles/edit/:id", authenticateJWT, async (req, res) => {
  const role = await Roles.findByPk(req.params.id);
  if (process.env.DEV_TYPE === "local") {
    role.skills = JSON.parse(role.skills);
  }
  if (!role) {
    return res.status(404).send("Role not found");
  }
  res.render("roles/edit", { role });
});

// Handle edit form submission
router.post("/roles/edit/:id", authenticateJWT, async (req, res) => {
  const { role, skills } = req.body;
  try {
    if (!role || !skills) {
      return res.status(400).send("Role and Skills are required");
    }
    await Roles.update({ role, skills }, { where: { id: req.params.id } });
    res.redirect("/admin/roles");
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Add the delete route
router.post("/roles/delete/:id", authenticateJWT, async (req, res) => {
  const roleId = req.params.id;
  try {
    const role = await Roles.findByPk(roleId);
    if (!role) {
      return res.status(404).send("Role not found");
    }

    await Roles.destroy({ where: { id: roleId } });
    res.redirect("/admin/roles");
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Add the following route to fetch and display all quizzes with job titles
router.get("/quiz", authenticateJWT, async (req, res) => {
  try {
    // Fetch all quizzes from the database
    const quizzes = await Quiz.findAll({
      include: [
        {
          model: Job,
          as: "job", // Ensure this alias matches your Quiz model definition
          attributes: ["jobTitle"], // Only fetch the job title
        },
      ],
    });

    // Parse the 'questions' field if it's a string and in local development
    // if (process.env.DEV_TYPE === "local") {
    const parsedQuizzes = quizzes.map((quiz) => {
      const quizData = quiz.toJSON();
      if (typeof quizData.questions === "string") {
        try {
          quizData.questions = JSON.parse(quizData.questions);
        } catch (error) {
          quizData.questions = quizData.questions; // Keep as string if parsing fails
        }
      }
      return quizData;
    });
    res.render("quiz/index", { quizzes: parsedQuizzes, title: "Quiz List" });
    // } else {
    //   res.render("quiz/index", { quizzes, title: "Quiz List" });
    // }
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Route to render the quiz creation form
router.get("/quiz/create", authenticateJWT, async (req, res) => {
  try {
    const jobs = await Job.findAll(); // Fetch all jobs to populate the select dropdown
    res.render("quiz/create", { title: "Create Quiz", jobs });
  } catch (error) {
    console.error("Error fetching jobs for quiz creation:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle quiz creation
router.post("/quiz/create", authenticateJWT, async (req, res) => {
  const { jobId, questions } = req.body;
  try {
    if (!jobId || !questions) {
      return res.status(400).send("Job and Questions are required");
    }

    // Create a new quiz
    await Quiz.create({
      jobId,
      questions,
    });

    res.redirect("/admin/quiz");
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/quizzes/delete/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Quiz.destroy({
      where: { id: id },
    });

    if (deleted) {
      return res.redirect("/admin/quiz");
    } else {
      return res.status(404).send("Quiz not found");
    }

  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/quizzes/edit/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).send("quiz not found");
    }
    const questions = JSON.parse(quiz.questions);
    console.log("questions =>", questions);
    const jobs = await Job.findAll();
    res.render("quiz/edit", { title: "Edit Quiz", jobs, quiz, questions });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/quizzes/edit/:id", authenticateJWT, async (req, res) => {
  const { jobId, questions } = req.body;
  const { id } = req.params;
  try {
    if (!jobId || !questions) {
      return res.status(400).send("Job and Questions are required");
    }
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).send("quiz not found");
    }
    quiz.jobId = jobId;
    quiz.questions = questions;
    await quiz.save();
    res.redirect("/admin/quiz");
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get other-category index
router.get("/other-category", authenticateJWT, async (req, res) => {
  try {
    let otherCategories = await OtherCategory.findAll();
    res.render("otherCategory/index", { otherCategories });
  } catch (error) {
    console.error("Error fetching otherCategory:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get create form
router.get("/other-category/create", authenticateJWT, (req, res) => {
  res.render("otherCategory/create");
});

// Handle create form submission
router.post("/other-category", authenticateJWT, async (req, res) => {
  const { title, shorting = 50 } = req.body;
  try {
    if (!title) return res.status(400).send("Title are required");
    await OtherCategory.create({ title, shorting });
    res.redirect("/admin/other-category");
  } catch (error) {
    console.error("Error creating other-category:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get edit form
router.get("/other-category/edit/:id", authenticateJWT, async (req, res) => {
  const otherCategory = await OtherCategory.findByPk(req.params.id);
  if (!otherCategory) return res.status(404).send("Other Category not found");
  res.render("otherCategory/edit", { otherCategory });
});

// Handle edit form submission
router.post("/other-category/edit/:id", authenticateJWT, async (req, res) => {
  const { title, shorting = 50 } = req.body;
  try {
    if (!title) return res.status(400).send("Title are required");
    await OtherCategory.update({ title, shorting }, { where: { id: req.params.id } });
    res.redirect("/admin/other-category");
  } catch (error) {
    console.error("Error updating Other Category:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add the delete route
router.post("/other-category/delete/:id", authenticateJWT, async (req, res) => {
  const id = req.params.id;
  try {
    const otherCategory = await OtherCategory.findByPk(id);
    if (!otherCategory) return res.status(404).send("OtherCategory not found");
    await OtherCategory.destroy({ where: { id } });
    res.redirect("/admin/other-category");
  } catch (error) {
    console.error("Error deleting other-category:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Get other-category index
router.get("/other-job", authenticateJWT, async (req, res) => {
  try {
    let otherJobs = await OtherJob.findAll({
      include: [{ model: OtherCategory, as: "other_category", attributes: ["title"], }]
    });
    res.render("otherJobs/index", { otherJobs });
  } catch (error) {
    console.error("Error fetching otherJobs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get create form
router.get("/other-job/create", authenticateJWT, async (req, res) => {
  const otherCategories = await OtherCategory.findAll();
  res.render("otherJobs/create", { otherCategories });
});

// Handle create form submission
router.post("/other-job", authenticateJWT, async (req, res) => {
  const { otherCategoryId = null, title, shorting = 50, image = null, description = null, link = null, short_desc = null } = req.body;
  try {
    if (!title) return res.status(400).send("Title are required");
    await OtherJob.create({ otherCategoryId, title, image, description, shorting, link, short_desc });
    res.redirect("/admin/other-job");
  } catch (error) {
    console.error("Error creating other-job:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get edit form
router.get("/other-job/edit/:id", authenticateJWT, async (req, res) => {
  const otherJob = await OtherJob.findByPk(req.params.id);
  const otherCategories = await OtherCategory.findAll();
  if (!otherJob) return res.status(404).send("Other Job not found");
  res.render("otherJobs/edit", { otherJob, otherCategories });
});

// Handle edit form submission
router.post("/other-job/edit/:id", authenticateJWT, async (req, res) => {
  const { otherCategoryId = null, title, shorting = 50, image = null, description = null, link = null, short_desc = null } = req.body;
  try {
    if (!title) return res.status(400).send("Title are required");
    await OtherJob.update({ otherCategoryId, title, image, description, shorting, link, short_desc }, { where: { id: req.params.id } });
    res.redirect("/admin/other-job");
  } catch (error) {
    console.error("Error updating other-job:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add the delete route
router.post("/other-job/delete/:id", authenticateJWT, async (req, res) => {
  const id = req.params.id;
  try {
    const otherJob = await OtherJob.findByPk(id);
    if (!otherJob) return res.status(404).send("otherJob not found");
    await OtherJob.destroy({ where: { id } });
    res.redirect("/admin/other-job");
  } catch (error) {
    console.error("Error deleting other-job:", error);
    res.status(500).send("Internal Server Error");
  }
});

// other job apply
router.get("/other-job-apply", authenticateJWT, async (req, res) => {
  try {
    let otherJobApply = await OtherJobApply.findAll();
    res.render("otherJobApply/index", { otherJobApply });
  } catch (error) {
    console.error("Error fetching otherJobApply:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/other-job-apply/:id", authenticateJWT, async (req, res) => {
  try {
    let otherJobApply = await OtherJobApply.findByPk(req.params.id);
    if (!otherJobApply) return res.status(404).send("Other Job applied not found");
    res.render("otherJobApply/show", { otherJobApply });
  } catch (error) {
    console.error("Error fetching otherJobApply:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/other-job-apply/delete/:id", authenticateJWT, async (req, res) => {
  const id = req.params.id;
  try {
    const otherJobApplied = await OtherJobApply.findByPk(id);
    if (!otherJobApplied) return res.status(404).send("Other job applied not found");
    await OtherJobApply.destroy({ where: { id } });
    res.redirect("/admin/other-job-apply");
  } catch (error) {
    console.error("Error deleting other-job-apply:", error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
