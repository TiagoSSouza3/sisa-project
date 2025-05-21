const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Participant = sequelize.define("participant", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  birth_date: DataTypes.DATE,
  address: DataTypes.TEXT,
  notes: DataTypes.TEXT
});

module.exports = Participant;
