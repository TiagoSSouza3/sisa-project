const Students = require("../models/Students");

exports.getAll = async (options = {}) => {
  const list = await Students.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await Students.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await Students.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await Students.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await Students.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};