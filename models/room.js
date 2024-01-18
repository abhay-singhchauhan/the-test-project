const { DataTypes } = require("sequelize");
const sequelize = require("../util/db");

const Room = sequelize.define("Room", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  uniqueRoomId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creator: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Room;
