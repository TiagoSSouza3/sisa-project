const User = require('./User');
const Permission = require('./Permission');
const Subject = require('./Subject');
const Student = require('./Students');
const Document = require('./Document');
const Parent = require('./Parent');

// Definir relacionamentos
Subject.belongsTo(User, { foreignKey: 'professor_id' });
User.hasMany(Subject, { foreignKey: 'professor_id' });

Document.belongsTo(Subject);
Subject.hasMany(Document);

Document.belongsTo(User, { foreignKey: 'created_by' });
User.hasMany(Document, { foreignKey: 'created_by' });

// Student and Parent relationships
Student.belongsTo(Parent, { foreignKey: 'parent_id', as: 'parent' });
Student.belongsTo(Parent, { foreignKey: 'second_parent_id', as: 'second_parent' });
Parent.hasMany(Student, { foreignKey: 'parent_id', as: 'children' });
Parent.hasMany(Student, { foreignKey: 'second_parent_id', as: 'second_parent_children' });

module.exports = {
  User,
  Permission,
  Subject,
  Student,
  Document,
  Parent
}; 