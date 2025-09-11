const express = require("express");
const router = express.Router();
const controller = require("../controllers/permissionController");
const authenticateToken = require("../middleware/authMiddleware");

// Middleware para restringir alteração de permissões
function adminOnly(req, res, next) {
  const userOccupationId = req.user?.occupation_id;
  
  // Administradores podem alterar permissões de qualquer usuário
  // Aceita tanto formato numérico (1, '1') quanto string ('ADMINISTRADOR')
  if (userOccupationId === 1 || 
      userOccupationId === '1' || 
      userOccupationId === 'ADMINISTRADOR') {
    console.log(`[PERMISSIONS] ✅ Acesso autorizado - occupation_id: ${userOccupationId}, user_id: ${req.user?.id}`);
    return next();
  }
  
  // Log para debug
  console.log(`[PERMISSIONS] ❌ Acesso negado - occupation_id: ${userOccupationId}, user_id: ${req.user?.id}`);
  
  return res.status(403).json({ 
    error: 'Somente administradores podem alterar permissões',
    details: {
      currentUserOccupation: userOccupationId,
      requiredOccupation: 'ADMINISTRADOR (1)'
    }
  });
}

router.get("/", authenticateToken, controller.getAll);
router.get("/:userId", authenticateToken, controller.getByUserId);
router.get("/:userId/effective", authenticateToken, controller.getEffectivePermissions);
router.post("/", authenticateToken, adminOnly, controller.setPermission);
router.post("/reset-individual", authenticateToken, adminOnly, controller.resetIndividualPermissions);
router.post("/reset-to-global/:userId", authenticateToken, adminOnly, controller.resetToGlobal);

module.exports = router;
