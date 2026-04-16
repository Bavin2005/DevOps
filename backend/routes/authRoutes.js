const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET, COMPANY_EMAIL_DOMAIN } = require("../config/constants");

const router = express.Router();

function isValidCompanyEmail(email) {
  if (!email || typeof email !== "string") return false;
  const domain = COMPANY_EMAIL_DOMAIN.toLowerCase().replace(/^@/, "");
  const emailLower = email.toLowerCase().trim();
  return emailLower.endsWith(`@${domain}`);
}

/* REGISTER */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!isValidCompanyEmail(email)) {
      return res.status(400).json({
        message: `Email must use company domain (@${COMPANY_EMAIL_DOMAIN}). Use your institution email to sign up.`,
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email. Use Login instead." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name?.trim() || "User",
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "Employee",
      department: department?.trim() || "",
    });

    // Generate token for auto-login after registration
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidCompanyEmail(email)) {
      return res.status(400).json({
        message: `Please use your company email (@${COMPANY_EMAIL_DOMAIN}) to sign in.`,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
