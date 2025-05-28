import { DataTypes } from "sequelize";
import sequelize from "../config.js";

const Document = sequelize.define("document", {
  subject_id: DataTypes.INTEGER,
  title: DataTypes.STRING,
  file_name: DataTypes.STRING,
  file_type: DataTypes.STRING,
  file_data: DataTypes.BLOB("long"),
  created_by: DataTypes.INTEGER,
});

export default Document;
