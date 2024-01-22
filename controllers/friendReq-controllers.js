const connecting = require("../util/db");

async function sendFriendReq(req, res, next) {
  try {
    const reqTo = req.body.reqTo;
    const [user] = await connecting
      .promise()
      .query("SELECT * FROM users WHERE id = ?", [reqTo]);

    if (!user[0]) {
      res.status(404).json({ message: "user dosen't exists" });
    }

    const [addReq] = await connecting
      .promise()
      .query("INSERT INTO friendrequests (sendTo, sentFrom) VALUES (?,?)", [
        reqTo,
        req.user.id,
      ]);

    res.json({ message: "Request sent Successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unextected error" });
  }
}

async function getFriendReq(req, res, next) {
  try {
    const [users] = await connecting
      .promise()
      .query(
        `SELECT users.name, users.id FROM users JOIN friendrequests ON users.id = friendrequests.sentFrom WHERE friendrequests.sendTo = ?`,
        [req.user.id]
      );

    console.log(users);

    res.json({ message: "Successfully got the friend Requests", users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Some unexpected error" });
  }
}

module.exports = { sendFriendReq, getFriendReq };
