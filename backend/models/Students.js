const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Students = sequelize.define("students", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  birth_date: DataTypes.DATE,
  address: DataTypes.TEXT,
  notes: DataTypes.TEXT
});

module.exports = Students;
