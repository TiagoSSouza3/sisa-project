const DocumentTemplateProcessor = require('./documentTemplateProcessor');
const { DocumentTemplate } = require('../models');

// Upload e processamento de template
exports.uploadTemplate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        // Processar template e extrair campos
        const templateInfo = await DocumentTemplateProcessor.processTemplateUpload(req.file);
        
        // Salvar template no banco de dados
        const template = await DocumentTemplate.create({
            name: req.body.name || templateInfo.originalName,
            description: req.body.description || '',
            file_name: templateInfo.originalName,
            file_data: templateInfo.templateBuffer,
            fields: JSON.stringify(templateInfo.fields),
            field_count: templateInfo.fieldCount,
            created_by: req.user.id,
            status: 'active'
        });

        res.status(201).json({
            message: 'Template processado com sucesso',
            template: {
                id: template.id,
                name: template.name,
                fields: templateInfo.fields,
                fieldCount: templateInfo.fieldCount
            }
        });
    } catch (error) {
        console.error('Erro no upload de template:', error);
        res.status(500).json({ 
            message: 'Erro ao processar template', 
            error: error.message 
        });
    }
};

// Listar templates
exports.getTemplates = async (req, res) => {
    try {
        const templates = await DocumentTemplate.findAll({
            where: { status: 'active' },
            attributes: ['id', 'name', 'description', 'field_count', 'created_at']
        });
        
        res.json(templates);
    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao buscar templates', 
            error: error.message 
        });
    }
};

// Obter template específico
exports.getTemplate = async (req, res) => {
    try {
        const template = await DocumentTemplate.findByPk(req.params.id);
        
        if (!template) {
            return res.status(404).json({ message: 'Template não encontrado' });
        }

        const fields = JSON.parse(template.fields || '[]');
        
        res.json({
            id: template.id,
            name: template.name,
            description: template.description,
            fields: fields,
            fieldCount: template.field_count
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao buscar template', 
            error: error.message 
        });
    }
};

// Gerar documento a partir de template
exports.generateDocument = async (req, res) => {
    try {
        const { templateId, fieldValues, outputFormat = 'docx' } = req.body;

        // Buscar template
        const template = await DocumentTemplate.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template não encontrado' });
        }

        const fields = JSON.parse(template.fields || '[]');
        
        // Validar campos
        const validation = DocumentTemplateProcessor.validateFieldValues(fields, fieldValues);
        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Campos obrigatórios não preenchidos',
                missingFields: validation.missingFields
            });
        }

        // Gerar documento DOCX
        const docxBuffer = DocumentTemplateProcessor.generateDocx(
            template.file_data, 
            validation.validValues
        );

        let outputBuffer = docxBuffer;
        let contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        let fileName = `${template.name}_gerado.docx`;

        // Converter para PDF se solicitado
        if (outputFormat === 'pdf') {
            outputBuffer = await DocumentTemplateProcessor.convertDocxToPdf(docxBuffer);
            contentType = 'application/pdf';
            fileName = `${template.name}_gerado.pdf`;
        }

        // Configurar headers para download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', outputBuffer.length);

        res.send(outputBuffer);
    } catch (error) {
        console.error('Erro ao gerar documento:', error);
        res.status(500).json({ 
            message: 'Erro ao gerar documento', 
            error: error.message 
        });
    }
};

// Preview do documento (retorna HTML para visualização)
exports.previewDocument = async (req, res) => {
    try {
        const { templateId, fieldValues } = req.body;

        // Buscar template
        const template = await DocumentTemplate.findByPk(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template não encontrado' });
        }

        const fields = JSON.parse(template.fields || '[]');
        
        // Validar campos
        const validation = DocumentTemplateProcessor.validateFieldValues(fields, fieldValues);
        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Campos obrigatórios não preenchidos',
                missingFields: validation.missingFields
            });
        }

        // Gerar documento DOCX
        const docxBuffer = DocumentTemplateProcessor.generateDocx(
            template.file_data, 
            validation.validValues
        );

        // Converter para HTML para preview
        const mammoth = require('mammoth');
        const result = await mammoth.convertToHtml({ buffer: docxBuffer });
        
        res.json({
            html: result.value,
            messages: result.messages
        });
    } catch (error) {
        console.error('Erro ao gerar preview:', error);
        res.status(500).json({ 
            message: 'Erro ao gerar preview', 
            error: error.message 
        });
    }
};

// Deletar template
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await DocumentTemplate.findByPk(req.params.id);
        
        if (!template) {
            return res.status(404).json({ message: 'Template não encontrado' });
        }

        await template.update({ status: 'deleted' });
        
        res.json({ message: 'Template excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Erro ao deletar template', 
            error: error.message 
        });
    }
}; 