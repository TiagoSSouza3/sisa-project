const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Permission = sequelize.define("permission", {
  user_id: { type: DataTypes.INTEGER, unique: true },
  can_access_dashboard: { type: DataTypes.BOOLEAN, defaultValue: true },
  can_access_users: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_access_students: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_access_subjects: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_access_documents: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_access_storage: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_access_summary_data: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // Permissões específicas para documentos
  can_view_documents: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_edit_documents: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_upload_documents: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_view_layouts: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_edit_layouts: { type: DataTypes.BOOLEAN, defaultValue: false },
  can_upload_layouts: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  // Permissões por role para documentos (JSON para armazenar arrays de roles)
  document_view_roles: { type: DataTypes.JSON, allowNull: true },
  document_edit_roles: { type: DataTypes.JSON, allowNull: true },
  document_upload_roles: { type: DataTypes.JSON, allowNull: true },
  layout_view_roles: { type: DataTypes.JSON, allowNull: true },
  layout_edit_roles: { type: DataTypes.JSON, allowNull: true },
  layout_upload_roles: { type: DataTypes.JSON, allowNull: true },
}, {
  timestamps: false  // Desabilitado temporariamente até executar a migração
});

module.exports = Permission;
