const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const SummaryData = sequelize.define('summary_data', {
  students_active: DataTypes.INTEGER,
  students_total: DataTypes.INTEGER,
  students_male: DataTypes.INTEGER,
  students_female: DataTypes.INTEGER,
  students_family_income: DataTypes.INTEGER,
  students_with_NIS: DataTypes.INTEGER
});

module.exports = SummaryData;