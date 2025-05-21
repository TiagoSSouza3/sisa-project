const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Permission = sequelize.define("permission", {
  occupation_id: DataTypes.INTEGER,
  can_edit_students: DataTypes.BOOLEAN,
  can_edit_activities: DataTypes.BOOLEAN,
  can_upload_documents: DataTypes.BOOLEAN,
  can_edit_permissions: DataTypes.BOOLEAN,
});

module.exports = Permission;
