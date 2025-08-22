const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../config");

const User = sequelize.define("user", {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  occupation_id: DataTypes.INTEGER,
  first_login: { type: DataTypes.BOOLEAN, defaultValue: true },
  reset_token: DataTypes.STRING,
  reset_token_expires: DataTypes.DATE,
}, {
  tableName: 'user',
  timestamps: false
});

module.exports = User;
