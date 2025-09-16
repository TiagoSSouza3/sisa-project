const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const GlobalPermission = sequelize.define("global_permission", {
  role: { 
    type: DataTypes.ENUM('professor', 'colaborador'), 
    allowNull: false 
  },
  permission_name: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  is_allowed: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  }
}, {
  tableName: 'global_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['role', 'permission_name']
    }
  ]
});

module.exports = GlobalPermission;