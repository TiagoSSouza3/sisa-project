const SubjectStudent = require("../models/SubjectStudent");

exports.getAll = async (options = {}) => {
  const list = await SubjectStudent.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await SubjectStudent.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await SubjectStudent.create(data);
  return created;
};

exports.destroy = async (where) => {
  const deleted = await SubjectStudent.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await SubjectStudent.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};