const DocumentTemplate = require('../models/DocumentTemplate');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/templates');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos DOCX são permitidos'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Função para extrair placeholders de um documento DOCX
async function extractPlaceholders(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        const text = result.value;
        
        // Regex para encontrar placeholders no formato {{campo}}
        const placeholderRegex = /\{\{([^}]+)\}\}/g;
        const placeholders = [];
        const placeholderConfig = {};
        
        let match;
        while ((match = placeholderRegex.exec(text)) !== null) {
            const placeholder = match[1].trim();
            if (!placeholders.includes(placeholder)) {
                placeholders.push(placeholder);
                placeholderConfig[placeholder] = {
                    label: placeholder,
                    defaultValue: '',
                    required: false,
                    type: 'text'
                };
            }
        }
        
        return { placeholders, placeholderConfig };
    } catch (error) {
        throw new Error('Erro ao extrair placeholders do documento');
    }
}

// Função para gerar PDF simples
async function generatePDF(templatePath, fields) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const chunks = [];
            
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            
            // Extrair texto do template e substituir placeholders
            mammoth.extractRawText({ path: templatePath })
                .then(result => {
                    let content = result.value;
                    
                    Object.keys(fields).forEach(key => {
                        const placeholder = `{{${key}}}`;
                        const value = fields[key] || '';
                        content = content.replace(new RegExp(placeholder, 'g'), value);
                    });
                    
                    doc.fontSize(12);
                    content.split('\n').forEach(line => {
                        if (line.trim()) {
                            doc.text(line);
                            doc.moveDown();
                        }
                    });
                    
                    doc.end();
                })
                .catch(reject);
        } catch (error) {
            reject(new Error('Erro ao gerar PDF'));
        }
    });
}

// Controladores
const documentTemplateController = {
    // Upload e criação de template
    async createTemplate(req, res) {
        try {
            upload.single('file')(req, res, async (err) => {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
                
                if (!req.file) {
                    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
                }
                
                const { name, description } = req.body;
                
                if (!name) {
                    return res.status(400).json({ message: 'Nome do template é obrigatório' });
                }
                
                // Extrair placeholders do documento
                const { placeholders, placeholderConfig } = await extractPlaceholders(req.file.path);
                
                // Criar template no banco
                const template = await DocumentTemplate.create({
                    name,
                    description,
                    filename: req.file.originalname,
                    file_path: req.file.path,
                    placeholders,
                    placeholder_config: placeholderConfig,
                    created_by: req.user.id
                });
                
                res.status(201).json({
                    message: 'Template criado com sucesso',
                    template: {
                        id: template.id,
                        name: template.name,
                        description: template.description,
                        placeholders: template.placeholders,
                        placeholder_config: template.placeholder_config
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao criar template:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    // Listar todos os templates
    async getAllTemplates(req, res) {
        try {
            const templates = await DocumentTemplate.findAll({
                where: { is_active: true },
                order: [['createdAt', 'DESC']]
            });
            
            res.json(templates);
        } catch (error) {
            console.error('Erro ao buscar templates:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    // Buscar template por ID
    async getTemplate(req, res) {
        try {
            const { id } = req.params;
            
            const template = await DocumentTemplate.findByPk(id);
            
            if (!template) {
                return res.status(404).json({ message: 'Template não encontrado' });
            }
            
            res.json(template);
        } catch (error) {
            console.error('Erro ao buscar template:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    // Atualizar configuração de placeholders
    async updateTemplate(req, res) {
        try {
            const { id } = req.params;
            const { name, description, placeholder_config } = req.body;
            
            const template = await DocumentTemplate.findByPk(id);
            
            if (!template) {
                return res.status(404).json({ message: 'Template não encontrado' });
            }
            
            // Verificar se o usuário é o criador do template
            if (template.created_by !== req.user.id) {
                return res.status(403).json({ message: 'Sem permissão para editar este template' });
            }
            
            await template.update({
                name: name || template.name,
                description: description || template.description,
                placeholder_config: placeholder_config || template.placeholder_config
            });
            
            res.json({
                message: 'Template atualizado com sucesso',
                template
            });
        } catch (error) {
            console.error('Erro ao atualizar template:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    // Deletar template
    async deleteTemplate(req, res) {
        try {
            const { id } = req.params;
            
            const template = await DocumentTemplate.findByPk(id);
            
            if (!template) {
                return res.status(404).json({ message: 'Template não encontrado' });
            }
            
            // Verificar se o usuário é o criador do template
            if (template.created_by !== req.user.id) {
                return res.status(403).json({ message: 'Sem permissão para deletar este template' });
            }
            
            // Deletar arquivo físico
            if (fs.existsSync(template.file_path)) {
                fs.unlinkSync(template.file_path);
            }
            
            await template.destroy();
            
            res.json({ message: 'Template deletado com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar template:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    // Gerar documento a partir do template
    async generateDocument(req, res) {
        try {
            const { id } = req.params;
            const { fields, format = 'docx' } = req.body;
            
            const template = await DocumentTemplate.findByPk(id);
            
            if (!template) {
                return res.status(404).json({ message: 'Template não encontrado' });
            }
            
            if (!fs.existsSync(template.file_path)) {
                return res.status(404).json({ message: 'Arquivo do template não encontrado' });
            }
            
            if (format === 'pdf') {
                const fileBuffer = await generatePDF(template.file_path, fields);
                const filename = `${template.name}_preenchido.pdf`;
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(fileBuffer);
            } else {
                return res.status(400).json({ message: 'Formato DOCX não implementado neste controller. Use o novo sistema de layouts.' });
            }
            
        } catch (error) {
            console.error('Erro ao gerar documento:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
    
    // Preview do documento
    async previewDocument(req, res) {
        try {
            const { id } = req.params;
            const { fields } = req.body;
            
            const template = await DocumentTemplate.findByPk(id);
            
            if (!template) {
                return res.status(404).json({ message: 'Template não encontrado' });
            }
            
            if (!fs.existsSync(template.file_path)) {
                return res.status(404).json({ message: 'Arquivo do template não encontrado' });
            }
            
            // Extrair texto e substituir placeholders
            const result = await mammoth.extractRawText({ path: template.file_path });
            let content = result.value;
            
            Object.keys(fields).forEach(key => {
                const placeholder = `{{${key}}}`;
                const value = fields[key] || '';
                content = content.replace(new RegExp(placeholder, 'g'), value);
            });
            
            // Converter para HTML simples
            const html = content.split('\n').map(line => `<p>${line}</p>`).join('');
            
            res.json({ html });
            
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
};

module.exports = documentTemplateController;