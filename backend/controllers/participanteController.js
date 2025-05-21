const Participant = require("../models/Participant");

exports.getAllParticipants = async (req, res) => {
  const list = await Participant.findAll();
  res.json(list);
};

exports.createParticipant = async (req, res) => {
  const participant = await Participant.create(req.body);
  res.status(201).json(participant);
};

exports.updateParticipant = async (req, res) => {
  const { id } = req.params;
  await Participant.update(req.body, { where: { id } });
  res.json({ updated: true });
};

exports.deleteParticipant = async (req, res) => {
  const { id } = req.params;
  await Participant.destroy({ where: { id } });
  res.status(204).end();
};
