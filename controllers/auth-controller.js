// controllers/authController.js

const { Admin } = require("../models");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const generate = await hashPassword(password, 10);
    await Admin.create({
      name,
      email,
      password: generate,
      status: true,
      position: "500",
    });
    res.redirect("/admin");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (admin && (await comparePassword(password, admin.password))) {
      const token = jwt.sign({ id: admin.id }, "techlabJobPortal", {
        expiresIn: "24h", // Token expiration time
      });
      res.cookie("token", token, { httpOnly: true }); // For setting the token as a cookie

      req.session.adminId = admin.id; // Use session or JWT
      res.redirect("/admin/dashboard");
    } else {
      res.render("login", {
        title: "Login Page",
        error: "Invalid Credentials",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      title: "Login Page",
      error: "Internal server error",
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin");
};
