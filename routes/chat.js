const express = require("express");
const validator = require("../util/verify");
const {
  createRoom,
  getRoom,
  joinRoom,
  changeChat,
  sendInvite,
  getUsersToInvite,
  getInvites,
  acceptInvite,
  getUser,
} = require("../controllers/chat-controller");
const router = express.Router();

router.post("/api/chatrooms", validator, createRoom);
router.post("/api/joinroom", validator, joinRoom);
router.get("/api/getRooms", validator, getRoom);
router.post("/api/changechat", validator, changeChat);
router.post("/api/invite", validator, sendInvite);
router.post("/api/accept-invite", validator, acceptInvite);
router.get("/api/users-for-invite", validator, getUsersToInvite);
router.get("/api/invite-details", validator, getInvites);
router.get("/api/profile/:userId", validator, getUser);

module.exports = router;
