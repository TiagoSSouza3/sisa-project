const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Upload de template DOCX
router.post('/upload', upload.single('template'), templateController.uploadTemplate);

// Listar templates
router.get('/', templateController.getTemplates);

// Obter template específico
router.get('/:id', templateController.getTemplate);

// Gerar documento a partir de template
router.post('/generate', templateController.generateDocument);

// Preview do documento
router.post('/preview', templateController.previewDocument);

// Deletar template
router.delete('/:id', templateController.deleteTemplate);

module.exports = router; 