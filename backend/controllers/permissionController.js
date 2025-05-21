const Permission = require("../models/Permission");

exports.getAll = async (req, res) => {
  const perms = await Permission.findAll();
  res.json(perms);
};

exports.setPermission = async (req, res) => {
  const { occupation_id, can_edit_students, can_edit_activities, can_upload_documents, can_edit_permissions } = req.body;

  const existing = await Permission.findOne({ where: { occupation_id } });
  if (existing) {
    await Permission.update(
      { can_edit_students, can_edit_activities, can_upload_documents, can_edit_permissions },
      { where: { occupation_id } }
    );
    res.json({ updated: true });
  } else {
    await Permission.create({
      occupation_id, can_edit_students, can_edit_activities, can_upload_documents, can_edit_permissions
    });
    res.status(201).json({ created: true });
  }
};
