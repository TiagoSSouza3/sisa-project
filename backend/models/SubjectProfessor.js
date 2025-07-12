const sequelize = require("../config");

const SubjectProfessor = sequelize.define("SubjectProfessor", {}, {
    tableName: 'subject_professor',
    timestamps: false
  });

module.exports = SubjectProfessor;
  