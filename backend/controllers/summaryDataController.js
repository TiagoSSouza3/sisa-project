const SummaryData = require("../models/SummaryData");
const Students = require("../models/Students");
const Subject = require("../models/Subject");
const SubjectStudent = require("../models/SubjectStudent");
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const list = await SummaryData.findAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar dados resumidos" });
  }
};

// Buscar aniversariantes do mês
exports.getBirthdayStudents = async (req, res) => {
  try {
    const { month } = req.params;
    
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ error: "Mês inválido. Deve ser entre 1 e 12." });
    }

    const students = await Students.findAll({
      where: {
        active: true,
        birth_date: {
          [Op.not]: null
        }
      },
      attributes: ['id', 'name', 'birth_date', 'registration'],
      order: [
        [Students.sequelize.literal(`DAY(birth_date)`), 'ASC']
      ]
    });

    // Filtrar aniversariantes do mês específico
    const birthdayStudents = students.filter(student => {
      if (!student.birth_date) return false;
      const birthMonth = new Date(student.birth_date).getMonth() + 1;
      return birthMonth === parseInt(month);
    });

    res.json(birthdayStudents);
  } catch (error) {
    console.error("Error fetching birthday students:", error);
    res.status(500).json({ error: "Erro ao buscar aniversariantes" });
  }
};

// Contar alunos por disciplina
exports.getStudentsBySubject = async (req, res) => {
  try {
    const subjectCounts = await SubjectStudent.findAll({
      attributes: [
        'subject_id',
        [SubjectStudent.sequelize.fn('COUNT', SubjectStudent.sequelize.col('students_id')), 'student_count']
      ],
      group: ['subject_id'],
      order: [[SubjectStudent.sequelize.fn('COUNT', SubjectStudent.sequelize.col('students_id')), 'DESC']]
    });

    // Buscar nomes das disciplinas
    const subjects = await Subject.findAll({
      attributes: ['id', 'name']
    });

    const subjectMap = subjects.reduce((acc, subject) => {
      acc[subject.id] = subject.name;
      return acc;
    }, {});

    const result = subjectCounts.map(item => ({
      subject_id: item.subject_id,
      subject_name: subjectMap[item.subject_id] || 'Disciplina não encontrada',
      student_count: parseInt(item.dataValues.student_count)
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching students by subject:", error);
    res.status(500).json({ error: "Erro ao buscar alunos por disciplina" });
  }
};

// Contar inscrições mensais em disciplinas
exports.getMonthlySubjectEnrollments = async (req, res) => {
  const { month, year } = req.params;
  try {
    
    console.log({ month, year });
    if (!month || !year) {
      return res.status(400).json({ error: "Mês e ano são obrigatórios" });
    }

    let numericMonth;
    if(typeof month === 'string') { 
      numericMonth = parseInt(month, 10);
    } else {
      numericMonth = month;
    }

    const startDate = new Date(year, numericMonth - 1, 1);
    const endDate = new Date(year, numericMonth, 0, 23, 59, 59);

    console.log({ startDate, endDate });

    const enrollments = await SubjectStudent.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [SubjectStudent.sequelize.fn('COUNT', SubjectStudent.sequelize.col('id')), 'enrollment_count'],
        [SubjectStudent.sequelize.fn('DATE', SubjectStudent.sequelize.col('createdAt')), 'enrollment_date']
      ],
      group: [SubjectStudent.sequelize.fn('DATE', SubjectStudent.sequelize.col('createdAt'))],
      order: [[SubjectStudent.sequelize.fn('DATE', SubjectStudent.sequelize.col('createdAt')), 'ASC']]
    });

    res.json(enrollments);
  } catch (error) {
    console.error("Error fetching monthly enrollments:", error);
    res.status(500).json({ error: "Erro ao buscar inscrições mensais" });
  }
};

// Estatísticas adicionais
exports.getAdditionalStats = async (req, res) => {
  try {
    const students = await Students.findAll({
      where: { active: true },
      attributes: ['birth_date', 'neighborhood', 'school_year', 'createdAt']
    });

    // Calcular idade média
    const currentYear = new Date().getFullYear();
    const ages = students
      .filter(s => s.birth_date)
      .map(s => currentYear - new Date(s.birth_date).getFullYear());
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

    // Distribuição por bairro
    const neighborhoodStats = students.reduce((acc, student) => {
      const neighborhood = student.neighborhood || 'Não informado';
      acc[neighborhood] = (acc[neighborhood] || 0) + 1;
      return acc;
    }, {});

    // Distribuição por ano escolar
    const schoolYearStats = students.reduce((acc, student) => {
      const schoolYear = student.school_year || 'Não informado';
      acc[schoolYear] = (acc[schoolYear] || 0) + 1;
      return acc;
    }, {});

    // Novos alunos no último mês
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const newStudentsLastMonth = students.filter(s => new Date(s.createdAt) >= lastMonth).length;

    res.json({
      averageAge,
      neighborhoodStats,
      schoolYearStats,
      newStudentsLastMonth
    });
  } catch (error) {
    console.error("Error fetching additional stats:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas adicionais" });
  }
};

exports.updateSummaryData = async (req, res) => {
  console.log("updateSummaryData");
  try {
    const [summaryData] = await SummaryData.findAll();
    if (!summaryData) {
      return res.status(404).json({ error: "Dados resumidos não encontrados" });
    }
    await summaryData.update(req.body);
    res.status(200).json(summaryData);
  } catch (error) {
    console.error("Error updating summary data:", error);
    res.status(400).json({ error: "Erro ao atualizar dados resumidos" });
  }
};

exports.createSummaryData = async (req, res) => {
  console.log("createSummaryData");
  try {
    const summaryData = await SummaryData.create(req.body);
    res.status(201).json(summaryData);
  } catch (error) {
    console.error("Error creating summary data:", error);
    res.status(400).json({ error: "Erro ao criar dados resumidos" });
  }
};