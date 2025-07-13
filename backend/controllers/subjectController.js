const Subject = require('../models/Subject');
const Students = require('../models/Students');
const User = require('../models/User');

exports.getAllSubjects = async (req, res) => {
  const subjects = await Subject.findAll();
  res.json(subjects);
};

exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.params;

    const subject = 
    type === "professor"
      ? await Subject.findByPk(
        req.params.id, 
        {
          include: [{
            model: User,
            as: 'professores',
            attributes: ['id', 'name'],
            through: { attributes: [] },
            required: false
          }]
        })
      : await Subject.findByPk(
        req.params.id, 
        {
          include: [{
            model: Students,
            as: 'students',
            attributes: ['id', 'name', 'registration', 'responsable', 'notes'],
            through: { attributes: [] },
            required: false
          }]
        })

    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada: " + id });
    }

    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  const { name, description, professors, students } = req.body;
  try {
    const subject = await Subject.create({ name, description });

    if (Array.isArray(professors)) {
      await subject.setProfessores(professors);
    }

    if (Array.isArray(students)) {
      await subject.setStudents(students);
    }

    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  const { name, description, professores, students } = req.body;
  const { id } = req.params;

  try {
    const subject = await Subject.findByPk(id);
    if (!subject) return res.status(404).json({ error: "Disciplina não encontrada" });

    await subject.update({ name, description });

    // Atualizar professores (validação incluída)
    if (Array.isArray(professores)) {
      const validUsers = await User.findAll({ where: { id: professores } });
      const validProfIds = validUsers.map(u => u.id);
      await subject.setProfessores(validProfIds);
    }

    if (Array.isArray(students)) {
      const validStudents = await Students.findAll({ where: { id: students } });
      const validStudentIds = validStudents.map(s => s.id);
      await subject.setStudents(validStudentIds);
    }

    const updated = await Subject.findByPk(id, {
      include: [
        {
          model: User,
          as: 'professores',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: false
        },
        {
          model: Students,
          as: 'students',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: false
        }
      ]
    });

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar disciplina:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }
    await subject.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 