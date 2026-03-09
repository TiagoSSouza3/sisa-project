const GlobalPermission = require("../models/GlobalPermission");

exports.getAll = async (options = {}) => {
  const list = await GlobalPermission.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await GlobalPermission.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await GlobalPermission.create(data);
  return created;
};

exports.destroy = async (where) => {
  const deleted = await GlobalPermission.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await GlobalPermission.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};

exports.upsert = async (values, options = {}) => {
  const result = await GlobalPermission.upsert(values, options);
  return result;
};