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
    
    res.json({id: id, ...parent});
  } catch (error) {
    console.error("Erro ao buscar parent:", error);
    res.status(500).json({ error: "Erro ao buscar parent" });
  }
};

// Buscar parents por nome (para autocomplete)
exports.searchParentsByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name || name.trim().length < 2) {
      return res.json([]);
    }
    
    const parents = await parentService.getSearch(name, {
      limit: 10,
      order: [['name', 'ASC']]
    });

    console.log(parents)
    
    res.json(parents);
  } catch (error) {
    console.error("Erro ao buscar parents por nome:", error);
    res.status(500).json({ error: "Erro ao buscar parents" });
  }
};

// Criar novo parent
exports.createParent = async (req, res) => {
  try {
    const payload = req.body;
    const parentAlreadyExists = await parentService.findOne({ where: { CPF: payload.CPF } });
    
    if(parentAlreadyExists){
      return res.status(201).json({id: parentAlreadyExists.id, ...parentAlreadyExists});
    }
    
    if(payload.degree_of_kinship) delete payload.degree_of_kinship;
    
    const parent = await parentService.create(payload);
    res.status(201).json({id: parent.id, ...parent});
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
    
    const payload = req.body;

    if(payload.degree_of_kinship) delete payload.degree_of_kinship;
    
    await parentService.update({id: id, ...parent}, payload);
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

