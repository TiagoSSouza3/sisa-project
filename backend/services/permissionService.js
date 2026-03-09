const Permission = require("../models/Permission");

exports.getAll = async (options = {}) => {
  const list = await Permission.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await Permission.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await Permission.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  await Permission.destroy({ where });
  return true;
};

exports.findOne = async (options) => {
  const item = await Permission.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};

exports.updateWhere = async (data, options) => {
  const result = await Permission.update(data, options);
  return result;
};