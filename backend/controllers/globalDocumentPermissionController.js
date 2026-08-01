const globalDocumentPermissionService = require("../services/globalDocumentPermissionService");
const userService = require("../services/userService");
const utils = require("../utils/utils")

exports.getAll = async (req, res) => {
    try {
        console.log('📄 Buscando permissões globais de documentos...');

        const results = await globalDocumentPermissionService.getAll({
            order: [['role', 'ASC']],
        });

        const permissions = {
            professors_can_view: false,
            professors_can_edit: false,
            professors_can_upload: false,
            collaborators_can_view: false,
            collaborators_can_edit: false,
            collaborators_can_upload: false,
        };

        results.forEach((row) => {
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
};

exports.setGlogalDocumentPermission = async (req, res) => {
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

        await globalDocumentPermissionService.upsertByRole(
            'professor',
            buildPermissions(professors_can_view, professors_can_edit, professors_can_upload)
        );

        await globalDocumentPermissionService.upsertByRole(
            'colaborador',
            buildPermissions(collaborators_can_view, collaborators_can_edit, collaborators_can_upload)
        );

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
};

const buildPermissions = (canView, canEdit, canUpload) => ({
    can_view_documents: !!canView,
    can_edit_documents: !!canEdit,
    can_upload_documents: !!canUpload,
    can_view_layouts: !!canView,
    can_edit_layouts: !!canEdit,
    can_upload_layouts: !!canUpload,
    can_view_all_documents: !!canView,
    can_edit_all_documents: !!canEdit,
    can_upload_all_documents: !!canUpload,
});

exports.resetDocumentPermissions = async (req, res) => {
    try {
        console.log('🔄 Resetando permissões individuais de documentos...');

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
};

exports.checkGlobalDocumentPermission = async (req, res) => {
    try {
        console.log('🔍 Verificando estrutura das permissões globais de documentos...');

        const globalDocumentPermissions = await globalDocumentPermissionService.getAll();

        const checks = {
            global_document_permissions: globalDocumentPermissions.length > 0,
            document_permissions: false,
            layout_permissions: false,
            all_document_permissions: false,
            data_count: {
                global_document_permissions: globalDocumentPermissions.length,
            }
        };

        const mysqlTables = [
            'document_permissions',
            'layout_permissions',
            'all_document_permissions'
        ];

        for (const table of mysqlTables) {
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
};

exports.getPermissionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`🔍 Buscando permissões efetivas de documentos para usuário ${userId}...`);

        const user = await userService.findPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const userRole = utils.resolveUserRole(user.occupation_id);
        const globalPermissions = await globalDocumentPermissionService.getByRoleOrDefault(userRole);

        const effectivePermissions = {
            user_id: userId,
            user_role: userRole,
            global: globalPermissions,
            individual: {},
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
};