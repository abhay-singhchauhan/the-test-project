const connection = require("../util/db");

async function sendMessage(req, res, next) {
  try {
    const { userId, roomId, message } = req.body;

    const [user] = await connection
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user[0]) {
      return res.status(404).json({ message: "user not fount" });
    }

    //
    const [room] = await connection
      .promise()
      .query("SELECT * FROM rooms WHERE id = ?", [roomId]);
    if (!room[0]) {
      return res.status(404).json({ message: "room not fount" });
    }

    //

    const [roomuser] = await connection
      .promise()
      .query("SELECT * FROM roomuser WHERE roomId = ? AND userId = ?", [
        roomId,
        userId,
      ]);
    if (!roomuser[0]) {
      return res.status(404).json({ message: "You're not part of this group" });
    }

    //
    const added_message = await connection
      .promise()
      .query("INSERT INTO messages (userId, roomId, message) VALUES (?,?,?)", [
        user[0].id,
        room[0].id,
        message,
      ]);

    res.status(200).json({
      message: "Successfully added the message to the room",
      added_message,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Some unexpected error" });
  }
}

async function getMessage(req, res, next) {
  try {
    const { lastMessage, roomId } = req.query;

    let isMore = true;
    const [messages] = await connection
      .promise()
      .query(
        `SELECT * FROM messages WHERE id < ? AND roomId = ? ORDER BY id DESC LIMIT 20`,
        [lastMessage, roomId]
      );

    if (messages.length < 20) {
      isMore = false;
    }

    res.json({ message: "Successfully retreved messages", isMore, messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unextected error" });
  }
}

module.exports = { sendMessage, getMessage };
