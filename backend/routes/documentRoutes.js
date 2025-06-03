const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const auth = require("../middleware/authMiddleware");
const upload = require('../middleware/upload').upload;

router.get("/", auth, documentController.getDocuments);
router.get("/:id", auth, documentController.getDocument);
router.post("/", auth, upload.single('file'), documentController.createDocument);
router.put("/:id", auth, documentController.updateDocument);
router.delete("/:id", auth, documentController.deleteDocument);

router.get("/:id/versions", auth, documentController.getDocumentVersions);
router.get("/:id/download", auth, documentController.downloadDocument);

module.exports = router;
