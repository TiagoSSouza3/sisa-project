const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../config");
import { occupationEnum } from "../enums/occupationEnum"

const User = sequelize.define("user", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  occupation_id: ENUM(
    occupationEnum.administrador, 
    occupationEnum.colaborador, 
    occupationEnum.professor
  ),
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
