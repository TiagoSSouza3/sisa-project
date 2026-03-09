const Storage = require("../models/Storage");

exports.getAll = async (options = {}) => {
  const list = await Storage.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await Storage.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await Storage.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await Storage.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await Storage.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};