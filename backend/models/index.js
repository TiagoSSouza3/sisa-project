const User = require('./User');
const Occupation = require('./Occupation');
const Permission = require('./Permission');
const Participant = require('./Participant');
const Activity = require('./Activity');
const Document = require('./Document');

// Definir relacionamentos
User.belongsTo(Occupation);
Occupation.hasMany(User);

Permission.belongsTo(Occupation);
Occupation.hasOne(Permission);

Activity.belongsTo(User, { foreignKey: 'professor_id' });
User.hasMany(Activity, { foreignKey: 'professor_id' });

Document.belongsTo(Activity);
Activity.hasMany(Document);

Document.belongsTo(User, { foreignKey: 'created_by' });
User.hasMany(Document, { foreignKey: 'created_by' });

module.exports = {
  User,
  Occupation,
  Permission,
  Participant,
  Activity,
  Document
}; 