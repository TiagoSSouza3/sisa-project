const { DataTypes } = require('sequelize');
const sequelize = require("../config");

const SubjectStudent = sequelize.define("SubjectStudent", {
  subject_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  students_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'subject_students',
  timestamps: false
});

module.exports = SubjectStudent;
  