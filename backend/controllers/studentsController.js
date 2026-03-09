const Student = require("../models/Students");
const Subject = require("../models/Subject");
const Parent = require("../models/Parent");

exports.getAllStudents = async (req, res) => {

    const list = await Student.findAll(
      {
        include: [
          {
            model: Subject,
            as: 'subjects',
            attributes: ['id'],
            through: { attributes: [] },
            required: false
          },
          {
            model: Parent,
            as: 'parent',
            required: false
          },
          {
            model: Parent,
            as: 'second_parent',
            required: false
          },
          {
            model: Parent,
            as: 'responsible_parent',
            required: false
          }
        ]
      }
    );

    res.json(list);
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    console.error(error, error.mensage)
    res.status(400).json({ error: "Erro ao criar aluno. Verifique se todos os campos obrigatórios foram preenchidos." });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    await student.update(req.body);
    const updatedStudent = await Student.findByPk(id);
    res.json(updatedStudent);
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
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
    const student = await Student.findByPk(
      req.params.id,
      {
        include: [
          {
            model: Subject,
            as: 'subjects',
            attributes: ['id'],
            through: { attributes: [] },
            required: false
          },
          {
            model: Parent,
            as: 'parent',
            required: false
          },
          {
            model: Parent,
            as: 'second_parent',
            required: false
          },
          {
            model: Parent,
            as: 'responsible_parent',
            required: false
          }
        ]
      }
    );
    
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ error: "Aluno não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar aluno" });
  }
};
