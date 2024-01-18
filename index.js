const express = require("express");
const app = express();
const db = require("./util/db");
const http = require("http");
const path = require("path");
const User = require("./models/User");
const Room = require("./models/room");
const Token = require("./models/Token");

const { Socket, Server } = require("socket.io");
const authenticationRouter = require("./routes/authentication");
const chatrooms = require("./routes/chat");

const cors = require("cors");
app.use(express.json());
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, "frontend")));

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(authenticationRouter);
app.use(chatrooms);

app.use((req, res, next) => {
  console.log(req.url);
  res.sendFile(path.join(__dirname, req.url));
  console.log(path.join(__dirname, req.url));
  console.log(req.url);
});
app.use("/", (req, res) => {
  res.send("thik hai");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:2000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", async (room) => {
    let token = await Token.findOne({ where: { tokenId: room.tokenId } });

    if (token.isValid) {
      await Token.update(
        { isValid: false },
        { where: { tokenId: room.tokenId } }
      );
      socket.join(room.roomId);
      io.to(room.roomId).emit("joinedRoom", {
        message: `${room.userName} Joined the Room`,
        roomName: room.roomId,
      });
    } else {
      socket.emit("invalidAccess", {
        message: `invalid access, you cannot join the room ${room.roomId}`,
      });
    }

    console.log(room);
  });
  socket.on("leave", (groupId) => {
    socket.leave(groupId);
    console.log(socket.eventNames);
    console.log("I left, group", groupId);
  });
  socket.on("messageSent", (obj) => {
    console.log(obj);
    io.to(obj.groupId).emit("takeMessage", obj);
  });
});

User.belongsToMany(Room, { through: "roomuser" });
Room.belongsToMany(User, { through: "roomuser" });

db.sync().then(() => {
  server.listen(2000, () => {
    console.log("Server is running");
  });
});
