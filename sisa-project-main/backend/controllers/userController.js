const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  let user = await User.findByPk(id);
  user.password = "";
  res.json(user);
};

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

exports.editUser = async (req, res) => {
  let { id, name, email, password, occupation_id } = req.body;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ error: "User não encontrado" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await user.update({
    id,
    name,
    email,
    password: hashedPassword,
    occupation_id
  });
  const updatedUser = await User.findByPk(id);
  res.json(updatedUser);
}

exports.createUser = async (req, res) => {
  const { name, email, password, occupation_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    occupation_id
  });

  res.status(201).json(user);
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  res.status(204).end();
};
