// controllers/authController.js

const { Admin } = require("../models");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");

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
    res.redirect("/login");
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
      req.session.adminId = admin.id; // Use session or JWT
      res.redirect("/profile");
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateProfile = async (req, res) => {
  const { name, email, profile } = req.body;
  const adminId = req.session.adminId; // Use session or JWT
  try {
    await Admin.update({ name, email, profile }, { where: { id: adminId } });
    res.redirect("/profile");
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/login");
    }
  });
};
