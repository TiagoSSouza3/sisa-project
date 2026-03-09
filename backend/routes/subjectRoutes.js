const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authenticateToken = require('../middleware/authMiddleware');

router.get("/", authenticateToken, subjectController.getAllSubjects);
router.get("/professor/:professorId", authenticateToken, subjectController.getSubjectsByProfessor);
router.get("/:type/:id", authenticateToken, subjectController.getSubjectById);
router.post("/", authenticateToken, subjectController.createSubject);
router.put("/:id", authenticateToken, subjectController.updateSubject);
router.delete("/:id", authenticateToken, subjectController.deleteSubject);

// Novas rotas para gerenciar alunos em disciplinas
router.post("/:subjectId/students/:studentId", authenticateToken, subjectController.addStudentToSubject);
router.delete("/students/:studentId", authenticateToken, subjectController.removeStudentFromSubject);

module.exports = router; 