const express = require('express');
const router = express.Router();
const documentTemplateController = require('../controllers/documentTemplateController');
const auth = require('../middleware/auth');

// Rotas para templates de documentos
router.get('/', auth, documentTemplateController.getAllTemplates);
router.get('/:id', auth, documentTemplateController.getTemplate);
router.post('/', auth, documentTemplateController.createTemplate);
router.put('/:id', auth, documentTemplateController.updateTemplate);
router.delete('/:id', auth, documentTemplateController.deleteTemplate);

module.exports = router; 