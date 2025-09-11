const express = require("express");
const router = express.Router();
const controller = require("../controllers/granularPermissionController");
const authenticateToken = require("../middleware/authMiddleware");

// Listar todas as restrições granulares (para debug/admin)
router.get("/", authenticateToken, controller.getAllRestrictions);

// Carregar restrições granulares para um usuário específico
router.get("/:userId/:userRole", authenticateToken, controller.getRestrictions);

// Salvar ou atualizar restrições granulares
router.post("/", authenticateToken, controller.saveRestrictions);

// Remover restrições granulares para um usuário
router.delete("/:userId/:userRole", authenticateToken, controller.deleteRestrictions);

module.exports = router;