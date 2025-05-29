const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../config");

const User = sequelize.define("user", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  occupation_id: ENUM('ADMINISTRADOR', 'COLABORADOR', 'PROFESSOR'),
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
