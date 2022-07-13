const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
import {
  registrationBodyValidation,
  loginBodyValidation,
} from "../utils/validationSchema";

// Registration
router.post("/register", async (req, res) => {
  try {
    // Validate registration request
    const { error } = registrationBodyValidation(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.message });
    }

    // Check if user already exists for this email address
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({
        error: true,
        message: "Account already exists for this email",
      });
    }

    // Encrypt, salt and hash password - IMPORTANT
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Save User to DB, replacing supplied password with hashed+salted password
    await new User({ ...req.body, password: hashedPassword }).save();
    res
      .status(201)
      .json({ error: false, message: "Account created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Validate login request
    const { error } = loginBodyValidation(req.body);
    if (error) {
      return res.status(400).json({ error: true, message: error.message });
    }

    // Check that user exists for this email address
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "User does not exist" });
    }

    // Compare supplied password against stored password
    const verifiedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!verifiedPassword) {
      return res.status(401).json({ error: true, message: "Invalid password" });
    }
      
    // Generate access and refresh token if email + password correct
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

module.exports = router;
