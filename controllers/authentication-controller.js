const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { check } = require("express-validator");
const User = require("../models/User");
const crypto = require("crypto");
const connection = require("../util/db");
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
    const [existingUser] = await connection
      .promise()
      .query("SELECT * FROM users WHERE userId = ? OR phone = ?", [
        req.body.userId,
        req.body.phone,
      ]);
    console.log(existingUser);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    console.log("enterred");
    const [newUser] = await connection
      .promise()
      .query(
        "INSERT INTO users (userId, deviceId, name, phone, password) VALUES (?, ?, ?, ?, ?)",
        [
          req.body.userId,
          crypto.randomUUID(),
          req.body.name,
          req.body.phone,
          hashedPassword,
        ]
      );
    console.log("sustained");
    console.log(newUser);
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { phone, password } = req.body;

    const [user] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE phone = ?`, [phone]);

    if (user.length <= 0) {
      return res.status(401).json({ error: "Invalid phone" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user[0].userId, id: user[0].id },
      process.env.JWT_KEY,
      {
        expiresIn: "1000h",
      }
    );

    res.json({ token, user: user[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { registerValidatorArray, register, login };
