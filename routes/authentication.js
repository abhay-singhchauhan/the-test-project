const express = require("express");
const {
  register,
  registerValidatorArray,
  login,
} = require("../controllers/authentication-controller");
const router = express.Router();
router.post("/api/register", registerValidatorArray, register);

router.post("/api/login", login);

module.exports = router;
