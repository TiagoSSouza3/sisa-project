import { DataTypes } from 'sequelize';
import sequelize from '../config.js';

const Subject = sequelize.define('Subject', {
  name: DataTypes.STRING,
  description: DataTypes.TEXT
}, {
  tableName: 'subjects',
  timestamps: false
});

export default Subject; 