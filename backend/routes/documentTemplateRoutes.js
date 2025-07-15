const express = require('express');
const router = express.Router();
const documentTemplateController = require('../controllers/documentTemplateController');
const auth = require('../middleware/authMiddleware');

// Rotas básicas CRUD
router.get('/', auth, documentTemplateController.getAllTemplates);
router.get('/:id', auth, documentTemplateController.getTemplate);
router.post('/', auth, documentTemplateController.createTemplate);
router.put('/:id', auth, documentTemplateController.updateTemplate);
router.delete('/:id', auth, documentTemplateController.deleteTemplate);

// Rotas para geração de documentos
router.post('/:id/generate', auth, documentTemplateController.generateDocument);
router.post('/:id/preview', auth, documentTemplateController.previewDocument);

module.exports = router; 