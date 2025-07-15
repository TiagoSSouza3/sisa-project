const DocumentTemplateProcessor = require('./documentTemplateProcessor');
const fs = require('fs');
const path = require('path');

exports.analyzeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const fields = DocumentTemplateProcessor.extractTemplateFields(req.file.buffer);
    
    res.json({
      message: "Documento analisado com sucesso",
      placeholders: fields,
      fileName: req.file.originalname
    });
    
  } catch (error) {
    console.error("Erro na análise:", error);
    res.status(500).json({ error: "Erro no processamento do documento" });
  }
};

exports.previewDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const fields = JSON.parse(req.body.fields);
    const html = await DocumentTemplateProcessor.generatePreview(req.file.buffer, fields);
    
    res.json({ html });
    
  } catch (error) {
    console.error("Erro no preview:", error);
    res.status(500).json({ error: "Erro ao gerar preview" });
  }
};

exports.processDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const fields = JSON.parse(req.body.fields);
    const format = req.body.format || 'docx';
    
    let resultBuffer;
    if (format === 'pdf') {
      resultBuffer = await DocumentTemplateProcessor.generatePDF(req.file.buffer, fields);
      res.set('Content-Type', 'application/pdf');
    } else {
      resultBuffer = DocumentTemplateProcessor.generateDOCX(req.file.buffer, fields);
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    
    res.send(resultBuffer);
    
  } catch (error) {
    console.error("Erro no processamento:", error);
    res.status(500).json({ error: "Erro ao processar documento" });
  }
};