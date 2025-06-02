const SummaryData = require("../models/SummaryData");

exports.getAll = async (req, res) => {
  try {
    const list = await SummaryData.findAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados resumidos" });
  }
};

exports.updateSummaryData = async (req, res) => {
  try {
    const summaryData = await SummaryData.update(req.body);
    res.status(201).json(summaryData);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar dados resumidos" });
  }
};