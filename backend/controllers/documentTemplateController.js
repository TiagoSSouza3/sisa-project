const { DocumentTemplate, User, Document } = require('../models');
const { validateUserPermissions } = require('../middleware/authMiddleware');

// Listar todos os templates
exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await DocumentTemplate.findAll({
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name']
            }]
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar templates', error: error.message });
    }
};

// Obter um template específico
exports.getTemplate = async (req, res) => {
    try {
        const template = await DocumentTemplate.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'name']
            }]
        });
        
        if (!template) {
            return res.status(404).json({ message: 'Template não encontrado' });
        }
        
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar template', error: error.message });
    }
};

// Criar novo template (apenas admin)
exports.createTemplate = async (req, res) => {
    try {
        // Verificar se o usuário é administrador
        if (!await validateUserPermissions(req.user.id, 'can_manage_templates')) {
            return res.status(403).json({ message: 'Permissão negada' });
        }

        const { name, description, structure } = req.body;

        // Validar estrutura do template
        if (!structure || typeof structure !== 'object') {
            return res.status(400).json({ message: 'Estrutura do template inválida' });
        }

        const template = await DocumentTemplate.create({
            name,
            description,
            structure,
            created_by: req.user.id
        });

        res.status(201).json(template);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar template', error: error.message });
    }
};

// Atualizar template (apenas admin)
exports.updateTemplate = async (req, res) => {
    try {
        // Verificar se o usuário é administrador
        if (!await validateUserPermissions(req.user.id, 'can_manage_templates')) {
            return res.status(403).json({ message: 'Permissão negada' });
        }

        const template = await DocumentTemplate.findByPk(req.params.id);
        
        if (!template) {
            return res.status(404).json({ message: 'Template não encontrado' });
        }

        const { name, description, structure } = req.body;

        // Validar estrutura do template
        if (structure && typeof structure !== 'object') {
            return res.status(400).json({ message: 'Estrutura do template inválida' });
        }

        await template.update({
            name: name || template.name,
            description: description || template.description,
            structure: structure || template.structure
        });

        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar template', error: error.message });
    }
};

// Deletar template (apenas admin)
exports.deleteTemplate = async (req, res) => {
    try {
        // Verificar se o usuário é administrador
        if (!await validateUserPermissions(req.user.id, 'can_manage_templates')) {
            return res.status(403).json({ message: 'Permissão negada' });
        }

        const template = await DocumentTemplate.findByPk(req.params.id);
        
        if (!template) {
            return res.status(404).json({ message: 'Template não encontrado' });
        }

        // Verificar se existem documentos usando este template
        const documentsCount = await Document.count({ where: { template_id: req.params.id } });
        if (documentsCount > 0) {
            return res.status(400).json({ 
                message: 'Não é possível excluir o template pois existem documentos vinculados a ele' 
            });
        }

        await template.destroy();
        res.json({ message: 'Template excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar template', error: error.message });
    }
}; 