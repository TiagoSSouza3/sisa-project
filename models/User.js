import { DataTypes } from "sequelize";
import sequelize from "../config.js";
import OccupationsEnum from "./enums/OccupationsEnum.js";

const User = sequelize.define("user", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  occupation_id: DataTypes.ENUM(OccupationsEnum),
}, {
  tableName: 'user',
  timestamps: false
});

export default User;
