const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Storage = sequelize.define("storage", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  last_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  last_price_date: {
    type: DataTypes.DATE
  },
  amount: {
    type: DataTypes.INTEGER
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'storage',
  timestamps: false
});

module.exports = Storage; 