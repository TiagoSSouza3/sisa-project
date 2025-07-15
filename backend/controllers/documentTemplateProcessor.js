const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { PDFDocument, rgb } = require('pdf-lib');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

class DocumentTemplateProcessor {
    /**
     * Extrai campos de template de um arquivo DOCX
     * @param {Buffer} docxBuffer - Buffer do arquivo DOCX
     * @returns {Array} Array de campos encontrados
     */
    static extractTemplateFields(docxBuffer) {
        try {
            const zip = new PizZip(docxBuffer);
            const doc = new Docxtemplater(zip);
            
            // Extrair campos do template
            const fields = [];
            const regex = /\{\{([^}]+)\}\}/g;
            let match;
            
            // Processar cada parte do documento
            const documentXml = zip.files['word/document.xml'].asText();
            while ((match = regex.exec(documentXml)) !== null) {
                const fieldName = match[1].trim();
                if (!fields.includes(fieldName)) {
                    fields.push(fieldName);
                }
            }
            
            return fields;
        } catch (error) {
            console.error('Erro ao extrair campos do template:', error);
            throw new Error('Erro ao processar arquivo DOCX');
        }
    }

    /**
     * Gera documento DOCX com campos substituídos
     * @param {Buffer} templateBuffer - Buffer do template DOCX
     * @param {Object} fieldValues - Valores para substituir os campos
     * @returns {Buffer} Buffer do documento gerado
     */
    static generateDocx(templateBuffer, fieldValues) {
        try {
            const zip = new PizZip(templateBuffer);
            const doc = new Docxtemplater(zip);
            
            // Renderizar template com valores
            doc.render(fieldValues);
            
            // Gerar arquivo final
            const output = doc.getZip().generate({ type: 'nodebuffer' });
            return output;
        } catch (error) {
            console.error('Erro ao gerar DOCX:', error);
            throw new Error('Erro ao gerar documento DOCX');
        }
    }

    /**
     * Converte DOCX para PDF
     * @param {Buffer} docxBuffer - Buffer do arquivo DOCX
     * @returns {Promise<Buffer>} Buffer do PDF gerado
     */
    static async convertDocxToPdf(docxBuffer) {
        try {
            // Converter DOCX para HTML primeiro
            const result = await mammoth.convertToHtml({ buffer: docxBuffer });
            const html = result.value;
            
            // Criar PDF simples (implementação básica)
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4
            const { width, height } = page.getSize();
            
            // Adicionar conteúdo HTML como texto simples
            const fontSize = 12;
            const lineHeight = fontSize * 1.2;
            let y = height - 50;
            
            // Dividir HTML em linhas e adicionar ao PDF
            const lines = html.replace(/<[^>]*>/g, '').split('\n');
            
            for (const line of lines) {
                if (y < 50) {
                    page = pdfDoc.addPage([595.28, 841.89]);
                    y = height - 50;
                }
                
                page.drawText(line.trim(), {
                    x: 50,
                    y: y,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                });
                
                y -= lineHeight;
            }
            
            const pdfBytes = await pdfDoc.save();
            return Buffer.from(pdfBytes);
        } catch (error) {
            console.error('Erro ao converter para PDF:', error);
            throw new Error('Erro ao converter documento para PDF');
        }
    }

    /**
     * Processa upload de template e extrai campos
     * @param {Object} file - Arquivo enviado
     * @returns {Object} Informações do template processado
     */
    static async processTemplateUpload(file) {
        try {
            if (!file || !file.buffer) {
                throw new Error('Arquivo não fornecido');
            }

            // Verificar se é um arquivo DOCX
            if (!file.mimetype.includes('wordprocessingml.document') && 
                !file.originalname.endsWith('.docx')) {
                throw new Error('Apenas arquivos DOCX são suportados');
            }

            // Extrair campos do template
            const fields = this.extractTemplateFields(file.buffer);
            
            return {
                originalName: file.originalname,
                fields: fields,
                templateBuffer: file.buffer,
                fieldCount: fields.length
            };
        } catch (error) {
            console.error('Erro ao processar template:', error);
            throw error;
        }
    }

    /**
     * Valida se todos os campos obrigatórios estão preenchidos
     * @param {Array} requiredFields - Campos obrigatórios
     * @param {Object} providedValues - Valores fornecidos
     * @returns {Object} Resultado da validação
     */
    static validateFieldValues(requiredFields, providedValues) {
        const missingFields = [];
        const validValues = {};

        for (const field of requiredFields) {
            if (!providedValues[field] || providedValues[field].trim() === '') {
                missingFields.push(field);
            } else {
                validValues[field] = providedValues[field].trim();
            }const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');

class DocumentTemplateProcessor {
  static extractTemplateFields(docxBuffer) {
    try {
      const zip = new PizZip(docxBuffer);
      const doc = new Docxtemplater(zip);
      const fields = new Set();
      
      const regex = /{{(.*?)}}/g;
      const content = zip.files['word/document.xml'].asText();
      
      let match;
      while ((match = regex.exec(content)) !== null) {
        fields.add(match[1].trim());
      }
      
      return Array.from(fields);
    } catch (error) {
      console.error("Erro na extração:", error);
      throw new Error("Falha ao extrair campos do template");
    }
  }

  static generateDOCX(templateBuffer, data) {
    try {
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      });
      
      // Preparar dados
      const formattedData = {};
      Object.keys(data).forEach(key => {
        formattedData[key] = data[key] || '';
      });
      
      doc.render(formattedData);
      return doc.getZip().generate({ type: 'nodebuffer' });
    } catch (error) {
      console.error("Erro na geração DOCX:", error);
      throw new Error("Falha ao gerar documento");
    }
  }

  static async generatePreview(templateBuffer, data) {
    try {
      const docxBuffer = this.generateDOCX(templateBuffer, data);
      const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6 }
            table { border-collapse: collapse; width: 100% }
            table, th, td { border: 1px solid #ddd }
            th, td { padding: 8px; text-align: left }
          </style>
        </head>
        <body>${html}</body>
        </html>
      `;
    } catch (error) {
      console.error("Erro no preview HTML:", error);
      throw new Error("Falha ao gerar preview");
    }
  }

  static async generatePDF(templateBuffer, data) {
    try {
      const docxBuffer = this.generateDOCX(templateBuffer, data);
      const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
      
      // Criar PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      
      // Adicionar conteúdo (simplificado)
      page.drawText(html.replace(/<[^>]*>/g, ''), {
        x: 50,
        y: page.getHeight() - 50,
        size: 12,
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error("Erro na geração PDF:", error);
      throw new Error("Falha ao gerar PDF");
    }
  }
}

module.exports = DocumentTemplateProcessor;
        }

        return {
            isValid: missingFields.length === 0,
            missingFields,
            validValues
        };
    }
}

module.exports = DocumentTemplateProcessor; 