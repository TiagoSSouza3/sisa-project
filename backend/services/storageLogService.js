const StorageLog = require("../models/StorageLog");

exports.getAll = async (options = {}) => {
  const list = await StorageLog.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await StorageLog.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await StorageLog.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  await StorageLog.destroy({ where });
  return true;
};

exports.findOne = async (options) => {
  const item = await StorageLog.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};