const GranularPermission = require("../models/GranularPermission");

/**
 * Salvar ou atualizar restrições granulares para um usuário
 * POST /granular-permissions
 * Body: { user_id, user_role, restrictions: { layouts: [], documents: [] } }
 */
exports.saveRestrictions = async (req, res) => {
  try {
    const { user_id, user_role, restrictions } = req.body;
    
    console.log(`[GRANULAR] Salvando restrições para usuário ${user_id} (${user_role}):`, restrictions);
    
    // Validar dados de entrada
    if (!user_id || !user_role) {
      return res.status(400).json({ 
        error: "user_id e user_role são obrigatórios" 
      });
    }
    
    if (!restrictions || typeof restrictions !== 'object') {
      return res.status(400).json({ 
        error: "restrictions deve ser um objeto com layouts e documents" 
      });
    }
    
    const restrictedLayouts = restrictions.layouts || [];
    const restrictedDocuments = restrictions.documents || [];
    
    // Verificar se já existe um registro para este usuário+role
    const existing = await GranularPermission.findOne({ 
      where: { 
        user_id: user_id, 
        user_role: user_role 
      } 
    });
    
    if (existing) {
      // Atualizar registro existente
      console.log(`[GRANULAR] Atualizando restrições existentes para usuário ${user_id} (${user_role})`);
      
      await GranularPermission.update({
        restricted_layouts: restrictedLayouts,
        restricted_documents: restrictedDocuments
      }, {
        where: { 
          user_id: user_id, 
          user_role: user_role 
        }
      });
      
      const updated = await GranularPermission.findOne({ 
        where: { 
          user_id: user_id, 
          user_role: user_role 
        } 
      });
      
      console.log(`[GRANULAR] Restrições atualizadas:`, {
        user_id: updated.user_id,
        user_role: updated.user_role,
        restricted_layouts: updated.restricted_layouts,
        restricted_documents: updated.restricted_documents
      });
      
      res.json({
        message: "Restrições atualizadas com sucesso",
        data: {
          layouts: updated.restricted_layouts,
          documents: updated.restricted_documents
        }
      });
      
    } else {
      // Criar novo registro
      console.log(`[GRANULAR] Criando novas restrições para usuário ${user_id} (${user_role})`);
      
      const newRestriction = await GranularPermission.create({
        user_id: user_id,
        user_role: user_role,
        restricted_layouts: restrictedLayouts,
        restricted_documents: restrictedDocuments
      });
      
      console.log(`[GRANULAR] Novas restrições criadas:`, newRestriction.toJSON());
      
      res.status(201).json({
        message: "Restrições criadas com sucesso",
        data: {
          layouts: newRestriction.restricted_layouts,
          documents: newRestriction.restricted_documents
        }
      });
    }
    
  } catch (error) {
    console.error(`[GRANULAR] Erro ao salvar restrições:`, error);
    
    // Tratar erro de constraint unique
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: "Já existe uma configuração de restrições para este usuário e role" 
      });
    }
    
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
};

/**
 * Carregar restrições granulares para um usuário
 * GET /granular-permissions/:userId/:userRole
 */
exports.getRestrictions = async (req, res) => {
  try {
    const { userId, userRole } = req.params;
    
    console.log(`[GRANULAR] Carregando restrições para usuário ${userId} (${userRole})`);
    
    // Validar parâmetros
    if (!userId || !userRole) {
      return res.status(400).json({ 
        error: "userId e userRole são obrigatórios" 
      });
    }
    
    const restrictions = await GranularPermission.findOne({
      where: {
        user_id: userId,
        user_role: userRole
      }
    });
    
    if (!restrictions) {
      console.log(`[GRANULAR] Nenhuma restrição encontrada para usuário ${userId} (${userRole}), retornando padrão`);
      
      // Se não existir, retornar configuração padrão (sem restrições)
      return res.json({
        layouts: [],
        documents: []
      });
    }
    
    console.log(`[GRANULAR] Restrições encontradas:`, {
      user_id: restrictions.user_id,
      user_role: restrictions.user_role,
      restricted_layouts: restrictions.restricted_layouts,
      restricted_documents: restrictions.restricted_documents
    });
    
    res.json({
      layouts: restrictions.restricted_layouts || [],
      documents: restrictions.restricted_documents || []
    });
    
  } catch (error) {
    const { userId, userRole } = req.params;
    console.error(`[GRANULAR] Erro ao carregar restrições para usuário ${userId} (${userRole}):`, error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
};

/**
 * Listar todas as restrições granulares (para debug/admin)
 * GET /granular-permissions
 */
exports.getAllRestrictions = async (req, res) => {
  try {
    console.log(`[GRANULAR] Listando todas as restrições granulares`);
    
    const allRestrictions = await GranularPermission.findAll({
      order: [['user_id', 'ASC'], ['user_role', 'ASC']]
    });
    
    console.log(`[GRANULAR] Encontradas ${allRestrictions.length} configurações de restrições`);
    
    res.json(allRestrictions);
    
  } catch (error) {
    console.error(`[GRANULAR] Erro ao listar restrições:`, error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
};

/**
 * Remover restrições granulares para um usuário
 * DELETE /granular-permissions/:userId/:userRole
 */
exports.deleteRestrictions = async (req, res) => {
  try {
    const { userId, userRole } = req.params;
    
    console.log(`[GRANULAR] Removendo restrições para usuário ${userId} (${userRole})`);
    
    const deleted = await GranularPermission.destroy({
      where: {
        user_id: userId,
        user_role: userRole
      }
    });
    
    if (deleted === 0) {
      console.log(`[GRANULAR] Nenhuma restrição encontrada para remover`);
      return res.status(404).json({ 
        error: "Nenhuma restrição encontrada para este usuário e role" 
      });
    }
    
    console.log(`[GRANULAR] Restrições removidas com sucesso`);
    res.json({ 
      message: "Restrições removidas com sucesso" 
    });
    
  } catch (error) {
    console.error(`[GRANULAR] Erro ao remover restrições:`, error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: error.message 
    });
  }
};