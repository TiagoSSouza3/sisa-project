const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT
}, {
  tableName: 'subjects',
  timestamps: false
});

module.exports = Subject; 