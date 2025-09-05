const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const StorageLog = sequelize.define("storage_log", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_item: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  last_change: {
    type: DataTypes.STRING
  },
  value_diference: {
    type: DataTypes.INTEGER
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
  }
}, {
  tableName: 'storage_log',
  timestamps: false
});

module.exports = StorageLog; 