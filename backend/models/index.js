const User = require('./User');
const Permission = require('./Permission');
const GranularPermission = require('./GranularPermission');
const Subject = require('./Subject');
const Student = require('./Students');
const Document = require('./Document');
const DocumentTemplate = require('./DocumentTemplate');
const DocumentLayout = require('./DocumentLayout');
const DocumentVersion = require('./DocumentVersion');
const Parent = require('./Parent');
const Students = require('./Students');
const SubjectProfessor = require('./SubjectProfessor');
const SubjectStudent = require('./SubjectStudent');

Subject.belongsToMany(User, {
  through: SubjectProfessor,
  as: 'professores',
  foreignKey: 'subject_id',
  otherKey: 'professor_id'
});
User.belongsToMany(Subject, {
  through: SubjectProfessor,
  as: 'disciplinas',
  foreignKey: 'professor_id',
  otherKey: 'subject_id'
});

Subject.belongsToMany(Students, {
  through: SubjectStudent,
  as: 'students',
  foreignKey: 'subject_id',
  otherKey: 'students_id'
});
Students.belongsToMany(Subject, {
  through: SubjectStudent,
  as: 'subjects',
  foreignKey: 'students_id',
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
Student.belongsTo(Parent, { foreignKey: 'responsible_parent_id', as: 'responsible_parent' });
Parent.hasMany(Student, { foreignKey: 'parent_id', as: 'children' });
Parent.hasMany(Student, { foreignKey: 'second_parent_id', as: 'second_parent_children' });
Parent.hasMany(Student, { foreignKey: 'responsible_parent_id', as: 'responsible_children' });

module.exports = {
  User,
  Permission,
  GranularPermission,
  Subject,
  Student,
  Document,
  DocumentTemplate,
  DocumentLayout,
  DocumentVersion,
  Parent
}; 