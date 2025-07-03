const { Document, DocumentVersion, DocumentTemplate, Subject, User } = require('../models');
const PDFDocument = require('pdfkit');

exports.getDocuments = async (req, res) => {
    try {
        const docs = await Document.findAll();
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar documentos', error: error.message });
    }
};

    // Obter documento específico
exports.getDocument = async (req, res) => {
    try {
        const doc = await Document.findByPk(req.params.id);

        if (!doc) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar documento', error: error.message });
    }
};

exports.createDocument = async (req, res) => {
    try {
        const { 
            title, 
            subject_id, 
            template_id,
            content,
            file_name, 
            file_type, 
            file_data 
        } = req.body;

        const template = await DocumentTemplate.findByPk(template_id);
        if (!template) {
            //return res.status(404).json({ message: 'Template não encontrado' });
        }

        if (!validateContentAgainstTemplate(content, template.structure)) {
            return res.status(400).json({ message: 'Conteúdo não corresponde à estrutura do template' });
        }

        const document = await Document.create({
            title,
            subject_id,
            template_id,
            content,
            file_name,
            file_type,
            file_data: file_data ? Buffer.from(file_data, "base64") : null,
            created_by: req.user.id,
            last_modified_by: req.user.id,
            status: 'draft',
            version: 1
        });

        // Criar primeira versão
        await DocumentVersion.create({
            document_id: document.id,
            version: 1,
            content,
            modified_by: req.user.id,
            change_description: 'Criação inicial do documento'
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar documento', error: error.message });
    }
};

// Atualizar documento
exports.updateDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id, {
            include: [{ model: DocumentTemplate, as: 'template' }]
        });

        if (!document) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        const { content, status } = req.body;

        // Validar conteúdo contra template
        if (content && !validateContentAgainstTemplate(content, document.template.structure)) {
            return res.status(400).json({ message: 'Conteúdo não corresponde à estrutura do template' });
        }

        // Incrementar versão
        const newVersion = document.version + 1;

        // Atualizar documento
        await document.update({
            content: content || document.content,
            status: status || document.status,
            version: newVersion,
            last_modified_by: req.user.id
        });

        // Criar nova versão
        await DocumentVersion.create({
            document_id: document.id,
            version: newVersion,
            content: content || document.content,
            modified_by: req.user.id,
            change_description: req.body.change_description || 'Atualização do documento'
        });

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar documento', error: error.message });
    }
};

// Deletar documento
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);
        
        if (!document) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        await document.destroy();
        res.json({ message: 'Documento excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar documento', error: error.message });
    }
};

// Listar versões de um documento
exports.getDocumentVersions = async (req, res) => {
    try {
        const versions = await DocumentVersion.findAll({
            where: { document_id: req.params.id },
            include: [{
                model: User,
                as: 'modifier',
                attributes: ['id', 'name']
            }],
            order: [['version', 'DESC']]
        });

        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar versões do documento', error: error.message });
    }
};

// Download do documento
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id, {
            include: [
                { model: DocumentTemplate, as: 'template' },
                { model: Subject, as: 'subject' }
            ]
        });

        if (!document) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        // Gerar arquivo baseado no template e conteúdo
        const fileBuffer = await generateDocumentFile(document);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${document.title}.pdf"`);
        res.send(fileBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao baixar documento', error: error.message });
    }
};

// Função auxiliar para validar conteúdo contra template
const validateContentAgainstTemplate = (content, templateStructure) => {
    try {
        // Implementar lógica de validação do conteúdo contra a estrutura do template
        // Esta é uma implementação básica que deve ser adaptada às necessidades específicas
        
        if (!content || typeof content !== 'object') {
            return false;
        }

        // Verificar se todos os campos obrigatórios do template estão presentes
        for (const field of Object.keys(templateStructure)) {
            if (templateStructure[field].required && !content.hasOwnProperty(field)) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Erro na validação do template:', error);
        return false;
    }
}

// Função auxiliar para gerar arquivo do documento
const generateDocumentFile = async (document) => {
    return new Promise((resolve, reject) => {
        try {
            // Criar novo documento PDF
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: document.title,
                    Author: 'SISA',
                    Subject: document.subject ? document.subject.name : '',
                    Keywords: 'documento, acadêmico, sisa',
                    CreationDate: new Date()
                }
            });

            // Buffer para armazenar o PDF
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Configurar fonte e estilo padrão
            doc.font('Helvetica');

            // Adicionar cabeçalho
            doc.fontSize(20)
               .text('SISA - Sistema Acadêmico', { align: 'center' })
               .moveDown();

            // Título do documento
            doc.fontSize(18)
               .text(document.title, { align: 'center' })
               .moveDown();

            // Informações da disciplina
            if (document.subject) {
                doc.fontSize(12)
                   .text(`Disciplina: ${document.subject.name}`, { align: 'left' })
                   .moveDown();
            }

            // Adicionar linha separadora
            doc.moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke()
               .moveDown();

            // Conteúdo do documento baseado no template
            if (document.content && document.template && document.template.structure) {
                doc.fontSize(14)
                   .text('Conteúdo do Documento:', { underline: true })
                   .moveDown();

                // Iterar sobre os campos do template
                Object.entries(document.template.structure).forEach(([fieldName, fieldConfig]) => {
                    const value = document.content[fieldName];
                    if (value) {
                        // Título do campo
                        doc.fontSize(12)
                           .fillColor('#444444')
                           .text(`${fieldConfig.label || fieldName}:`, { continued: false });

                        // Valor do campo
                        doc.fontSize(11)
                           .fillColor('#000000')
                           .text(value.toString(), { indent: 20 })
                           .moveDown(0.5);
                    }
                });
            }

            // Adicionar linha separadora
            doc.moveDown()
               .moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke()
               .moveDown();

            // Rodapé com informações do documento
            doc.fontSize(10)
               .text(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' })
               .text(`Versão: ${document.version}`, { align: 'center' })
               .text(`Status: ${document.status}`, { align: 'center' });

            // Adicionar numeração de páginas
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                   .text(
                       `Página ${i + 1} de ${pages.count}`,
                       50,
                       doc.page.height - 50,
                       { align: 'center' }
                   );
            }

            // Finalizar o PDF
            doc.end();

        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            reject(error);
        }
    });
}
