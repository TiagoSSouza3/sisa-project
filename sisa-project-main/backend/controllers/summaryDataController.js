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
  console.log("updateSummaryData");
  try {
    const [summaryData] = await SummaryData.findAll();
    if (!summaryData) {
      return res.status(404).json({ error: "Dados resumidos não encontrados" });
    }
    await summaryData.update(req.body);
    res.status(200).json(summaryData);
  } catch (error) {
    console.error("Error updating summary data:", error);
    res.status(400).json({ error: "Erro ao atualizar dados resumidos" });
  }
};

exports.createSummaryData = async (req, res) => {
  console.log("createSummaryData");
  try {
    const summaryData = await SummaryData.create(req.body);
    res.status(201).json(summaryData);
  } catch (error) {
    console.error("Error creating summary data:", error);
    res.status(400).json({ error: "Erro ao criar dados resumidos" });
  }
};