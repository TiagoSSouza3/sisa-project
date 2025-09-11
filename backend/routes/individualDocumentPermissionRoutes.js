const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

// Simulação de armazenamento em memória (em produção, usar banco de dados)
let individualDocumentPermissions = {};

/**
 * GET /individual-document-permissions
 * Buscar todas as permissões individuais de documentos
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("📄 Buscando permissões individuais de documentos...");
    
    // Retornar as permissões armazenadas
    res.json(individualDocumentPermissions);
    
  } catch (error) {
    console.error("❌ Erro ao buscar permissões individuais:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

/**
 * POST /individual-document-permissions
 * Salvar permissões individuais de documentos
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    console.log("💾 Salvando permissões individuais de documentos...");
    console.log("📋 Dados recebidos:", JSON.stringify(req.body, null, 2));
    
    const permissions = req.body;
    
    // Validar dados de entrada
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ 
        error: "Dados de permissões inválidos" 
      });
    }
    
    // Armazenar as permissões (em produção, salvar no banco de dados)
    individualDocumentPermissions = { ...permissions };
    
    console.log("✅ Permissões individuais salvas com sucesso");
    console.log("📋 Permissões armazenadas:", JSON.stringify(individualDocumentPermissions, null, 2));
    
    res.json({ 
      success: true, 
      message: "Permissões individuais de documentos salvas com sucesso",
      data: individualDocumentPermissions
    });
    
  } catch (error) {
    console.error("❌ Erro ao salvar permissões individuais:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

/**
 * DELETE /individual-document-permissions
 * Resetar todas as permissões individuais de documentos
 */
router.delete("/", authenticateToken, async (req, res) => {
  try {
    console.log("🔄 Resetando permissões individuais de documentos...");
    
    // Limpar todas as permissões individuais
    individualDocumentPermissions = {};
    
    console.log("✅ Permissões individuais resetadas com sucesso");
    
    res.json({ 
      success: true, 
      message: "Permissões individuais de documentos resetadas com sucesso" 
    });
    
  } catch (error) {
    console.error("❌ Erro ao resetar permissões individuais:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

/**
 * POST /individual-document-permissions/reset
 * Resetar permissões individuais (alternativa via POST)
 */
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    console.log("🔄 Resetando permissões individuais de documentos via POST...");
    
    // Limpar todas as permissões individuais
    individualDocumentPermissions = {};
    
    console.log("✅ Permissões individuais resetadas com sucesso");
    
    res.json({ 
      success: true, 
      message: "Permissões individuais de documentos resetadas com sucesso" 
    });
    
  } catch (error) {
    console.error("❌ Erro ao resetar permissões individuais:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
});

module.exports = router;