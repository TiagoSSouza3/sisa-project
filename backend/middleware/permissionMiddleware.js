const Permission = require("../models/Permission");

/**
 * Middleware para verificar permissões híbridas
 * Lógica: 
 * 1. Administradores sempre têm acesso total
 * 2. Para não administradores, valida SOMENTE a tabela permissions (fonte de verdade)
 *    - Sem mesclar com globais em tempo de execução
 * 3. Permissões globais servem apenas como seed (via reset/cópia)
 */

// Mapear occupation_id para role string (minúsculo para compatibilidade com global_permissions)
const OCCUPATION_TO_ROLE = {
  1: 'administrador', // Administrador
  2: 'colaborador',   // Colaborador  
  3: 'professor'      // Professor
};

// Mapear occupation name para role string
const OCCUPATION_NAME_TO_ROLE = {
  'Administrador': 'administrador',
  'Colaborador': 'colaborador',
  'Professor': 'professor'
};

/**
 * Verifica se o usuário tem uma permissão específica
 * @param {string} permissionName - Nome da permissão a verificar
 * @returns {Function} Middleware function
 */
const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userOccupationId = req.user?.occupation_id;
      
      if (!userId || !userOccupationId) {
        console.log('[PERMISSION_CHECK] Usuário não autenticado ou sem occupation_id');
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      // Administradores sempre têm acesso total
      // Aceita tanto formato numérico (1, '1') quanto string ('ADMINISTRADOR')
      if (userOccupationId === 1 || userOccupationId === '1' || userOccupationId === 'ADMINISTRADOR') {
        console.log(`[PERMISSION_CHECK] Administrador ${userId} (${userOccupationId}) - acesso liberado para ${permissionName}`);
        return next();
      }
      
      console.log(`[PERMISSION_CHECK] Verificando permissão '${permissionName}' para usuário ${userId} (occupation_id: ${userOccupationId})`);

      // Verificar apenas permissões individuais (sem blending)
      const individualPermission = await Permission.findOne({ where: { user_id: userId } });

      if (individualPermission && individualPermission[permissionName] === true) {
        console.log(`[PERMISSION_CHECK] ✅ Acesso concedido por permissão individual TRUE`);
        return next();
      }

      console.log(`[PERMISSION_CHECK] ❌ Acesso negado (perm individual ausente ou FALSE)`);
      return res.status(403).json({ 
        error: 'Acesso negado - permissão não concedida nas permissões individuais',
        permission: permissionName
      });
      
    } catch (error) {
      console.error('[PERMISSION_CHECK] Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

/**
 * Verifica múltiplas permissões (OR logic - usuário precisa ter pelo menos uma)
 * @param {string[]} permissionNames - Array de nomes de permissões
 * @returns {Function} Middleware function
 */
const checkAnyPermission = (permissionNames) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userOccupationId = req.user?.occupation_id;
      
      if (!userId || !userOccupationId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      // Administradores sempre têm acesso total
      // Aceita tanto formato numérico (1, '1') quanto string ('ADMINISTRADOR')
      if (userOccupationId === 1 || userOccupationId === '1' || userOccupationId === 'ADMINISTRADOR') {
        return next();
      }
      
      console.log(`[PERMISSION_CHECK] Verificando qualquer permissão de [${permissionNames.join(', ')}] para usuário ${userId}`);

      const individualPermission = await Permission.findOne({ where: { user_id: userId } });
      if (individualPermission) {
        for (const permissionName of permissionNames) {
          if (individualPermission[permissionName] === true) {
            console.log(`[PERMISSION_CHECK] ✅ Permissão individual TRUE encontrada: ${permissionName}`);
            return next();
          }
        }
      }

      return res.status(403).json({ 
        error: 'Acesso negado - sem nenhuma das permissões necessárias (individuais)',
        permissions: permissionNames
      });
      
    } catch (error) {
      console.error('[PERMISSION_CHECK] Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

/**
 * Função auxiliar para obter todas as permissões efetivas de um usuário
 * (sem mesclar com globais; retorna a linha de permissions do usuário)
 */
const getUserEffectivePermissions = async (userId, userOccupationId) => {
  try {
    console.log(`🔍 [EFFECTIVE_PERMISSIONS] ===== INÍCIO DEBUG BACKEND =====`);
    console.log(`🔍 [EFFECTIVE_PERMISSIONS] Calculando permissões efetivas para usuário ${userId} (occupation: ${userOccupationId})`);
    console.log(`🔍 [EFFECTIVE_PERMISSIONS] Tipo do userId: ${typeof userId}`);
    console.log(`🔍 [EFFECTIVE_PERMISSIONS] Tipo do userOccupationId: ${typeof userOccupationId}`);
    
    // Buscar linha de permissões individuais e retornar como efetiva
    const permission = await Permission.findOne({ where: { user_id: userId } });
    if (!permission) {
      console.log('[EFFECTIVE_PERMISSIONS] Nenhuma permissão encontrada; retornando padrão false/arrays vazios');
      return {
        can_access_dashboard: true,
        can_access_users: false,
        can_access_students: false,
        can_access_subjects: false,
        can_access_documents: false,
        can_access_storage: false,
        can_access_summary_data: false,
        can_view_documents: false,
        can_edit_documents: false,
        can_upload_documents: false,
        can_view_layouts: false,
        can_edit_layouts: false,
        can_upload_layouts: false,
        document_view_roles: [],
        document_edit_roles: [],
        document_upload_roles: [],
        layout_view_roles: [],
        layout_edit_roles: [],
        layout_upload_roles: [],
      };
    }

    return {
      ...permission,
      document_view_roles: data.document_view_roles || [],
      document_edit_roles: data.document_edit_roles || [],
      document_upload_roles: data.document_upload_roles || [],
      layout_view_roles: data.layout_view_roles || [],
      layout_edit_roles: data.layout_edit_roles || [],
      layout_upload_roles: data.layout_upload_roles || [],
    };
    
  } catch (error) {
    console.error('[EFFECTIVE_PERMISSIONS] Erro ao obter permissões efetivas:', error);
    return {};
  }
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  getUserEffectivePermissions,
  OCCUPATION_TO_ROLE
};