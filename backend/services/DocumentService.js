const Document = require("../models/Document");

exports.getAll = async (options = {}) => {
  const list = await Document.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await Document.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await Document.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await Document.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await Document.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};