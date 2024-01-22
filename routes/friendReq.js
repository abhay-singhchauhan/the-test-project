const express = require("express");
const {
  sendFriendReq,
  getFriendReq,
} = require("../controllers/friendReq-controllers");
const validator = require("../util/verify");

const router = express.Router();

router.post("/api/friend-requests", validator, sendFriendReq);
router.get("/api/get-requests", validator, getFriendReq);

module.exports = router;
