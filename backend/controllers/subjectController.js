const subjectService = require("../services/subjectService");
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

    const subject = await subjectService.findPk(id);

    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada: " + id });
    }

    const subjectUpdated = {
      ...subject,
      professors: [],
      students: []
    };

    if (type === "withProfessor") {
      subjectUpdated.professors = await Promise.all(
        subject.professors.map(async (professorId) => {
          return await userService.findPk(professorId);
        })
      );
    } else {
      subjectUpdated.students = await Promise.all(
        subject.students.map(async (student) => {
          return await studentsService.findPk(student.id);
        })
      );
    }

    res.json(subjectUpdated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  const { name, description, professors } = req.body;
  try {
    const subject = await subjectService.create({ name, description });

    if (Array.isArray(professors)) {
      await subjectService.setProfessors(subject.id, professors);
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

    await subjectService.update(subject.id, { name, description });

    // Atualizar professores (validação incluída)
    if (Array.isArray(professores)) {
      const validUsers = await userService.getAll({ where: { id: professores } });
      const validProfIds = validUsers.map(u => u.id);

      await subjectService.setProfessors(id, validProfIds);
    }

    if (Array.isArray(students)) {
      const validStudents = await studentsService.getAll({ where: { id: students } });
      const validStudentIds = validStudents.map(s => s.id);
      
      for(const validId of validStudentIds){
        updateSubjectAndStudent(subject, validId)
      }
    }

    const updated = await subjectService.findPk(id);
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
    const existingRelation = subject.students.filter(stu => stu.id === student.id) > 0;
    
    if (existingRelation) {
      return res.status(400).json({ error: "Aluno já está inscrito nesta disciplina" });
    }

    await updateSubjectAndStudent(subject, student)
    
    res.status(201).json({ message: "Aluno adicionado à disciplina com sucesso" });
  } catch (error) {
    console.error("Erro ao adicionar aluno à disciplina:", error);
    res.status(400).json({ error: error.message });
  }
};

const verifyActivity = async (studentId) => {
  const student = await studentsService.findPk(studentId);

  student.subjects.length > 0
  ? await studentsService.update(studentId, { active: true })
  : await studentsService.update(studentId, { active: false })
}

exports.removeStudentFromSubject = async (req, res) => {
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
    console.log((subject.students.filter((stu) => stu.id === student.id)).length)
    const existingRelation = (subject.students.filter((stu) => stu.id === student.id)).length > 0;
    
    if (!existingRelation) {
      return res.status(400).json({ error: "Aluno não está inscrito nesta disciplina" });
    }

    await updateSubjectAndStudent(subject, student, true);

    res.status(201).json({menssage: "success"});
  } catch (error) {
    console.error("Erro ao remover aluno da disciplina:", error);
    res.status(400).json({ error: error.message });
  }
};

const updateSubjectAndStudent = async (subject, student, remove = false) => {
  if(remove){
    await subjectService.update(subject.id, {students: [...subject.students.filter((stu) => stu.id != student.id )]})
  
    await studentsService.update(student.id, {subjects: [...student.subjects.filter((sub) => sub.id != subject.id )]})
  } else {
    if(subject.students && (subject.students.filter(stu => stu.id === student.id)).length === 0){
      await subjectService.update(subject.id, {students: [...subject.students, {id: student.id, name: student.name}]})
    }

    if(student.subjects && (student.subjects.filter(sub => sub.id === subject.id)).length === 0){
      await studentsService.update(student.id, {subjects: [...student.subjects, {id: subject.id, name: subject.name}]})
    }
  }

  await verifyActivity(student.id);
}

exports.deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    const subject = await subjectService.findPk(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    // Remover relações com alunos antes de excluir a disciplina
    for(const studentId of subject.students){
      const student = await studentsService.findPk(studentId);

      if(student){
        updateSubjectAndStudent(subject, student)
      }
    }

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
    
    const subjects = await subjectService.findWhere("professors", "array-contains", professorId);
    
    console.log("📦 Matérias encontradas:", subjects.length);
    console.log("📋 Lista de matérias:", subjects.map(s => ({ id: s.id, name: s.name })));
    
    res.json(subjects);
  } catch (error) {
    console.error("❌ Erro ao buscar matérias do professor:", error);
    res.status(400).json({ error: error.message });
  }
}; 