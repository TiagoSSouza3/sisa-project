const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const User = sequelize.define("user", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  occupation_id: DataTypes.INTEGER,
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
