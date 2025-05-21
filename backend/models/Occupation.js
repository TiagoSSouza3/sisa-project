const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Occupation = sequelize.define("occupation", {
  name: DataTypes.STRING,
});

module.exports = Occupation;
