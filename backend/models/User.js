const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../config");
const OccupationsEnum = require("./enums/OccupationsEnum");

const User = sequelize.define("user", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  occupation_id: ENUM(OccupationsEnum),
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
