const Document = require("../models/Document");

exports.getDocuments = async (req, res) => {
  const docs = await Document.findAll();
  res.json(docs);
};

exports.uploadDocument = async (req, res) => {
  const { title, activity_id, file_name, file_type, file_data, created_by } = req.body;

  const document = await Document.create({
    title,
    activity_id,
    file_name,
    file_type,
    file_data: Buffer.from(file_data, "base64"),
    created_by,
  });

  res.status(201).json(document);
};

exports.deleteDocument = async (req, res) => {
  const { id } = req.params;
  await Document.destroy({ where: { id } });
  res.status(204).end();
};
