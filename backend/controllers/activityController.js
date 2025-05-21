const Activity = require("../models/Activity");

exports.getAllActivities = async (req, res) => {
  const activities = await Activity.findAll();
  res.json(activities);
};

exports.createActivity = async (req, res) => {
  const { name, description, professor_id } = req.body;
  const activity = await Activity.create({ name, description, professor_id });
  res.status(201).json(activity);
};

exports.deleteActivity = async (req, res) => {
  const { id } = req.params;
  await Activity.destroy({ where: { id } });
  res.status(204).end();
};
