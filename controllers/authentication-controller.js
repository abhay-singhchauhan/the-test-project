const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { check } = require("express-validator");
const User = require("../models/User");
const crypto = require("crypto");
require("dotenv").config();

let registerValidatorArray = [
  check("userId").notEmpty().withMessage("User ID is required"),
  check("name").notEmpty().withMessage("Name is required"),
  check("phone").notEmpty().withMessage("Phone number is required"),
  check("password").notEmpty().withMessage("Password is required"),
];

async function register(req, res) {
  console.log(req.body, "<<>>");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ userId: req.body.userId }, { phone: req.body.phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    console.log("enterred");
    const newUser = await User.create({
      userId: req.body.userId,
      deviceId: crypto.randomUUID(),
      name: req.body.name,
      phone: req.body.phone,
      password: hashedPassword,
    });
    console.log("sustained");

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({
      where: {
        phone: req.body.phone,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid phone" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.userId, id: user.id },
      process.env.JWT_KEY,
      {
        expiresIn: "1000h",
      }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { registerValidatorArray, register, login };
