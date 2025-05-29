const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Subject = sequelize.define('Subject', {
  name: DataTypes.STRING,
  description: DataTypes.TEXT
}, {
  tableName: 'subjects',
  timestamps: false
});

module.exports = Subject; 