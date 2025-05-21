const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Document = sequelize.define("document", {
  activity_id: DataTypes.INTEGER,
  title: DataTypes.STRING,
  file_name: DataTypes.STRING,
  file_type: DataTypes.STRING,
  file_data: DataTypes.BLOB("long"),
  created_by: DataTypes.INTEGER,
});

module.exports = Document;
