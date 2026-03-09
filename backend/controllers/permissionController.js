const Permission = require("../models/Permission");
const GlobalPermission = require("../models/GlobalPermission");
const User = require("../models/User");
const sequelize = require("../config");

exports.getAll = async (req, res) => {
  try {
    const perms = await Permission.findAll();
    res.json(perms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[PERMISSIONS] Buscando permissões para usuário ID: ${userId}`);
    
    const permission = await Permission.findOne({ where: { user_id: userId } });
    
    if (!permission) {
      console.log(`[PERMISSIONS] Permissão não encontrada para usuário ${userId}, criando padrão por role`);
      // Buscar usuário para identificar a role
      const user = await User.findOne({ where: { id: userId }, attributes: ['id', 'occupation_id'] });
      const occ = user?.occupation_id;

      // Defaults por role
      let defaultData = {
        user_id: userId,
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

      if (occ === 3) { // Professor
        defaultData = {
          user_id: userId,
          can_access_dashboard: true,
          can_access_users: false,
          can_access_students: false, // não acessa alunos
          can_access_subjects: true,
          can_access_documents: true,
          can_access_storage: false, // não acessa estoque
          can_access_summary_data: true,
          // Documentos
          can_view_documents: true,
          can_edit_documents: false,
          can_upload_documents: false,
          // Layouts (não pode)
          can_view_layouts: false,
          can_edit_layouts: false,
          can_upload_layouts: false,
          // Roles
          document_view_roles: ['professor'],
          document_edit_roles: [],
          document_upload_roles: [],
          layout_view_roles: [],
          layout_edit_roles: [],
          layout_upload_roles: [],
        };
      } else if (occ === 2) { // Colaborador
        defaultData = {
          user_id: userId,
          can_access_dashboard: true,
          can_access_users: false, // não pode entrar em usuários
          can_access_students: true,
          can_access_subjects: false,
          can_access_documents: true,
          can_access_storage: true,
          can_access_summary_data: false,
          // Documentos
          can_view_documents: true,
          can_edit_documents: false,
          can_upload_documents: false,
          // Layouts (não pode mexer)
          can_view_layouts: false,
          can_edit_layouts: false,
          can_upload_layouts: false,
          // Roles
          document_view_roles: ['colaborador'],
          document_edit_roles: [],
          document_upload_roles: [],
          layout_view_roles: [],
          layout_edit_roles: [],
          layout_upload_roles: [],
        };
      } else if (occ === 1) { // Administrador (full)
        defaultData = {
          user_id: userId,
          can_access_dashboard: true,
          can_access_users: true,
          can_access_students: true,
          can_access_subjects: true,
          can_access_documents: true,
          can_access_storage: true,
          can_access_summary_data: true,
          can_view_documents: true,
          can_edit_documents: true,
          can_upload_documents: true,
          can_view_layouts: true,
          can_edit_layouts: true,
          can_upload_layouts: true,
          document_view_roles: ['professor', 'colaborador'],
          document_edit_roles: ['professor', 'colaborador'],
          document_upload_roles: ['professor', 'colaborador'],
          layout_view_roles: ['professor', 'colaborador'],
          layout_edit_roles: ['professor', 'colaborador'],
          layout_upload_roles: ['professor', 'colaborador'],
        };
      }

      const defaultPermission = await Permission.create(defaultData);
      console.log(`[PERMISSIONS] Permissão padrão criada por role:`, defaultPermission.toJSON());
      return res.json(defaultPermission);
    }
    
    // Normalizar campos JSON que podem ser null
    const normalizedPermission = {
      ...permission.toJSON(),
      document_view_roles: permission.document_view_roles || [],
      document_edit_roles: permission.document_edit_roles || [],
      document_upload_roles: permission.document_upload_roles || [],
      layout_view_roles: permission.layout_view_roles || [],
      layout_edit_roles: permission.layout_edit_roles || [],
      layout_upload_roles: permission.layout_upload_roles || [],
    };
    
    console.log(`[PERMISSIONS] Permissões encontradas para usuário ${userId}:`, {
      can_access_documents: normalizedPermission.can_access_documents,
      layout_view_roles: normalizedPermission.layout_view_roles,
      document_view_roles: normalizedPermission.document_view_roles
    });
    
    res.json(normalizedPermission);
  } catch (error) {
    console.error(`[PERMISSIONS] Erro ao buscar permissões para usuário ${userId}:`, error);
    res.status(500).json({ error: error.message });
  }
};

exports.setPermission = async (req, res) => {
  try {
    const { user_id, permissions } = req.body;
    console.log(`[PERMISSIONS] Salvando permissões para usuário ${user_id}:`, permissions);

    const existing = await Permission.findOne({ where: { user_id } });
    if (existing) {
      console.log(`[PERMISSIONS] Atualizando permissões existentes para usuário ${user_id}`);
      await Permission.update(permissions, { where: { user_id } });
      const updated = await Permission.findOne({ where: { user_id } });
      console.log(`[PERMISSIONS] Permissões atualizadas:`, {
        can_access_documents: updated.can_access_documents,
        layout_view_roles: updated.layout_view_roles,
        document_view_roles: updated.document_view_roles
      });
      res.json(updated);
    } else {
      console.log(`[PERMISSIONS] Criando novas permissões para usuário ${user_id}`);
      const newPermission = await Permission.create({
        user_id,
        ...permissions
      });
      console.log(`[PERMISSIONS] Novas permissões criadas:`, newPermission.toJSON());
      res.status(201).json(newPermission);
    }
  } catch (error) {
    console.error(`[PERMISSIONS] Erro ao salvar permissões para usuário ${user_id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Novo endpoint para obter permissões efetivas (híbridas)
exports.getEffectivePermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[PERMISSIONS] (SIMPLIFICADO) Carregando permissões efetivas diretas para usuário ${userId}`);

    let permission = await Permission.findOne({ where: { user_id: userId } });

    // Se não existir, criar uma linha padrão (mesma lógica do GET /permissions/:userId)
    if (!permission) {
      console.log(`[PERMISSIONS] (SIMPLIFICADO) Nenhuma permissão encontrada, criando padrão por role`);
      const user = await User.findOne({ where: { id: userId }, attributes: ['id', 'occupation_id'] });
      const occ = user?.occupation_id;

      let defaultData = {
        user_id: userId,
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

      if (occ === 3) { // Professor
        defaultData = {
          user_id: userId,
          can_access_dashboard: true,
          can_access_users: false,
          can_access_students: false,
          can_access_subjects: true,
          can_access_documents: true,
          can_access_storage: false,
          can_access_summary_data: false,
          can_view_documents: true,
          can_edit_documents: false,
          can_upload_documents: false,
          can_view_layouts: false,
          can_edit_layouts: false,
          can_upload_layouts: false,
          document_view_roles: ['professor'],
          document_edit_roles: [],
          document_upload_roles: [],
          layout_view_roles: [],
          layout_edit_roles: [],
          layout_upload_roles: [],
        };
      } else if (occ === 2) { // Colaborador
        defaultData = {
          user_id: userId,
          can_access_dashboard: true,
          can_access_users: false,
          can_access_students: true,
          can_access_subjects: false,
          can_access_documents: true,
          can_access_storage: true,
          can_access_summary_data: false,
          can_view_documents: true,
          can_edit_documents: false,
          can_upload_documents: false,
          can_view_layouts: false,
          can_edit_layouts: false,
          can_upload_layouts: false,
          document_view_roles: ['colaborador'],
          document_edit_roles: [],
          document_upload_roles: [],
          layout_view_roles: [],
          layout_edit_roles: [],
          layout_upload_roles: [],
        };
      } else if (occ === 1) { // Administrador
        defaultData = {
          user_id: userId,
          can_access_dashboard: true,
          can_access_users: true,
          can_access_students: true,
          can_access_subjects: true,
          can_access_documents: true,
          can_access_storage: true,
          can_access_summary_data: true,
          can_view_documents: true,
          can_edit_documents: true,
          can_upload_documents: true,
          can_view_layouts: true,
          can_edit_layouts: true,
          can_upload_layouts: true,
          document_view_roles: ['professor', 'colaborador'],
          document_edit_roles: ['professor', 'colaborador'],
          document_upload_roles: ['professor', 'colaborador'],
          layout_view_roles: ['professor', 'colaborador'],
          layout_edit_roles: ['professor', 'colaborador'],
          layout_upload_roles: ['professor', 'colaborador'],
        };
      }

      permission = await Permission.create(defaultData);
    }

    const normalized = {
      ...permission.toJSON(),
      document_view_roles: permission.document_view_roles || [],
      document_edit_roles: permission.document_edit_roles || [],
      document_upload_roles: permission.document_upload_roles || [],
      layout_view_roles: permission.layout_view_roles || [],
      layout_edit_roles: permission.layout_edit_roles || [],
      layout_upload_roles: permission.layout_upload_roles || [],
    };

    return res.json(normalized);
  } catch (error) {
    console.error(`[PERMISSIONS] (SIMPLIFICADO) Erro ao buscar permissões efetivas:`, error);
    return res.status(500).json({ error: error.message });
  }
};

// Endpoint para resetar permissões individuais de uma função específica
exports.resetIndividualPermissions = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['professor', 'colaborador'].includes(role)) {
      return res.status(400).json({ error: 'Role inválido. Use "professor" ou "colaborador"' });
    }

    console.log(`[PERMISSIONS] 🔄 Resetando permissões individuais (COPY FROM GLOBAL) para role: ${role}`);

    const occupationId = role === 'professor' ? 3 : 2;

    // Buscar todos usuários da role
    const users = await User.findAll({
      where: { occupation_id: occupationId },
      attributes: ['id', 'name', 'email']
    });

    if (!users || users.length === 0) {
      return res.json({ message: `Nenhum usuário encontrado com a função ${role}`, affectedUsers: 0 });
    }

    // Carregar permissões globais de páginas para a role
    const PAGE_PERMISSIONS = [
      'can_access_dashboard',
      'can_access_users',
      'can_access_students',
      'can_access_subjects',
      'can_access_documents',
      'can_access_storage',
      'can_access_summary_data',
    ];

    const globalPagePerms = await GlobalPermission.findAll({
      where: { role, permission_name: PAGE_PERMISSIONS }
    });

    const pagePermObj = PAGE_PERMISSIONS.reduce((acc, name) => {
      const found = globalPagePerms.find(p => p.permission_name === name);
      acc[name] = found ? !!found.is_allowed : false;
      return acc;
    }, {});

    // Carregar permissões globais de documentos/layouts para a role
    const [docRows] = await sequelize.query(
      `SELECT * FROM global_document_permissions WHERE role = ? LIMIT 1`,
      { replacements: [role] }
    );

    const docPerms = (docRows && docRows[0]) ? docRows[0] : {
      can_view_documents: true,
      can_edit_documents: false,
      can_upload_documents: false,
      can_view_layouts: true,
      can_edit_layouts: false,
      can_upload_layouts: false,
      can_view_all_documents: true,
      can_edit_all_documents: false,
      can_upload_all_documents: false,
    };

    const buildRoleArray = (enabled, r) => (enabled ? [r] : []);

    let updated = 0;
    for (const u of users) {
      const data = {
        // Páginas
        ...pagePermObj,
        // Documentos/Layouts
        can_view_documents: !!docPerms.can_view_documents,
        can_edit_documents: !!docPerms.can_edit_documents,
        can_upload_documents: !!docPerms.can_upload_documents,
        can_view_layouts: !!docPerms.can_view_layouts,
        can_edit_layouts: !!docPerms.can_edit_layouts,
        can_upload_layouts: !!docPerms.can_upload_layouts,
        // Roles JSON por recurso
        document_view_roles: buildRoleArray(!!docPerms.can_view_documents, role),
        document_edit_roles: buildRoleArray(!!docPerms.can_edit_documents, role),
        document_upload_roles: buildRoleArray(!!docPerms.can_upload_documents, role),
        layout_view_roles: buildRoleArray(!!docPerms.can_view_layouts, role),
        layout_edit_roles: buildRoleArray(!!docPerms.can_edit_layouts, role),
        layout_upload_roles: buildRoleArray(!!docPerms.can_upload_layouts, role),
      };

      const existing = await Permission.findOne({ where: { user_id: u.id } });
      if (existing) {
        await Permission.update(data, { where: { user_id: u.id } });
      } else {
        await Permission.create({ user_id: u.id, ...data });
      }
      updated += 1;
    }

    return res.json({
      message: `Permissões individuais copiadas das globais para ${updated} usuário(s) com role ${role}`,
      role,
      affectedUsers: updated,
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email }))
    });
  } catch (error) {
    console.error(`[PERMISSIONS] Erro ao resetar permissões individuais (COPY FROM GLOBAL):`, error);
    return res.status(500).json({ error: error.message });
  }
};

// Resetar permissões de um único usuário para o padrão global da sua função
exports.resetToGlobal = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ where: { id: userId }, attributes: ['id', 'occupation_id', 'name', 'email'] });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Mapear occupation_id para role
    const role = user.occupation_id === 3 ? 'professor' : (user.occupation_id === 2 ? 'colaborador' : 'administrador');

    // Administrador: conceder tudo verdadeiro e ambos os roles
    if (role === 'administrador') {
      const adminData = {
        can_access_dashboard: true,
        can_access_users: true,
        can_access_students: true,
        can_access_subjects: true,
        can_access_documents: true,
        can_access_storage: true,
        can_access_summary_data: true,
        can_view_documents: true,
        can_edit_documents: true,
        can_upload_documents: true,
        can_view_layouts: true,
        can_edit_layouts: true,
        can_upload_layouts: true,
        document_view_roles: ['professor', 'colaborador'],
        document_edit_roles: ['professor', 'colaborador'],
        document_upload_roles: ['professor', 'colaborador'],
        layout_view_roles: ['professor', 'colaborador'],
        layout_edit_roles: ['professor', 'colaborador'],
        layout_upload_roles: ['professor', 'colaborador'],
      };

      const existing = await Permission.findOne({ where: { user_id: user.id } });
      const saved = existing
        ? await (await Permission.update(adminData, { where: { user_id: user.id } }), Permission.findOne({ where: { user_id: user.id } }))
        : await Permission.create({ user_id: user.id, ...adminData });

      return res.json({ message: 'Permissões resetadas para padrão de administrador', permission: saved });
    }

    // Carregar permissões globais de páginas para a role
    const PAGE_PERMISSIONS = [
      'can_access_dashboard',
      'can_access_users',
      'can_access_students',
      'can_access_subjects',
      'can_access_documents',
      'can_access_storage',
      'can_access_summary_data',
    ];

    const globalPagePerms = await GlobalPermission.findAll({ where: { role, permission_name: PAGE_PERMISSIONS } });
    const pagePermObj = PAGE_PERMISSIONS.reduce((acc, name) => {
      const found = globalPagePerms.find(p => p.permission_name === name);
      acc[name] = found ? !!found.is_allowed : false;
      return acc;
    }, {});

    // Carregar permissões globais de documentos/layouts para a role
    const [docRows] = await sequelize.query(
      `SELECT * FROM global_document_permissions WHERE role = ? LIMIT 1`,
      { replacements: [role] }
    );

    const docPerms = (docRows && docRows[0]) ? docRows[0] : {
      can_view_documents: true,
      can_edit_documents: false,
      can_upload_documents: false,
      can_view_layouts: true,
      can_edit_layouts: false,
      can_upload_layouts: false,
      can_view_all_documents: true,
      can_edit_all_documents: false,
      can_upload_all_documents: false,
    };

    const buildRoleArray = (enabled, r) => (enabled ? [r] : []);

    const data = {
      ...pagePermObj,
      can_view_documents: !!docPerms.can_view_documents,
      can_edit_documents: !!docPerms.can_edit_documents,
      can_upload_documents: !!docPerms.can_upload_documents,
      can_view_layouts: !!docPerms.can_view_layouts,
      can_edit_layouts: !!docPerms.can_edit_layouts,
      can_upload_layouts: !!docPerms.can_upload_layouts,
      document_view_roles: buildRoleArray(!!docPerms.can_view_documents, role),
      document_edit_roles: buildRoleArray(!!docPerms.can_edit_documents, role),
      document_upload_roles: buildRoleArray(!!docPerms.can_upload_documents, role),
      layout_view_roles: buildRoleArray(!!docPerms.can_view_layouts, role),
      layout_edit_roles: buildRoleArray(!!docPerms.can_edit_layouts, role),
      layout_upload_roles: buildRoleArray(!!docPerms.can_upload_layouts, role),
    };

    const existing = await Permission.findOne({ where: { user_id: user.id } });
    let saved;
    if (existing) {
      await Permission.update(data, { where: { user_id: user.id } });
      saved = await Permission.findOne({ where: { user_id: user.id } });
    } else {
      saved = await Permission.create({ user_id: user.id, ...data });
    }

    return res.json({ message: 'Permissões do usuário resetadas para o padrão global da função', permission: saved });
  } catch (error) {
    console.error(`[PERMISSIONS] Erro ao resetar para global por usuário:`, error);
    return res.status(500).json({ error: error.message });
  }
};
