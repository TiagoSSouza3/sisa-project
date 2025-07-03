const sequelize = require("../config");
const { DataTypes } = require("sequelize");

const OccupationsEnum = sequelize.define('OccupationsEnum', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ADMINISTRADOR: {
        type: DataTypes.STRING,
        defaultValue: 'Administrador'
    },
    COLABORADOR: {
        type: DataTypes.STRING,
        defaultValue: 'Colaborador'
    },
    PROFESSOR: {
        type: DataTypes.STRING,
        defaultValue: 'Professor'
    }
});

module.exports = OccupationsEnum;
  