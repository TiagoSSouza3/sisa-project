import Subject from '../models/Subject.js';

export const getAllSubjects = async (req, res) => {
  const subjects = await Subject.findAll();
  res.json(subjects);
};

export const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }
    await subject.update(req.body);
    res.json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSubject = async (req, res) => {
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