const express = require("express");
const router = express.Router();
const controller = require("../controllers/globalPermissionController");
const authenticateToken = require("../middleware/authMiddleware");

// GET /api/global-permissions - buscar permissões globais
router.get("/", authenticateToken, controller.getGlobalPermissions);

// POST /api/global-permissions - salvar permissões globais
router.post("/", authenticateToken, controller.saveGlobalPermissions);

// DEBUG endpoint - para testar o formato da requisição
router.post("/debug", authenticateToken, (req, res) => {
  console.log('[DEBUG] Headers:', req.headers);
  console.log('[DEBUG] Body:', req.body);
  console.log('[DEBUG] Raw body type:', typeof req.body);
  console.log('[DEBUG] Body keys:', Object.keys(req.body || {}));
  
  res.json({
    message: 'Debug info logged',
    headers: req.headers,
    body: req.body,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body || {})
  });
});

module.exports = router;