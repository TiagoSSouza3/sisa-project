const db = require('../config/config');

/**
 * Middleware para verificar permissões globais de documentos
 */
const checkDocumentPermissions = async (req, res, next) => {
  try {
    console.log('🔍 Verificando permissões de documentos...');
    
    // Verificar se o usuário está autenticado
    const userId = req.user?.id;
    if (!userId) {
      console.log('❌ Usuário não autenticado');
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        message: 'Token de acesso necessário'
      });
    }
    
    // Buscar informações do usuário incluindo occupation
    const [userResults] = await db.execute(`
      SELECT u.id, u.name, u.occupation_id, o.name as occupation_name
      FROM user u
      LEFT JOIN occupation o ON u.occupation_id = o.id
      WHERE u.id = ?
    `, [userId]);
    
    if (userResults.length === 0) {
      console.log('❌ Usuário não encontrado no banco');
      return res.status(404).json({ 
        error: 'Usuário não encontrado',
        message: 'Usuário não existe no sistema'
      });
    }
    
    const user = userResults[0];
    const occupationName = String(user.occupation_name || '').toLowerCase();
    
    console.log(`👤 Usuário: ${user.name} (ID: ${userId})`);
    console.log(`🏷️ Occupation: ${user.occupation_name} (ID: ${user.occupation_id})`);
    
    // Administradores sempre têm acesso total
    if (occupationName.includes('administrador')) {
      console.log('✅ Administrador - acesso total permitido');
      req.user.role = 'administrador';
      req.user.occupation_name = user.occupation_name;
      return next();
    }
    
    // Determinar role do usuário
    const userRole = occupationName.includes('professor') ? 'professor' : 'colaborador';
    req.user.role = userRole;
    req.user.occupation_name = user.occupation_name;
    
    console.log(`🎭 Role determinado: ${userRole}`);
    
    // Verificar permissões globais para este role
    const [globalPerms] = await db.execute(`
      SELECT can_view_documents, can_edit_documents, can_upload_documents
      FROM global_document_permissions 
      WHERE role = ?
    `, [userRole]);
    
    if (globalPerms.length === 0) {
      console.log(`⚠️ Nenhuma permiss��o global encontrada para role: ${userRole}`);
      console.log('✅ Permitindo acesso (padrão quando não há restrições)');
      return next();
    }
    
    const permissions = globalPerms[0];
    console.log(`🔐 Permissões globais para ${userRole}:`, permissions);
    
    // Verificar se tem permissão para visualizar documentos
    if (!permissions.can_view_documents) {
      console.log(`❌ Acesso negado - ${userRole} não tem permissão para visualizar documentos`);
      return res.status(403).json({ 
        error: 'Acesso negado por permissões globais',
        message: `${user.occupation_name}s não têm permissão para acessar documentos`,
        role: userRole,
        permissions: permissions
      });
    }
    
    console.log(`✅ Acesso permitido para ${userRole}`);
    
    // Adicionar permissões ao request para uso posterior
    req.user.documentPermissions = permissions;
    
    next();
    
  } catch (error) {
    console.error('❌ Erro ao verificar permissões de documentos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

/**
 * Middleware específico para verificar permissão de edição
 */
const checkEditPermissions = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole === 'administrador') {
      return next();
    }
    
    const permissions = req.user?.documentPermissions;
    
    if (!permissions || !permissions.can_edit_documents) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Você não tem permissão para editar documentos'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar permissões de edição:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

/**
 * Middleware específico para verificar permissão de upload
 */
const checkUploadPermissions = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    
    if (userRole === 'administrador') {
      return next();
    }
    
    const permissions = req.user?.documentPermissions;
    
    if (!permissions || !permissions.can_upload_documents) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Você não tem permissão para fazer upload de documentos'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar permissões de upload:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

module.exports = { 
  checkDocumentPermissions,
  checkEditPermissions,
  checkUploadPermissions
};