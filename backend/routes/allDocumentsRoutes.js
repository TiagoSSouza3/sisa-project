const express = require('express');
const router = express.Router();
const allDocumentsController = require('../controllers/allDocumentsController');

// Middleware para simular usuário autenticado (temporário para debug)
const mockAuth = (req, res, next) => {
  req.user = { id: 1, username: 'test' };
  next();
};

// Rotas CRUD
router.get('/', mockAuth, allDocumentsController.getAllDocuments);
router.get('/:id', mockAuth, allDocumentsController.getDocument);
router.post('/', mockAuth, allDocumentsController.upload.single('file'), allDocumentsController.createDocument);
router.delete('/:id', mockAuth, allDocumentsController.deleteDocument);

// Rotas de preview e download
router.get('/:id/preview', mockAuth, allDocumentsController.previewDocument);
router.get('/:id/download', mockAuth, allDocumentsController.downloadDocument);

module.exports = router;