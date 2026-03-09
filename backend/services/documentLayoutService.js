const DocumentLayout = require("../models/DocumentLayout");

exports.getAll = async (options = {}) => {
  const list = await DocumentLayout.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await DocumentLayout.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await DocumentLayout.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await DocumentLayout.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await DocumentLayout.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};