const express = require("express");
const {
  sendMessage,
  getMessage,
} = require("../controllers/messages-controller");
const validator = require("../util/verify");

const router = express.Router();

router.post("/api/messages", validator, sendMessage);
router.get("/api/get-messages", validator, getMessage);

module.exports = router;
