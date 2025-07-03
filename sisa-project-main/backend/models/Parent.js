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
    type: DataTypes.DATE
  },
  RG: {
    type: DataTypes.CHAR(12)
  },
  CPF: {
    type: DataTypes.CHAR(15)
  },
  occupation: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'parent',
  timestamps: false
});

module.exports = Parent; 