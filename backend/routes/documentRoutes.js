const express = require("express");
const router = express.Router();
const processingController = require("../controllers/documentProcessingController");
const upload = require('../middleware/upload');

// Rotas de Processamento
router.post("/analyze", upload.single('file'), processingController.analyzeDocument);
router.post("/preview", upload.single('file'), processingController.previewDocument);
router.post("/process", upload.single('file'), processingController.processDocument);

// Rotas de Gerenciamento (opcional)
const documentController = require("../controllers/documentController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, documentController.getDocuments);
router.get("/:id", auth, documentController.getDocument);
router.post("/", auth, upload.single('file'), documentController.createDocument);
router.put("/:id", auth, documentController.updateDocument);
router.delete("/:id", auth, documentController.deleteDocument);

router.get("/:id/versions", auth, documentController.getDocumentVersions);
router.get("/:id/download", auth, documentController.downloadDocument);

module.exports = router;
