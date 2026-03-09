const Parent = require("../models/Parent");
const { Op } = require('sequelize');
const parentService = require("../services/parentService");

// Buscar todos os parents
exports.getAllParents = async (req, res) => {
  try {
    const list = await parentService.getAll({
      order: [['name', 'ASC']]
    });
    res.json(list);
  } catch (error) {
    console.error("Erro ao buscar parents:", error);
    res.status(500).json({ error: "Erro ao buscar parents" });
  }
};

// Buscar parent por ID
exports.getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await parentService.findPk(id);
    
    if (!parent) {
      return res.status(404).json({ error: "Parent não encontrado" });
    }
    
    res.json(parent);
  } catch (error) {
    console.error("Erro ao buscar parent:", error);
    res.status(500).json({ error: "Erro ao buscar parent" });
  }
};

// Buscar parents por nome (para autocomplete)
exports.searchParentsByName = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name || name.trim().length < 2) {
      return res.json([]);
    }
    
    const parents = await parentService.getAll({
      where: {
        name: {
          [Op.like]: `%${name}%`
        }
      },
      limit: 10,
      order: [['name', 'ASC']]
    });
    
    res.json(parents);
  } catch (error) {
    console.error("Erro ao buscar parents por nome:", error);
    res.status(500).json({ error: "Erro ao buscar parents" });
  }
};

// Criar novo parent
exports.createParent = async (req, res) => {
  try {
    const parent = await parentService.create(req.body);
    res.status(201).json(parent);
  } catch (error) {
    console.error("Erro ao criar parent:", error);
    res.status(400).json({ error: "Erro ao criar parent. Verifique se todos os campos obrigatórios foram preenchidos." });
  }
};

// Atualizar parent
exports.updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await parentService.findPk(id);
    
    if (!parent) {
      return res.status(404).json({ error: "Parent não encontrado" });
    }
    
    await parentService.update(parent, req.body);
    const updatedParent = await parentService.findPk(id);
    res.json(updatedParent);
  } catch (error) {
    console.error("Erro ao atualizar parent:", error);
    res.status(400).json({ error: "Erro ao atualizar parent" });
  }
};

// Deletar parent
exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await parentService.destroy({ id });
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Parent não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao excluir parent:", error);
    res.status(500).json({ error: "Erro ao excluir parent" });
  }
};

