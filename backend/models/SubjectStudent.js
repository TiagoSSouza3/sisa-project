const sequelize = require("../config");

const SubjectStudent = sequelize.define("SubjectStudent", {}, {
    tableName: 'subject_students',
    timestamps: false
  });

module.exports = SubjectStudent;
  