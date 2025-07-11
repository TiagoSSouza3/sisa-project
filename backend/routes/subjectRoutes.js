const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authenticateToken = require('../middleware/authMiddleware');

router.get("/", authenticateToken, subjectController.getAllSubjects);
router.get("/:type/:id", authenticateToken, subjectController.getSubjectById);
router.post("/", authenticateToken, subjectController.createSubject);
router.put("/:id", authenticateToken, subjectController.updateSubject);
router.delete("/:id", authenticateToken, subjectController.deleteSubject);

module.exports = router; 