const User = require('./User');
const Permission = require('./Permission');
const Subject = require('./Subject');
const Student = require('./Student');
const Document = require('./Document');

// Definir relacionamentos
Subject.belongsTo(User, { foreignKey: 'professor_id' });
User.hasMany(Subject, { foreignKey: 'professor_id' });

Document.belongsTo(Subject);
Subject.hasMany(Document);

Document.belongsTo(User, { foreignKey: 'created_by' });
User.hasMany(Document, { foreignKey: 'created_by' });

module.exports = {
  User,
  Occupation,
  Permission,
  Student,
  Subject,
  Document
}; 