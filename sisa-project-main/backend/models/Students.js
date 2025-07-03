const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Students = sequelize.define("students", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registration: {
    type: DataTypes.INTEGER
  },
  CPF: {
    type: DataTypes.CHAR(15)
  },
  gender: {
    type: DataTypes.STRING
  },
  skin_color: {
    type: DataTypes.STRING
  },
  RG: {
    type: DataTypes.CHAR(12)
  },
  email: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  second_phone: {
    type: DataTypes.STRING
  },
  responsable: {
    type: DataTypes.STRING
  },
  degree_of_kinship: {
    type: DataTypes.STRING
  },
  UBS: {
    type: DataTypes.STRING
  },
  is_on_school: {
    type: DataTypes.BOOLEAN
  },
  school_year: {
    type: DataTypes.STRING
  },
  school_name: {
    type: DataTypes.STRING
  },
  school_period: {
    type: DataTypes.STRING
  },
  birth_date: {
    type: DataTypes.DATE
  },
  address: {
    type: DataTypes.TEXT
  },
  neighborhood: {
    type: DataTypes.TEXT
  },
  cep: {
    type: DataTypes.CHAR(9)
  },
  notes: {
    type: DataTypes.TEXT
  },
  active: {
    type: DataTypes.BOOLEAN
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Students;
