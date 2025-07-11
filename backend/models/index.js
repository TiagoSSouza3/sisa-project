const User = require('./User');
const Permission = require('./Permission');
const Subject = require('./Subject');
const Student = require('./Students');
const Document = require('./Document');
const DocumentTemplate = require('./DocumentTemplate');
const DocumentVersion = require('./DocumentVersion');
const Parent = require('./Parent');

// Definir relacionamentos
Subject.belongsToMany(User, {
  through: 'subject_professor',
  as: 'professores',
  foreignKey: 'subject_id',
  otherKey: 'professor_id'
});

User.belongsToMany(Subject, {
  through: 'subject_professor',
  as: 'disciplinas',
  foreignKey: 'professor_id',
  otherKey: 'subject_id'
});

// Document associations
Document.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
Document.belongsTo(DocumentTemplate, { foreignKey: 'template_id', as: 'template' });
Document.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Document.belongsTo(User, { foreignKey: 'last_modified_by', as: 'lastModifier' });
Document.hasMany(DocumentVersion, { foreignKey: 'document_id', as: 'versions' });

// DocumentVersion associations
DocumentVersion.belongsTo(Document, { foreignKey: 'document_id', as: 'document' });
DocumentVersion.belongsTo(User, { foreignKey: 'modified_by', as: 'modifier' });

// DocumentTemplate associations
DocumentTemplate.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
DocumentTemplate.hasMany(Document, { foreignKey: 'template_id', as: 'documents' });

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
  DocumentTemplate,
  DocumentVersion,
  Parent
}; 