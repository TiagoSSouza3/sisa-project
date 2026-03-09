const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Students = sequelize.define('students', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registration: DataTypes.INTEGER,
  parent_id: DataTypes.INTEGER,
  second_parent_id: DataTypes.INTEGER,
  responsible_parent_id: DataTypes.INTEGER,
  CPF: DataTypes.CHAR(15),
  gender: DataTypes.STRING,
  skin_color: DataTypes.STRING,
  RG: DataTypes.CHAR(12),
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  second_phone: DataTypes.STRING,
  responsable: DataTypes.STRING,
  degree_of_kinship: DataTypes.STRING,
  UBS: DataTypes.STRING,
  is_on_school: DataTypes.BOOLEAN,
  school_year: DataTypes.STRING,
  school_name: DataTypes.STRING,
  school_period: DataTypes.STRING,
  birth_date: DataTypes.DATE,
  address: DataTypes.TEXT,
  neighborhood: DataTypes.TEXT,
  cep: DataTypes.CHAR(9),
  notes: DataTypes.TEXT,
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'students',
  timestamps: false
});

module.exports = Students;
