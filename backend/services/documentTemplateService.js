const DocumentTemplate = require("../models/DocumentTemplate");

exports.getAll = async (options = {}) => {
  const list = await DocumentTemplate.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await DocumentTemplate.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await DocumentTemplate.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  await DocumentTemplate.destroy({ where });
  return true;
};

exports.findOne = async (options) => {
  const item = await DocumentTemplate.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};