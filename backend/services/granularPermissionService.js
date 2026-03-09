const GranularPermission = require("../models/GranularPermission");

exports.getAll = async (options = {}) => {
  const list = await GranularPermission.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await GranularPermission.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await GranularPermission.create(data);
  return created;
};

exports.destroy = async (where) => {
  const deleted = await GranularPermission.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await GranularPermission.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};

exports.updateWhere = async (data, options) => {
  const result = await GranularPermission.update(data, options);
  return result;
};