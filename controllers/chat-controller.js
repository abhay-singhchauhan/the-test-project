const User = require("../models/User");
const Room = require("../models/room");
const connection = require("../util/db");
const Token = require("../models/Token");
const crypto = require("crypto");

async function createRoom(req, res) {
  console.log(req.body);
  const uniqueRoomId = req.body.roomId;
  const roomPassword = req.body.password;
  try {
    await connection.promise().beginTransaction(); //using transactons

    const [user] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE id = ?`, [req.user.id]);

    console.log(user[0]);

    if (!user[0].isPrime) {
      res.status(404).json({ message: "You're not a Prime Member" });
      return;
    }

    const [roomExists] = await connection
      .promise()
      .query(`SELECT * FROM rooms WHERE uniqueRoomId = ?`, [req.body.roomId]);

    console.log(roomExists[0]);

    if (roomExists[0]) {
      res
        .status(500)
        .json({ message: "Choose Other Room id, this one already exists" });
      return;
    }

    const [createRoomResult] = await connection
      .promise()
      .query(
        "INSERT INTO rooms (uniqueRoomId, creator, roomPassword) VALUES (?, ?, ?)",
        [uniqueRoomId, user[0].id, roomPassword]
      );

    console.log(createRoomResult);

    const createdRoomId = createRoomResult.insertId;

    await connection
      .promise()
      .query("INSERT INTO roomuser (userId, roomId) VALUES (?, ?)", [
        user[0].id,
        createdRoomId,
      ]);

    const tokenId = crypto.randomUUID();

    const [token] = await connection
      .promise()
      .query("INSERT INTO tokens (tokenId) VALUES (?)", [tokenId]);

    console.log(token);

    let obj = {
      message: "Room successfully created",
      token: { tokenId },
      room: { id: createRoomResult.insertId, uniqueRoomId },
      user: user[0],
    };

    console.log(obj);
    await connection.promise().commit();
    res.status(200).json(obj);
    ////
  } catch (err) {
    console.log(err);
    await connection.promise().rollback();
    res.status(500).json({
      message: "some uncaught error, please try again latter",
      error: err,
    });
  }
}

async function getRoom(req, res, next) {
  try {
    const query = `SELECT users.*, rooms.*
    FROM users
    JOIN roomuser AS ru1 ON ru1.userId = users.id
    JOIN rooms ON ru1.roomId = rooms.id
    WHERE users.id = ?;
    `;
    const data = await connection.promise().query(query, [req.user.id]);
    console.log(data);
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.json({ message: "There is some Problem" });
  }
}

async function joinRoom(req, res) {
  try {
    const { room_id, password } = req.body;
    console.log(req.body);

    await connection.promise().beginTransaction();

    const [user] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE id = ?`, [req.user.id]);

    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user[0].isPrime) {
      if (user[0].availCoins >= 150) {
        connection
          .promise()
          .query(`UPDATE users SET availCoins = ? WHERE id = ?`, [
            user[0].availCoins - 150,
            user[0].id,
          ]);
      } else {
        return res
          .status(403)
          .json({ message: "Only prime users can join this room" });
      }
    }

    const [room] = await connection
      .promise()
      .query(
        `SELECT * FROM rooms WHERE uniqueRoomId = ? AND roomPassword = ?`,
        [room_id, password]
      );

    if (!room[0]) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }

    const [roomUser] = await connection.promise().query(
      `SELECT users.id AS userId, users.*, rooms.*
    FROM rooms
    JOIN roomuser ON rooms.id = roomuser.roomId
    JOIN users ON roomuser.userId = users.id
    WHERE rooms.id = ?;
  `,
      [room[0].id]
    );

    if (roomUser.length >= 6) {
      return res.status(403).json({ message: "room's maximum limit reached" });
    }

    let isPresent = false;
    roomUser.map((ele) => {
      if (ele.userId === user.id) {
        console.log(ele.id, " ", user.id);
        isPresent = true;
      }
    });

    if (isPresent) {
      return res
        .status(403)
        .json({ message: "You're already part of this group" });
    }
    await connection
      .promise()
      .query(`INSERT INTO roomuser (userId, roomId) VALUES(?,?)`, [
        user[0].id,
        room[0].id,
      ]);

    const tokenId = crypto.randomUUID();
    await connection
      .promise()
      .query(`INSERT INTO tokens (tokenId) VALUES (?)`, tokenId);

    let obj = {
      message: "Joined The Room Successfully",
      token: { tokenId },
      room: { id: room[0].id, uniqueRoomId: room[0].uniqueRoomId },
      user: user[0],
    };

    console.log(obj);
    await connection.promise().commit();
    res.json(obj);
  } catch (err) {
    console.log(err);
    await connection.promise().rollback();
    res.json({ message: "Some Unexpected error", error: err });
  }
}

async function changeChat(req, res, next) {
  try {
    let groupId = req.body.groupId;

    await connection.promise().beginTransaction();

    const [user] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE id = ?`, [req.user.id]);

    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    //
    const [room] = await connection
      .promise()
      .query(`SELECT * FROM rooms WHERE uniqueRoomId = ? `, [groupId]);

    if (!room[0]) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }

    //
    const [roomUser] = await connection
      .promise()
      .query(`SELECT * FROM roomuser WHERE userId = ? AND roomId = ?`, [
        user[0].id,
        room[0].id,
      ]);

    if (!roomUser[0]) {
      return res.status(401).json({ message: "you're not part of this group" });
    }

    //
    const tokenId = crypto.randomUUID();
    await connection
      .promise()
      .query(`INSERT INTO tokens (tokenId) VALUES (?)`, tokenId);

    let obj = {
      message: "Joined The Room Successfully",
      token: { tokenId },
      room: { id: room[0].id, uniqueRoomId: room[0].uniqueRoomId },
      user: user[0],
    };

    await connection.promise().commit();
    res.json(obj);
  } catch (err) {
    console.log(err);
    await connection.promise().rollback();
    res.json({ message: "Some Unexpected error", error: err });
  }
}

async function getUsersToInvite(req, res) {
  try {
    console.log("inside the route");
    const letters = req.query.inputVal;

    const [users] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE userId LIKE '%${letters}%'`);

    res.json({ message: "Successfully retreved the users", users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unexpected error", err });
  }
}

async function sendInvite(req, res) {
  try {
    const { userId, roomId } = req.body;

    const [room] = await connection
      .promise()
      .query(`SELECT * FROM rooms WHERE uniqueRoomId = ?`, [roomId]);

    if (!room[0]) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }

    if (room[0].creator !== req.user.id) {
      return res.status(401).json({
        message: "You're not authorized to invite people to this group",
      });
    }

    const [user] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE id = ?`, [userId]);

    if (!user[0]) {
      return res.status(404).json({ message: "Invalid User" });
    }

    const [invite] = await connection
      .promise()
      .query(
        `INSERT INTO invites (roomId, userId, roomName) VALUES (?, ?, ?)`,
        [room[0].id, user[0].id, room[0].uniqueRoomId]
      );

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
    const [invites] = await connection
      .promise()
      .query(`SELECT * FROM invites WHERE userId = ?`, [userId]);
    console.log("these are inveites", invites);
    res.json({ message: "successfully sent all the invites", invites });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function acceptInvite(req, res) {
  try {
    await connection.promise().beginTransaction();

    const [invite] = await connection
      .promise()
      .query(`SELECT * FROM invites WHERE id = ?`, [req.body.id]);

    await connection
      .promise()
      .query(`DELETE FROM invites WHERE id = ?`, [req.body.id]);

    if (!invite[0]) {
      return res.status(404).json({ message: "Invite not found" });
    }

    const [user] = await connection
      .promise()
      .query(`SELECT * FROM users WHERE id = ?`, [invite[0].userId]);

    if (!user[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user[0].isPrime) {
      if (user[0].availCoins >= 150) {
        connection
          .promise()
          .query(`UPDATE users SET availCoins = ? WHERE id = ?`, [
            user[0].availCoins - 150,
            user[0].id,
          ]);
      } else {
        return res
          .status(403)
          .json({ message: "Only prime users can join this room" });
      }
    }

    const [room] = await connection
      .promise()
      .query(`SELECT * FROM rooms WHERE id = ?`, [invite[0].roomId]);

    if (!room[0]) {
      return res.status(401).json({ message: "Invalid room credentials" });
    }

    const [roomUser] = await connection.promise().query(
      `SELECT users.id AS userId, users.*, rooms.*
  FROM rooms
  JOIN roomuser ON rooms.id = roomuser.roomId
  JOIN users ON roomuser.userId = users.id
  WHERE rooms.id = ?;
`,
      [room[0].id]
    );

    if (roomUser.length >= 6) {
      return res.status(403).json({ message: "room's maximum limit reached" });
    }

    let isPresent = false;
    roomUser.map((ele) => {
      if (ele.userId === user.id) {
        console.log(ele.id, " ", user.id);
        isPresent = true;
      }
    });

    if (isPresent) {
      return res
        .status(403)
        .json({ message: "You're already part of this group" });
    }

    await connection
      .promise()
      .query(`INSERT INTO roomuser (userId, roomId) VALUES(?,?)`, [
        user[0].id,
        room[0].id,
      ]);

    const tokenId = crypto.randomUUID();
    await connection
      .promise()
      .query(`INSERT INTO tokens (tokenId) VALUES (?)`, tokenId);

    let obj = {
      message: "Joined The Room Successfully",
      token: { tokenId },
      room: { id: room[0].id, uniqueRoomId: room[0].uniqueRoomId },
      user: user[0],
    };
    await connection.promise().commit();
    res.json(obj);
  } catch (err) {
    console.log(err);
    await connection.promise().rollback();
    res.status(500).json({ message: "Some unexpected error", err });
  }
}

async function getUser(req, res) {
  try {
    console.log(req.params.userId);
    let [user] = await connection
      .promise()
      .query(`SELECT * from users WHERE userId = ?`, [req.params.userId]);
    res.json({ message: "successfully retreved the user", user: user[0] });
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
