const sequelize = require("../../config");

const OccupationsEnum = sequelize.define('OccupationsEnum', {
    ADMINISTRADOR: 'Administrador',
    COLABORADOR: 'Colaborador',
    PROFESSOR: 'Professor'
});

module.exports = OccupationsEnum;
  