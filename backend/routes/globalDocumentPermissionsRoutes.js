const express = require('express');
const router = express.Router();
const sequelize = require('../config/config');
const authenticateToken = require("../middleware/authMiddleware");
const controller = require("../controllers/globalDocumentPermissionController");

// ========================================
// ENDPOINTS PARA PERMISSÕES GLOBAIS DE DOCUMENTOS
// ========================================

/**
 * GET /global-document-permissions
 * Buscar permissões globais de documentos
 */
router.get('/', authenticateToken, controller.getAll);

/**
 * POST /global-document-permissions
 * Salvar permissões globais de documentos
 */
router.post('/', authenticateToken, controller.setGlogalDocumentPermission);

/**
 * POST /reset-document-permissions
 * Resetar todas as permissões individuais de documentos
 */
router.post('/reset-document-permissions', authenticateToken, controller.resetDocumentPermissions);

/**
 * GET /check-global-document-permissions
 * Verificar se as tabelas de permissões existem e têm dados
 */
router.get('/check', authenticateToken, controller.checkGlobalDocumentPermission);

/**
 * GET /user/:userId/effective-document-permissions
 * Buscar permissões efetivas de documentos para um usuário específico
 */
router.get('/user/:userId/effective', controller.getPermissionsByUser);

module.exports = router;
