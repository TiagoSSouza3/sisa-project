const express = require("express");
const router = express.Router();
const controller = require("../controllers/documentController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getDocuments);
router.post("/", authenticateToken, controller.uploadDocument);
router.delete("/:id", authenticateToken, controller.deleteDocument);

module.exports = router;
