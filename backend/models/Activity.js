const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Activity = sequelize.define("activity", {
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  professor_id: DataTypes.INTEGER,
});

module.exports = Activity;
