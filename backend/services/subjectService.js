const Subject = require("../models/Subject");

exports.getAll = async (options = {}) => {
  const list = await Subject.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await Subject.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await Subject.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await Subject.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await Subject.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};