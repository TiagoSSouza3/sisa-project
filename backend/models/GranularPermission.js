const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const GranularPermission = sequelize.define("granular_permission", {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  user_role: { type: DataTypes.STRING(50), allowNull: false },
  restricted_layouts: { type: DataTypes.JSON },
  restricted_documents: { type: DataTypes.JSON }
}, {
  indexes: [{ unique: true, fields: ['user_id', 'user_role'] }],
  tableName: 'granular_permissions',
  timestamps: true,
  underscored: true, // Usa snake_case para os nomes das colunas
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = GranularPermission;