import User from './User.js';
import Permission from './Permission.js';
import Subject from './Subject.js';
import Student from './Students.js';
import Document from './Document.js';
import Parent from './Parent.js';

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

export {
  User,
  Permission,
  Subject,
  Student,
  Document,
  Parent
}; 