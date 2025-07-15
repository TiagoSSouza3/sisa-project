const express = require('express');
const router = express.Router();
const documentLayoutController = require('../controllers/documentLayoutController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que o diretório de uploads existe
const uploadDir = 'uploads/document-layouts/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'layout-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos DOCX são permitidos'), false);
    }
  }
});

// Middleware para simular usuário autenticado (temporário para debug)
const mockAuth = (req, res, next) => {
  req.user = { id: 1, username: 'test' };
  next();
};

// Rotas CRUD (usando mockAuth temporariamente)
router.get('/', mockAuth, documentLayoutController.getAllLayouts);
router.get('/:id', mockAuth, documentLayoutController.getLayout);
router.post('/', mockAuth, upload.single('file'), documentLayoutController.createLayout);
router.delete('/:id', mockAuth, documentLayoutController.deleteLayout);

// Rotas de preview
router.get('/:id/preview', mockAuth, documentLayoutController.previewLayout);
router.post('/:id/preview', mockAuth, documentLayoutController.previewDocument);

// Rota para gerar documento
router.post('/:id/generate', mockAuth, documentLayoutController.generateDocument);

module.exports = router;