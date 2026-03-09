const Subject = require('../models/Subject');
const Students = require('../models/Students');
const User = require('../models/User');
const SubjectStudent = require('../models/SubjectStudent');
const subjectService = require("../services/subjectService");
const subjectStudentService = require("../services/subjectStudentService");
const studentsService = require("../services/studentsService");
const userService = require("../services/userService");

exports.getAllSubjects = async (req, res) => {
  const subjects = await subjectService.getAll();
  res.json(subjects);
};

exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.params;

    const subject = 
    type === "withProfessor"
      ? await subjectService.findPk(
        id, 
        {
          include: [{
            model: User,
            as: 'professores',
            attributes: ['id', 'name'],
            through: { attributes: [] },
            required: false
          }]
        })
      : await subjectService.findPk(
        id, 
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
    const subject = await subjectService.create({ name, description });

    if (Array.isArray(professors)) {
      await subject.setProfessores(professors);
    }

    if (Array.isArray(students)) {
      // Criar relações com createdAt explícito
      for (const studentId of students) {
        await subjectStudentService.create({
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
    const subject = await subjectService.findPk(id);
    if (!subject) return res.status(404).json({ error: "Disciplina não encontrada" });

    await subjectService.update(subject, { name, description });

    // Atualizar professores (validação incluída)
    if (Array.isArray(professores)) {
      const validUsers = await userService.getAll({ where: { id: professores } });
      const validProfIds = validUsers.map(u => u.id);
      await subject.setProfessores(validProfIds);
    }

    if (Array.isArray(students)) {
      const validStudents = await studentsService.getAll({ where: { id: students } });
      const validStudentIds = validStudents.map(s => s.id);
      
      // Primeiro, remover todas as relações existentes
      await subject.setStudents([]);
      
      // Depois, criar novas relações com createdAt explícito
      for (const studentId of validStudentIds) {
        await subjectStudentService.create({
          subject_id: subject.id,
          students_id: studentId,
          createdAt: new Date()
        });
      }
    }

    const updated = await subjectService.findPk(id, {
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
    const subject = await subjectService.findPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }
    
    // Verificar se o aluno existe
    const student = await studentsService.findPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    
    // Verificar se a relação já existe
    const existingRelation = await subjectStudentService.findOne({
      where: {
        subject_id: subjectId,
        students_id: studentId
      }
    });
    
    if (existingRelation) {
      return res.status(400).json({ error: "Aluno já está inscrito nesta disciplina" });
    }
    
    // Criar a relação com createdAt explícito
    await subjectStudentService.create({
      subject_id: subjectId,
      students_id: studentId,
      createdAt: new Date()
    });

    await verifyActivity(studentId);
    
    res.status(201).json({ message: "Aluno adicionado à disciplina com sucesso" });
  } catch (error) {
    console.error("Erro ao adicionar aluno à disciplina:", error);
    res.status(400).json({ error: error.message });
  }
};

const verifyActivity = async (studentId) => {
  const existingRelation = await subjectStudentService.findOne({
    where: {
      students_id: studentId
    }
  });

  const student = await studentsService.findPk(studentId);

  existingRelation 
  ? await studentsService.update(student, { active: true })
  : await studentsService.update(student, { active: false })
}

exports.removeStudentFromSubject = async (req, res) => {
  try {
    const { studentId } = req.params;

    await verifyActivity(studentId);

    res.status(200).json({ message: "Aluno removido da disciplina com sucesso" });
  } catch (error) {
    console.error("Erro ao remover aluno da disciplina:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    const subject = await subjectService.findPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }
    // Remover relações com alunos antes de excluir a disciplina
    await subjectStudentService.destroy({ subject_id: subjectId });
    // Excluir a disciplina
    await subjectService.destroy(subjectId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Novo método para buscar matérias por professor
exports.getSubjectsByProfessor = async (req, res) => {
  try {
    const { professorId } = req.params;
    
    console.log("🔍 Buscando matérias para professor ID:", professorId);
    
    const subjects = await subjectService.getAll({
      include: [{
        model: User,
        as: 'professores',
        where: { id: professorId },
        attributes: ['id', 'name'],
        through: { attributes: [] },
        required: true // INNER JOIN - só matérias que têm esse professor
      }]
    });
    
    console.log("📦 Matérias encontradas:", subjects.length);
    console.log("📋 Lista de matérias:", subjects.map(s => ({ id: s.id, name: s.name })));
    
    res.json(subjects);
  } catch (error) {
    console.error("❌ Erro ao buscar matérias do professor:", error);
    res.status(400).json({ error: error.message });
  }
}; 