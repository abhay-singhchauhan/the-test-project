const express = require("express");
const validator = require("../util/verify");
const {
  createRoom,
  getRoom,
  joinRoom,
  changeChat,
} = require("../controllers/chat-controller");
const router = express.Router();

router.post("/api/chatrooms", validator, createRoom);
router.post("/api/joinroom", validator, joinRoom);
router.get("/api/getRooms", validator, getRoom);
router.post("/api/changechat", validator, changeChat);

module.exports = router;
