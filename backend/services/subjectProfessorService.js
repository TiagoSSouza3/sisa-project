const SubjectProfessor = require("../models/SubjectProfessor");

exports.getAll = async (options = {}) => {
  const list = await SubjectProfessor.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await SubjectProfessor.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await SubjectProfessor.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  await SubjectProfessor.destroy({ where });
  return true;
};

exports.findOne = async (options) => {
  const item = await SubjectProfessor.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};