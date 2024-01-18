const User = require("../models/User");
const Room = require("../models/room");
const Invite = require("../models/Invites");
const { Op } = require("sequelize");
const Token = require("../models/Token");
const crypto = require("crypto");
const sequelize = require("../util/db");

async function createRoom(req, res) {
  console.log(req.user);

  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    console.log(user);
    if (!user.isPrime) {
      res.status(404).json({ message: "You're not a Prime Member" });
      return;
    }
    const roomExists = await Room.findOne({
      where: { uniqueRoomId: req.body.roomId },
    });
    if (roomExists) {
      res
        .status(500)
        .json({ message: "Choose Other Room id, this one already exists" });
      return;
    }
    const createRoom = await Room.create({
      uniqueRoomId: req.body.roomId,
      creator: user.id,
      roomPassword: req.body.password,
    });
    await user.addRoom(createRoom);
    const token = await Token.create({
      tokenId: crypto.randomUUID(),
    });
    res.status(200).json({
      message: "Room successfully created",
      token,
      room: createRoom,
      user: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "some uncaught error, please try again latter",
      error: err,
    });
  }
}

async function getRoom(req, res, next) {
  try {
    const data = await User.findByPk(req.user.id, { include: Room });
    console.log(data.Rooms);
    res.status(200).json(data.Rooms);
  } catch (err) {
    console.log(err);
    res.json({ message: "There is some Problem" });
  }
}

async function joinRoom(req, res) {
  try {
    const { room_id, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isPrime) {
      if (user.availCoins >= 150) {
        user.update({ availCoins: user.availCoins - 150 });
      } else {
        return res.status(403).json({
          message:
            "Only prime users can join this room for free, You don't have enough coins to join",
        });
      }
    }

    const room = await Room.findOne({
      where: { uniqueRoomId: room_id, roomPassword: password },
    });

    if (!room) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }

    const roomUser = await Room.findByPk(room.id, {
      include: [{ model: User, through: "roomuser" }],
    });
    // console.log(roomUser);
    console.log(roomUser.Users.length, "<<<<");
    if (roomUser.Users.length >= 6) {
      return res.status(403).json({ message: "room's maximum limit reached" });
    }

    let isPresent = false;
    roomUser.Users.map((ele) => {
      if (ele.id === user.id) {
        console.log(ele.id, " ", user.id);
        isPresent = true;
      }
    });

    if (isPresent) {
      return res
        .status(403)
        .json({ message: "You're already part of this group" });
    }
    await user.addRoom(room);
    const token = await Token.create({ tokenId: crypto.randomUUID() });
    const response_data = {
      message: "Successfully Joined the room",
      user,
      room,
      token,
    };

    res.json(response_data);
  } catch (err) {
    console.log(err);
    res.json({ message: "Some Unexpected error", error: err });
  }
}

async function changeChat(req, res, next) {
  try {
    let groupId = req.body.groupId;

    const user = await User.findOne({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const room = await Room.findOne({
      where: { uniqueRoomId: groupId },
    });

    if (!room) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }

    const roomUser = await Room.findByPk(room.id, {
      include: [{ model: User, through: "roomuser" }],
    });

    let isPresent = false;
    roomUser.Users.map((ele) => {
      if (ele.id === user.id) {
        console.log(ele.id, " ", user.id);
        isPresent = true;
      }
    });

    if (!isPresent) {
      return res.status(401).json({ message: "you're not part of this group" });
    }

    const token = await Token.create({ tokenId: crypto.randomUUID() });
    const response_data = {
      message: "Successfully Joined the room",
      user,
      room,
      token,
    };
    res.json(response_data);
  } catch (err) {
    console.log(err);
    res.json({ message: "Some Unexpected error", error: err });
  }
}

async function getUsersToInvite(req, res) {
  try {
    console.log("inside the route");
    const letters = req.query.inputVal;

    const users = await User.findAll({
      where: {
        userId: {
          [Op.like]: `%${letters}%`,
        },
      },
    });

    res.json({ message: "Successfully retreved the users", users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unexpected error", err });
  }
}

async function sendInvite(req, res) {
  try {
    const { userId, roomId } = req.body;
    const room = await Room.findOne({ where: { uniqueRoomId: roomId } });
    if (!room) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }
    console.log(room.creator, " ", req.user.id);
    if (room.creator != req.user.id) {
      return res.status(401).json({
        message: "You're not authorized to invite people to this group",
      });
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user.isPrime) {
      if (user.availCoins >= 150) {
        await User.update(
          { availCoins: user.availCoins - 150 },
          { where: { id: user.id } }
        );
      } else {
        return res.status(401).json({
          message:
            "User you're trying to invite is not a Prime Member and he dosen't have require coins to join",
        });
      }
    }
    const invite = await Invite.create({
      roomId: room.id,
      userId: userId,
      roomName: room.uniqueRoomId,
    });
    res.json({ message: "successfully invited the user" });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      message: "unextected error",
      err: err,
    });
  }
}

async function getInvites(req, res) {
  const userId = req.user.id;
  try {
    const invites = await Invite.findAll({ where: { userId: userId } });
    res.json({ message: "successfully sent all the invites", invites });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function acceptInvite(req, res) {
  try {
    console.log(req.body.id, "<<");
    const invite = await Invite.findOne({ where: { id: req.body.id } });
    await Invite.destroy({ where: { id: req.body.id } });
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    const user = await User.findOne({ where: { id: invite.userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isPrime) {
      if (user.availCoins >= 150) {
        user.update({ availCoins: user.availCoins - 150 });
      } else {
        return res.status(403).json({
          message:
            "Only prime users can join this room for free, You don't have enough coins to join",
        });
      }
    }

    const room = await Room.findOne({
      where: { uniqueRoomId: invite.roomName },
    });

    if (!room) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }

    const roomUser = await Room.findByPk(room.id, {
      include: [{ model: User, through: "roomuser" }],
    });
    // console.log(roomUser);
    console.log(roomUser.Users.length, "<<<<");
    if (roomUser.Users.length >= 6) {
      return res.status(403).json({ message: "room's maximum limit reached" });
    }

    let isPresent = false;
    roomUser.Users.map((ele) => {
      if (ele.id === user.id) {
        console.log(ele.id, " ", user.id);
        isPresent = true;
      }
    });

    if (isPresent) {
      return res
        .status(403)
        .json({ message: "You're already part of this group" });
    }
    await user.addRoom(room);
    const token = await Token.create({ tokenId: crypto.randomUUID() });
    const response_data = {
      message: "Successfully Joined the room",
      user,
      room,
      token,
    };

    res.json(response_data);
  } catch (Err) {
    console.log(Err);
  }
}

async function getUser(req, res) {
  try {
    console.log(req.params.userId);
    let user = await User.findOne({ where: { userId: req.params.userId } });
    res.json({ message: "successfully retreved the user", user });
  } catch (Err) {
    console.log(Err);
    res.status(200).json({ message: "some uncaught error" });
  }
}
module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  changeChat,
  sendInvite,
  getUsersToInvite,
  getInvites,
  acceptInvite,
  getUser,
};
