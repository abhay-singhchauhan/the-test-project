// const { DataTypes } = require("sequelize");
// const sequelize = require("../util/db");

// const User = sequelize.define("User", {
//   id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   userId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   deviceId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   phone: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   availCoins: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 150,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   isPrime: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: true,
//   },
// });

// module.exports = User;
