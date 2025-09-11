const GlobalPermission = require("../models/GlobalPermission");

// Lista de todas as permissões disponíveis no sistema
const AVAILABLE_PERMISSIONS = [
  'can_access_dashboard',
  'can_access_users', 
  'can_access_students',
  'can_access_subjects',
  'can_access_documents',
  'can_access_storage',
  'can_access_summary_data',
  'can_view_documents',
  'can_edit_documents',
  'can_upload_documents',
  'can_view_layouts',
  'can_edit_layouts',
  'can_upload_layouts'
];

exports.getGlobalPermissions = async (req, res) => {
  try {
    console.log('[GLOBAL_PERMISSIONS] Buscando permissões globais');
    
    const permissions = await GlobalPermission.findAll({
      order: [['role', 'ASC'], ['permission_name', 'ASC']]
    });
    
    // Organizar permissões por role
    const permissionsByRole = {
      professor: {},
      colaborador: {}
    };
    
    // Inicializar todas as permissões como false
    AVAILABLE_PERMISSIONS.forEach(permission => {
      permissionsByRole.professor[permission] = false;
      permissionsByRole.colaborador[permission] = false;
    });
    
    // Aplicar permissões existentes no banco
    permissions.forEach(perm => {
      if (permissionsByRole[perm.role] && AVAILABLE_PERMISSIONS.includes(perm.permission_name)) {
        permissionsByRole[perm.role][perm.permission_name] = perm.is_allowed;
      }
    });
    
    console.log('[GLOBAL_PERMISSIONS] Permissões globais encontradas:', {
      professor: Object.keys(permissionsByRole.professor).length,
      colaborador: Object.keys(permissionsByRole.colaborador).length
    });
    
    res.json(permissionsByRole);
  } catch (error) {
    console.error('[GLOBAL_PERMISSIONS] Erro ao buscar permissões globais:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.saveGlobalPermissions = async (req, res) => {
  try {
    console.log('[GLOBAL_PERMISSIONS] === INÍCIO DO SAVE ===');
    console.log('[GLOBAL_PERMISSIONS] User autenticado:', req.user);
    console.log('[GLOBAL_PERMISSIONS] Request method:', req.method);
    console.log('[GLOBAL_PERMISSIONS] Request URL:', req.url);
    console.log('[GLOBAL_PERMISSIONS] Request body completo:', req.body);
    console.log('[GLOBAL_PERMISSIONS] Content-Type:', req.headers['content-type']);
    console.log('[GLOBAL_PERMISSIONS] Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
    
    // O frontend pode enviar os dados de duas formas:
    // 1. { permissions: { professor: {...}, colaborador: {...} } }
    // 2. { professor: {...}, colaborador: {...} }
    let permissions = req.body.permissions || req.body;
    
    console.log('[GLOBAL_PERMISSIONS] Salvando permissões globais:', permissions);
    console.log('[GLOBAL_PERMISSIONS] Tipo de permissions:', typeof permissions);
    
    // Verificar se temos dados válidos
    if (!permissions || typeof permissions !== 'object') {
      console.error('[GLOBAL_PERMISSIONS] Dados de permissões inválidos:', {
        permissions,
        type: typeof permissions,
        body: req.body
      });
      return res.status(400).json({ 
        error: 'Dados de permissões inválidos',
        received: permissions,
        type: typeof permissions
      });
    }
    
    // Verificar se temos pelo menos um dos roles esperados
    if (!permissions.professor && !permissions.colaborador) {
      console.error('[GLOBAL_PERMISSIONS] Nenhum role válido encontrado:', Object.keys(permissions));
      return res.status(400).json({ 
        error: 'Nenhum role válido encontrado (professor ou colaborador)',
        receivedKeys: Object.keys(permissions)
      });
    }
    
    const results = [];
    
    // Processar cada role (professor, colaborador)
    for (const [role, rolePermissions] of Object.entries(permissions)) {
      if (!['professor', 'colaborador'].includes(role)) {
        console.warn(`[GLOBAL_PERMISSIONS] Role inválido ignorado: ${role}`);
        continue;
      }
      
      console.log(`[GLOBAL_PERMISSIONS] Processando role: ${role}`, rolePermissions);
      
      // Processar cada permissão do role
      for (const [permissionName, isAllowed] of Object.entries(rolePermissions)) {
        if (!AVAILABLE_PERMISSIONS.includes(permissionName)) {
          console.warn(`[GLOBAL_PERMISSIONS] Permissão inválida ignorada: ${permissionName}`);
          continue;
        }
        
        try {
          console.log(`[GLOBAL_PERMISSIONS] Salvando: ${role}.${permissionName} = ${isAllowed}`);
          
          // Usar upsert para criar ou atualizar
          const [permission, created] = await GlobalPermission.upsert({
            role: role,
            permission_name: permissionName,
            is_allowed: Boolean(isAllowed)
          }, {
            returning: true
          });
          
          results.push({
            role,
            permission_name: permissionName,
            is_allowed: Boolean(isAllowed),
            action: created ? 'created' : 'updated'
          });
          
        } catch (upsertError) {
          console.error(`[GLOBAL_PERMISSIONS] Erro ao salvar ${role}.${permissionName}:`, upsertError);
        }
      }
    }
    
    console.log(`[GLOBAL_PERMISSIONS] Processadas ${results.length} permissões globais`);
    
    // Buscar e retornar as permissões atualizadas
    const permissions_updated = await GlobalPermission.findAll({
      order: [['role', 'ASC'], ['permission_name', 'ASC']]
    });
    
    // Organizar permissões por role
    const permissionsByRole = {
      professor: {},
      colaborador: {}
    };
    
    // Inicializar todas as permissões como false
    AVAILABLE_PERMISSIONS.forEach(permission => {
      permissionsByRole.professor[permission] = false;
      permissionsByRole.colaborador[permission] = false;
    });
    
    // Aplicar permissões existentes no banco
    permissions_updated.forEach(perm => {
      if (permissionsByRole[perm.role] && AVAILABLE_PERMISSIONS.includes(perm.permission_name)) {
        permissionsByRole[perm.role][perm.permission_name] = perm.is_allowed;
      }
    });
    
    console.log('[GLOBAL_PERMISSIONS] Permissões salvas com sucesso');
    res.json({
      message: 'Permissões globais salvas com sucesso',
      results,
      permissions: permissionsByRole
    });
    
  } catch (error) {
    console.error('[GLOBAL_PERMISSIONS] Erro ao salvar permissões globais:', error);
    res.status(500).json({ error: error.message });
  }
};

// Função auxiliar para verificar permissão global de um usuário
exports.checkGlobalPermission = async (userRole, permissionName) => {
  try {
    if (!['professor', 'colaborador'].includes(userRole)) {
      return false;
    }
    
    const permission = await GlobalPermission.findOne({
      where: {
        role: userRole,
        permission_name: permissionName
      }
    });
    
    return permission ? permission.is_allowed : false;
  } catch (error) {
    console.error('[GLOBAL_PERMISSIONS] Erro ao verificar permissão global:', error);
    return false;
  }
};