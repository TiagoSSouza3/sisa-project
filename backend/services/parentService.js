const Parent = require("../models/Parent");

exports.getAll = async (options = {}) => {
  const list = await Parent.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await Parent.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await Parent.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await Parent.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await Parent.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};