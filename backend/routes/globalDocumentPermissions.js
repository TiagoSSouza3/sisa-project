const express = require('express');
const router = express.Router();
const sequelize = require('../config/config');
const authenticateToken = require("../middleware/authMiddleware");

// Função para criar tabela se não existir
const ensureTableExists = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS global_document_permissions (
        id int(11) NOT NULL AUTO_INCREMENT,
        role varchar(50) NOT NULL,
        can_view_documents tinyint(1) DEFAULT 1,
        can_edit_documents tinyint(1) DEFAULT 0,
        can_upload_documents tinyint(1) DEFAULT 0,
        can_view_layouts tinyint(1) DEFAULT 1,
        can_edit_layouts tinyint(1) DEFAULT 0,
        can_upload_layouts tinyint(1) DEFAULT 0,
        can_view_all_documents tinyint(1) DEFAULT 1,
        can_edit_all_documents tinyint(1) DEFAULT 0,
        can_upload_all_documents tinyint(1) DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;

    await sequelize.query(createTableQuery);
    console.log('✅ Tabela global_document_permissions verificada/criada');

    // Inserir dados padrão se não existirem
    const insertDefaultQuery = `
      INSERT IGNORE INTO global_document_permissions 
      (role, can_view_documents, can_edit_documents, can_upload_documents, can_view_layouts, can_edit_layouts, can_upload_layouts, can_view_all_documents, can_edit_all_documents, can_upload_all_documents) 
      VALUES 
      ('professor', 1, 0, 0, 1, 0, 0, 1, 0, 0),
      ('colaborador', 1, 0, 0, 1, 0, 0, 1, 0, 0)
    `;

    await sequelize.query(insertDefaultQuery);
    console.log('✅ Dados padrão inseridos na tabela global_document_permissions');
  } catch (error) {
    console.error('❌ Erro ao criar/verificar tabela global_document_permissions:', error);
  }
};

// Executar verificação da tabela na inicialização
ensureTableExists();

// ========================================
// ENDPOINTS PARA PERMISSÕES GLOBAIS DE DOCUMENTOS
// ========================================

/**
 * GET /global-document-permissions
 * Buscar permissões globais de documentos
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📄 Buscando permissões globais de documentos...');

    const query = `
      SELECT 
        role,
        can_view_documents,
        can_edit_documents,
        can_upload_documents,
        can_view_layouts,
        can_edit_layouts,
        can_upload_layouts,
        can_view_all_documents,
        can_edit_all_documents,
        can_upload_all_documents
      FROM global_document_permissions
      ORDER BY role
    `;

    const [results] = await sequelize.query(query);

    // Converter para formato esperado pelo frontend
    const permissions = {
      professors_can_view: false,
      professors_can_edit: false,
      professors_can_upload: false,
      collaborators_can_view: false,
      collaborators_can_edit: false,
      collaborators_can_upload: false,
    };

    results.forEach(row => {
      const rolePrefix = row.role === 'professor' ? 'professors' : 'collaborators';
      permissions[`${rolePrefix}_can_view`] = !!row.can_view_documents;
      permissions[`${rolePrefix}_can_edit`] = !!row.can_edit_documents;
      permissions[`${rolePrefix}_can_upload`] = !!row.can_upload_documents;
    });

    console.log('✅ Permissões globais encontradas:', permissions);
    res.json(permissions);
  } catch (error) {
    console.error('❌ Erro ao buscar permissões globais de documentos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

/**
 * POST /global-document-permissions
 * Salvar permissões globais de documentos
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('💾 Salvando permissões globais de documentos...');
    console.log('Dados recebidos:', req.body);

    const {
      professors_can_view = false,
      professors_can_edit = false,
      professors_can_upload = false,
      collaborators_can_view = false,
      collaborators_can_edit = false,
      collaborators_can_upload = false,
    } = req.body;

    // Atualizar permissões para professores
    const updateProfessorQuery = `
      INSERT INTO global_document_permissions (
        role, 
        can_view_documents, 
        can_edit_documents, 
        can_upload_documents,
        can_view_layouts,
        can_edit_layouts,
        can_upload_layouts,
        can_view_all_documents,
        can_edit_all_documents,
        can_upload_all_documents
      ) VALUES (
        'professor', ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        can_view_documents = VALUES(can_view_documents),
        can_edit_documents = VALUES(can_edit_documents),
        can_upload_documents = VALUES(can_upload_documents),
        can_view_layouts = VALUES(can_view_layouts),
        can_edit_layouts = VALUES(can_edit_layouts),
        can_upload_layouts = VALUES(can_upload_layouts),
        can_view_all_documents = VALUES(can_view_all_documents),
        can_edit_all_documents = VALUES(can_edit_all_documents),
        can_upload_all_documents = VALUES(can_upload_all_documents),
        updated_at = CURRENT_TIMESTAMP
    `;

    await sequelize.query(updateProfessorQuery, {
      replacements: [
        professors_can_view ? 1 : 0,
        professors_can_edit ? 1 : 0,
        professors_can_upload ? 1 : 0,
        professors_can_view ? 1 : 0, // layouts
        professors_can_edit ? 1 : 0, // layouts
        professors_can_upload ? 1 : 0, // layouts
        professors_can_view ? 1 : 0, // all_documents
        professors_can_edit ? 1 : 0, // all_documents
        professors_can_upload ? 1 : 0 // all_documents
      ]
    });

    // Atualizar permissões para colaboradores
    const updateCollaboratorQuery = `
      INSERT INTO global_document_permissions (
        role, 
        can_view_documents, 
        can_edit_documents, 
        can_upload_documents,
        can_view_layouts,
        can_edit_layouts,
        can_upload_layouts,
        can_view_all_documents,
        can_edit_all_documents,
        can_upload_all_documents
      ) VALUES (
        'colaborador', ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        can_view_documents = VALUES(can_view_documents),
        can_edit_documents = VALUES(can_edit_documents),
        can_upload_documents = VALUES(can_upload_documents),
        can_view_layouts = VALUES(can_view_layouts),
        can_edit_layouts = VALUES(can_edit_layouts),
        can_upload_layouts = VALUES(can_upload_layouts),
        can_view_all_documents = VALUES(can_view_all_documents),
        can_edit_all_documents = VALUES(can_edit_all_documents),
        can_upload_all_documents = VALUES(can_upload_all_documents),
        updated_at = CURRENT_TIMESTAMP
    `;

    await sequelize.query(updateCollaboratorQuery, {
      replacements: [
        collaborators_can_view ? 1 : 0,
        collaborators_can_edit ? 1 : 0,
        collaborators_can_upload ? 1 : 0,
        collaborators_can_view ? 1 : 0, // layouts
        collaborators_can_edit ? 1 : 0, // layouts
        collaborators_can_upload ? 1 : 0, // layouts
        collaborators_can_view ? 1 : 0, // all_documents
        collaborators_can_edit ? 1 : 0, // all_documents
        collaborators_can_upload ? 1 : 0 // all_documents
      ]
    });

    console.log('✅ Permissões globais de documentos salvas com sucesso');

    res.json({ 
      success: true, 
      message: 'Permissões globais de documentos salvas com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao salvar permissões globais de documentos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

/**
 * POST /reset-document-permissions
 * Resetar todas as permissões individuais de documentos
 */
router.post('/reset-document-permissions', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Resetando permissões individuais de documentos...');

    // Limpar todas as permissões individuais
    const queries = [
      'DELETE FROM document_permissions',
      'DELETE FROM layout_permissions', 
      'DELETE FROM all_document_permissions'
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Executado: ${query}`);
      } catch (error) {
        console.log(`⚠️ Tabela não existe ou já está vazia: ${query}`);
      }
    }

    console.log('✅ Permissões individuais de documentos resetadas com sucesso');

    res.json({ 
      success: true, 
      message: 'Permissões individuais de documentos resetadas com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao resetar permissões individuais de documentos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

/**
 * GET /check-global-document-permissions
 * Verificar se as tabelas de permissões existem e têm dados
 */
router.get('/check', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Verificando estrutura das permissões globais de documentos...');

    const checks = {
      global_document_permissions: false,
      document_permissions: false,
      layout_permissions: false,
      all_document_permissions: false,
      data_count: {}
    };

    // Verificar se as tabelas existem
    const tables = [
      'global_document_permissions',
      'document_permissions', 
      'layout_permissions',
      'all_document_permissions'
    ];

    for (const table of tables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        checks[table] = true;
        checks.data_count[table] = results[0].count;
        console.log(`✅ Tabela ${table}: ${results[0].count} registros`);
      } catch (error) {
        console.log(`❌ Tabela ${table} não existe ou erro: ${error.message}`);
        checks[table] = false;
        checks.data_count[table] = 0;
      }
    }

    res.json(checks);
  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

/**
 * GET /user/:userId/effective-document-permissions
 * Buscar permissões efetivas de documentos para um usuário específico
 */
router.get('/user/:userId/effective', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Buscando permissões efetivas de documentos para usuário ${userId}...`);

    // Buscar informações do usuário
    const [userResults] = await sequelize.query(`
      SELECT u.id, u.name, u.occupation_id, o.name as occupation_name
      FROM user u
      LEFT JOIN occupation o ON u.occupation_id = o.id
      WHERE u.id = ?
    `, { replacements: [userId] });

    if (!userResults || userResults.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResults[0];
    // Tratar occupation_name como string e normalizar
    const occupationName = String(user.occupation_name || '').toLowerCase();
    const userRole = occupationName.includes('professor') ? 'professor' : 'colaborador';

    // Buscar permissões globais para o role do usuário
    const [globalResults] = await sequelize.query(`
      SELECT * FROM global_document_permissions WHERE role = ?
    `, { replacements: [userRole] });

    const globalPermissions = globalResults && globalResults.length > 0 ? globalResults[0] : {
      can_view_documents: true,
      can_edit_documents: false,
      can_upload_documents: false,
      can_view_layouts: true,
      can_edit_layouts: false,
      can_upload_layouts: false,
      can_view_all_documents: true,
      can_edit_all_documents: false,
      can_upload_all_documents: false
    };

    // NOTA: Este endpoint mantém retorno baseado nas permissões globais de documentos
    const effectivePermissions = {
      user_id: userId,
      user_role: userRole,
      global: globalPermissions,
      individual: {}, // Para implementação futura caso necessário
      effective: {
        can_view_documents: !!globalPermissions.can_view_documents,
        can_edit_documents: !!globalPermissions.can_edit_documents,
        can_upload_documents: !!globalPermissions.can_upload_documents,
        can_view_layouts: !!globalPermissions.can_view_layouts,
        can_edit_layouts: !!globalPermissions.can_edit_layouts,
        can_upload_layouts: !!globalPermissions.can_upload_layouts,
        can_view_all_documents: !!globalPermissions.can_view_all_documents,
        can_edit_all_documents: !!globalPermissions.can_edit_all_documents,
        can_upload_all_documents: !!globalPermissions.can_upload_all_documents
      }
    };

    console.log('✅ Permissões efetivas calculadas:', effectivePermissions);
    res.json(effectivePermissions);
  } catch (error) {
    console.error('❌ Erro ao buscar permissões efetivas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router;
