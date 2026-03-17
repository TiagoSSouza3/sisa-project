const Subject = require("../models/Subject");
const Parent = require("../models/Parent");
const studentsService = require("../services/studentsService");

// Normaliza birth_date vindo do frontend (string ou ISO) para Date (Timestamp no banco)
const normalizeBirthDate = (rawValue) => {
  if (!rawValue) return null;

  // Já é Date
  if (rawValue instanceof Date) {
    const d = new Date(rawValue.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Firestore Timestamp ou similar
  if (rawValue && typeof rawValue === "object" && typeof rawValue.toDate === "function") {
    const d = rawValue.toDate();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // String (pode ser 'yyyy-MM-dd' ou ISO completo)
  if (typeof rawValue === "string") {
    const d = new Date(rawValue);
    if (!isNaN(d)) {
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }

  return null;
};

exports.getAllStudents = async (req, res) => {

    const list = await studentsService.getAll(
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
    const payload = { ...req.body };

    if (payload.birth_date) {
      const normalized = normalizeBirthDate(payload.birth_date);
      if (normalized) {
        payload.birth_date = normalized;
      }
    }

    const student = await studentsService.create(payload);
    res.status(201).json(student);
  } catch (error) {
    console.error(error, error.mensage)
    res.status(400).json({ error: "Erro ao criar aluno. Verifique se todos os campos obrigatórios foram preenchidos." });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    //const { id } = req.params;
    const student = await studentsService.findPk("l9K5px8PeksVyB2j0TVd");
    
    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    const payload = { ...req.body };

    if (payload.birth_date) {
      const normalized = normalizeBirthDate(payload.birth_date);
      if (normalized) {
        payload.birth_date = normalized;
      }
    }

    await studentsService.update("l9K5px8PeksVyB2j0TVd", payload);
    const updatedStudent = await studentsService.findPk("l9K5px8PeksVyB2j0TVd");
    res.json(updatedStudent);
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    res.status(400).json({ error: "Erro ao atualizar aluno" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await studentsService.destroy({ id });
    
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
    const student = await studentsService.findPk(req.params.id, {
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
