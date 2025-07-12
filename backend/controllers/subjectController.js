const Subject = require('../models/Subject');
const User = require('../models/User');

exports.getAllSubjects = async (req, res) => {
  const subjects = await Subject.findAll({
    include: [{
      model: User,
      as: 'professores',
      attributes: ['id', 'name'],
      through: { attributes: [] },
      required: false
    }]
  });
  res.json(subjects);
};

exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.params;

    const subject = 
    type === "professor"
      ? await Subject.findByPk(req.params.id, {
          include: [{
            model: User,
            as: 'professores',
            attributes: ['id', 'name'],
            through: { attributes: [] },
            required: false
          }]
        })
      : await Subject.findOne({where: {id: id}})

    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada: " + id });
    }

    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  const { name, description, professors } = req.body;
  try {
    const subject = await Subject.create({ name, description });

    if (Array.isArray(professors)) {
      await subject.setProfessores(professors);
    }

    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  const { name, description, professores } = req.body;
  const { id } = req.params;

  try {
    const subject = await Subject.findByPk(id);

    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    await subject.update({ name, description });

    if (Array.isArray(professores)) {
      const validUsers = await User.findAll({
        where: { id: professores }
      });

      const validProfessorIds = validUsers.map(user => user.id);

      await subject.setProfessores(validProfessorIds);
    }

    const updated = await Subject.findByPk(id, {
      include: [{
        model: User,
        as: 'professores',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        required: false
      }]
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