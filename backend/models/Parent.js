const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Parent = sequelize.define("parent", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  RG: {
    type: DataTypes.CHAR(12),
    allowNull: true
  },
  CPF: {
    type: DataTypes.CHAR(15),
    allowNull: true
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  degree_of_kinship: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'parent',
  timestamps: false
});

module.exports = Parent; 