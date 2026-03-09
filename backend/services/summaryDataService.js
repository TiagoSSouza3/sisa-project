const SummaryData = require("../models/SummaryData");

exports.getAll = async (options = {}) => {
  const list = await SummaryData.findAll(options);
  return list;
};

exports.findPk = async (id, options = {}) => {
  const item = await SummaryData.findByPk(id, options);
  return item;
};

exports.create = async (data) => {
  const created = await SummaryData.create(data);
  return created;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  await SummaryData.destroy({ where });
  return true;
};

exports.findOne = async (options) => {
  const item = await SummaryData.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};