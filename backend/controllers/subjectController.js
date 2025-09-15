const Subject = require('../models/Subject');
const Students = require('../models/Students');
const User = require('../models/User');
const SubjectStudent = require('../models/SubjectStudent');

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
      // Criar relações com createdAt explícito
      for (const studentId of students) {
        await SubjectStudent.create({
          subject_id: subject.id,
          students_id: studentId,
          createdAt: new Date()
        });
      }
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
      
      // Primeiro, remover todas as relações existentes
      await subject.setStudents([]);
      
      // Depois, criar novas relações com createdAt explícito
      for (const studentId of validStudentIds) {
        await SubjectStudent.create({
          subject_id: subject.id,
          students_id: studentId,
          createdAt: new Date()
        });
      }
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

exports.addStudentToSubject = async (req, res) => {
  try {
    const { subjectId, studentId } = req.params;
    
    // Verificar se a disciplina existe
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }
    
    // Verificar se o aluno existe
    const student = await Students.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    
    // Verificar se a relação já existe
    const existingRelation = await SubjectStudent.findOne({
      where: {
        subject_id: subjectId,
        students_id: studentId
      }
    });
    
    if (existingRelation) {
      return res.status(400).json({ error: "Aluno já está inscrito nesta disciplina" });
    }
    
    // Criar a relação com createdAt explícito
    await SubjectStudent.create({
      subject_id: subjectId,
      students_id: studentId,
      createdAt: new Date()
    });
    
    res.status(201).json({ message: "Aluno adicionado à disciplina com sucesso" });
  } catch (error) {
    console.error("Erro ao adicionar aluno à disciplina:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.removeStudentFromSubject = async (req, res) => {
  try {
    const { subjectId, studentId } = req.params;
    
    const deleted = await SubjectStudent.destroy({
      where: {
        subject_id: subjectId,
        students_id: studentId
      }
    });
    
    if (deleted) {
      res.status(200).json({ message: "Aluno removido da disciplina com sucesso" });
    } else {
      res.status(404).json({ error: "Relação não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao remover aluno da disciplina:", error);
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