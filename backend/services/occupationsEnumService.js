const OccupationsEnum = require("../models/OccupationsEnum");

exports.getAll = async (options = {}) => {
  const list = await OccupationsEnum.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await OccupationsEnum.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await OccupationsEnum.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  await OccupationsEnum.destroy({ where });
  return true;
};

exports.findOne = async (options) => {
  const item = await OccupationsEnum.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};