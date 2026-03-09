const User = require("../models/User");

exports.getAll = async (options = {}) => {
  const users = await User.findAll(options);
  return users;
};

exports.findPk = async (id, options = {}) => {
  const user = await User.findByPk(id, options);
  return user;
};

exports.create = async (userToCreate) => {
  const user = await User.create(userToCreate);
  return user;
};

exports.findOneByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deletedCount = await User.destroy({ where });
  return deletedCount;
};

exports.findOne = async (options) => {
  const user = await User.findOne(options);
  return user;
};

exports.update = async (userToUpdate, update) => {
  await userToUpdate.update(update);
  return true;
};
