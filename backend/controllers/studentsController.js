const Subject = require("../models/Subject");
const Parent = require("../models/Parent");
const studentsService = require("../services/studentsService");
const subjectService = require("../services/subjectService");

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

    if (payload.registration === 0){
      var nextRegistration = (await studentsService.countStudents()) + 1;

      while(payload.registration === 0){
        const sameRegistration = await studentsService.getAll({ where: { registration: nextRegistration } })
        
        if(sameRegistration.length === 0){
          payload.registration = nextRegistration;
          break;
        }
        
        nextRegistration += 1;
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

exports.verifyStudentByCPF = async (req, res) => {
  try {
    const students = await studentsService.getAll({ where: {CPF : req.params.cpf}});

    res.json({cpfExists: students.length === 0 ? true : false });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cpf" });
  }
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "sim", "yes"].includes(normalized)) return true;
    if (["false", "0", "nao", "não", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
};

const toInteger = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

exports.bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: "Nenhum aluno foi enviado para importação." });
    }

    const subjects = await subjectService.getAll();
    const subjectsById = new Map(subjects.map((subject) => [String(subject.id), subject]));
    const subjectsByName = new Map(subjects.map((subject) => [String(subject.name || "").trim().toLowerCase(), subject]));

    const result = {
      created: 0,
      updated: 0,
      subscribed: 0,
      failed: 0,
      errors: []
    };

    for (let index = 0; index < students.length; index += 1) {
      const row = students[index];

      try {
        const name = String(row?.name || "").trim();
        if (!name) {
          throw new Error("Nome é obrigatório.");
        }

        const cpf = String(row?.CPF || row?.cpf || "").trim();
        const registration = toInteger(row?.registration, 0);

        let existingStudent = null;
        if (cpf) {
          const studentByCPF = await studentsService.getAll({ where: { CPF: cpf } });
          if (studentByCPF.length > 0) {
            existingStudent = studentByCPF[0];
          }
        }

        if (!existingStudent && registration > 0) {
          const studentByRegistration = await studentsService.getAll({ where: { registration } });
          if (studentByRegistration.length > 0) {
            existingStudent = studentByRegistration[0];
          }
        }

        const payload = {
          name,
          registration,
          CPF: cpf || undefined,
          email: row?.email ? String(row.email).trim() : undefined,
          phone: row?.phone ? String(row.phone).trim() : undefined,
          second_phone: row?.second_phone ? String(row.second_phone).trim() : undefined,
          gender: row?.gender ? String(row.gender).trim() : undefined,
          RG: row?.RG ? String(row.RG).trim() : undefined,
          school_year: row?.school_year ? String(row.school_year).trim() : undefined,
          school_name: row?.school_name ? String(row.school_name).trim() : undefined,
          school_period: row?.school_period ? String(row.school_period).trim() : undefined,
          address: row?.address ? String(row.address).trim() : undefined,
          neighborhood: row?.neighborhood ? String(row.neighborhood).trim() : undefined,
          cep: row?.cep ? String(row.cep).trim() : undefined,
          notes: row?.notes ? String(row.notes).trim() : undefined,
          active: toBoolean(row?.active, true),
          is_on_school: toBoolean(row?.is_on_school, true),
          subjects: []
        };

        if (row?.birth_date) {
          const normalizedBirthDate = normalizeBirthDate(row.birth_date);
          if (normalizedBirthDate) {
            payload.birth_date = normalizedBirthDate;
          }
        }

        let savedStudent;
        if (existingStudent) {
          const previousSubjects = Array.isArray(existingStudent.subjects) ? existingStudent.subjects : [];
          savedStudent = await studentsService.update(existingStudent.id, {
            ...existingStudent,
            ...payload,
            subjects: previousSubjects
          });
          result.updated += 1;
        } else {
          if (payload.registration === 0) {
            let nextRegistration = (await studentsService.countStudents()) + 1;
            while (true) {
              const sameRegistration = await studentsService.getAll({ where: { registration: nextRegistration } });
              if (sameRegistration.length === 0) {
                payload.registration = nextRegistration;
                break;
              }
              nextRegistration += 1;
            }
          }

          savedStudent = await studentsService.create(payload);
          result.created += 1;
        }

        const currentSubjects = Array.isArray(savedStudent.subjects) ? [...savedStudent.subjects] : [];
        const rowSubjects = Array.isArray(row?.subjects) ? row.subjects : [];

        for (const subjectRaw of rowSubjects) {
          const subjectLabel = String(subjectRaw || "").trim();
          if (!subjectLabel) continue;

          const byId = subjectsById.get(subjectLabel);
          const byName = subjectsByName.get(subjectLabel.toLowerCase());
          const subject = byId || byName;

          if (!subject) {
            throw new Error(`Matéria "${subjectLabel}" não encontrada.`);
          }

          const hasSubject = currentSubjects.some((sub) => String(sub.id) === String(subject.id));
          if (!hasSubject) {
            currentSubjects.push({ id: subject.id, name: subject.name });
            result.subscribed += 1;
          }
        }

        await studentsService.update(savedStudent.id, {
          ...savedStudent,
          subjects: currentSubjects,
          active: currentSubjects.length > 0
        });

        for (const subject of subjects) {
          const subjectStudents = Array.isArray(subject.students) ? [...subject.students] : [];
          const shouldHaveStudent = currentSubjects.some((sub) => String(sub.id) === String(subject.id));
          const hasStudent = subjectStudents.some((student) => String(student.id) === String(savedStudent.id));

          if (shouldHaveStudent && !hasStudent) {
            subjectStudents.push({ id: savedStudent.id, name: savedStudent.name });
            await subjectService.update(subject.id, { ...subject, students: subjectStudents });
          }
        }
      } catch (rowError) {
        result.failed += 1;
        result.errors.push({
          row: index + 3,
          error: rowError.message
        });
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao importar alunos em lote.", details: error.message });
  }
};