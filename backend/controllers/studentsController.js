const Student = require("../models/Students");
const Parent = require("../models/Parent");

exports.getAllStudents = async (req, res) => {
  try {
    const list = await Student.findAll({
      include: [
        { model: Parent, as: 'parent' },
        { model: Parent, as: 'second_parent' }
      ]
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar alunos" });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar aluno. Verifique se todos os campos obrigatórios foram preenchidos." });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Student.update(req.body, { 
      where: { id },
      returning: true
    });
    
    if (updated) {
      const updatedStudent = await Student.findByPk(id, {
        include: [
          { model: Parent, as: 'parent' },
          { model: Parent, as: 'second_parent' }
        ]
      });
      res.json(updatedStudent);
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar aluno" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.destroy({ where: { id } });
    
    if (deleted) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir aluno" });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id, {
      include: [
        { model: Parent, as: 'parent' },
        { model: Parent, as: 'second_parent' }
      ]
    });
    
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar aluno" });
  }
};
