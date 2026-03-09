const DocumentVersion = require("../models/DocumentVersion");

exports.getAll = async (options = {}) => {
  const list = await DocumentVersion.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await DocumentVersion.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await DocumentVersion.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await DocumentVersion.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await DocumentVersion.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};