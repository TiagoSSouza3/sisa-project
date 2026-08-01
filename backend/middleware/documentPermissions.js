const userService = require('../services/userService');
const globalDocumentPermissionService = require('../services/globalDocumentPermissionService');
const utils = require('../utils/utils')
const OCCUPATION_NAMES = require('../enums/occupation_names')

/**
 * Middleware para verificar permissões globais de documentos
 */
const checkDocumentPermissions = async (req, res, next) => {
  try {
    console.log('🔍 Verificando permissões de documentos...');

    const userId = req.user?.id;
    if (!userId) {
      console.log('❌ Usuário não autenticado');
      return res.status(401).json({
        error: 'Usuário não autenticado',
        message: 'Token de acesso necessário'
      });
    }

    const user = await userService.findPk(userId);

    if (!user) {
      console.log('❌ Usuário não encontrado no banco');
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não existe no sistema'
      });
    }

    const occupationName = OCCUPATION_NAMES[user.occupation_id] || 'Colaborador';

    console.log(`👤 Usuário: ${user.name} (ID: ${userId})`);
    console.log(`🏷️ Occupation: ${occupationName} (ID: ${user.occupation_id})`);

    if (user.occupation_id === 1) {
      console.log('✅ Administrador - acesso total permitido');
      req.user.role = 'administrador';
      req.user.occupation_name = occupationName;
      return next();
    }

    const userRole = utils.resolveUserRole(user.occupation_id);
    req.user.role = userRole;
    req.user.occupation_name = occupationName;

    console.log(`🎭 Role determinado: ${userRole}`);

    const globalPerms = await globalDocumentPermissionService.findOne({
      where: { role: userRole }
    });

    if (!globalPerms) {
      console.log(`⚠️ Nenhuma permissão global encontrada para role: ${userRole}`);
      console.log('✅ Permitindo acesso (padrão quando não há restrições)');
      return next();
    }

    const permissions = {
      can_view_documents: globalPerms.can_view_documents,
      can_edit_documents: globalPerms.can_edit_documents,
      can_upload_documents: globalPerms.can_upload_documents,
    };

    console.log(`🔐 Permissões globais para ${userRole}:`, permissions);

    if (!permissions.can_view_documents) {
      console.log(`❌ Acesso negado - ${userRole} não tem permissão para visualizar documentos`);
      return res.status(403).json({
        error: 'Acesso negado por permissões globais',
        message: `${occupationName}s não têm permissão para acessar documentos`,
        role: userRole,
        permissions: permissions
      });
    }

    console.log(`✅ Acesso permitido para ${userRole}`);

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
