const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const multer = require('multer');

// Configuração do multer para documentos gerais
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/all-documents/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    console.log('Verificando arquivo:', file.originalname, 'MIME:', file.mimetype);
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos DOCX são permitidos'), false);
    }
  }
});

// Simulação de banco de dados em memória (em produção, usar banco real)
let allDocuments = [];
let nextId = 1;

// Listar todos os documentos
const getAllDocuments = async (req, res) => {
  try {
    console.log('Buscando todos os documentos...');
    
    // Ordenar por data de criação (mais recentes primeiro)
    const sortedDocuments = allDocuments.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    console.log(`Encontrados ${sortedDocuments.length} documentos`);
    res.json(sortedDocuments);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar documento por ID
const getDocument = async (req, res) => {
  try {
    const document = allDocuments.find(doc => doc.id === parseInt(req.params.id));
    
    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar novo documento
const createDocument = async (req, res) => {
  try {
    console.log('Criando novo documento...');
    console.log('Arquivo recebido:', req.file);
    console.log('Dados do body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo DOCX é obrigatório' });
    }

    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    // Verificar se o arquivo foi salvo corretamente
    if (!fs.existsSync(req.file.path)) {
      console.error('Arquivo não foi salvo:', req.file.path);
      return res.status(500).json({ message: 'Erro ao salvar arquivo' });
    }

    // Verificar se o arquivo é um DOCX válido
    const buffer = fs.readFileSync(req.file.path);
    if (buffer.length === 0) {
      console.error('Arquivo está vazio');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Arquivo está vazio' });
    }

    // Verificar assinatura ZIP (DOCX é um arquivo ZIP)
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      console.error('Arquivo não é um ZIP válido (DOCX)');
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Arquivo não é um DOCX válido' });
    }

    console.log('Arquivo validado com sucesso:', {
      path: req.file.path,
      size: buffer.length,
      signature: buffer.slice(0, 4)
    });

    // Criar registro do documento
    const document = {
      id: nextId++,
      name: name.trim(),
      description: description?.trim() || '',
      file_path: req.file.path,
      original_filename: req.file.originalname,
      file_size: req.file.size,
      created_by: req.user?.id || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    allDocuments.push(document);

    console.log('Documento criado com ID:', document.id);
    res.status(201).json(document);
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    
    // Remover arquivo se houve erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Deletar documento
const deleteDocument = async (req, res) => {
  try {
    const documentIndex = allDocuments.findIndex(doc => doc.id === parseInt(req.params.id));
    
    if (documentIndex === -1) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    const document = allDocuments[documentIndex];

    // Remover arquivo do sistema
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Remover do array
    allDocuments.splice(documentIndex, 1);

    res.json({ message: 'Documento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Preview do documento
const previewDocument = async (req, res) => {
  try {
    console.log('Gerando preview do documento:', req.params.id);
    
    const document = allDocuments.find(doc => doc.id === parseInt(req.params.id));
    
    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ message: 'Arquivo do documento não encontrado' });
    }

    console.log('Arquivo encontrado:', document.file_path);
    
    // Ler arquivo como buffer
    const buffer = fs.readFileSync(document.file_path);
    console.log('Tamanho do arquivo:', buffer.length, 'bytes');
    console.log('Primeiros 4 bytes:', buffer.slice(0, 4));
    
    // Verificar se é um ZIP válido (DOCX)
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      console.error('Arquivo não é um ZIP válido');
      return res.status(400).json({ 
        message: 'Arquivo corrompido ou não é um DOCX válido' 
      });
    }

    // Converter DOCX para HTML usando mammoth com buffer
    console.log('Convertendo DOCX para HTML...');
    const result = await mammoth.convertToHtml({ 
      buffer: buffer,
      options: {
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true
      }
    });
    
    const html = result.value;
    console.log('Preview gerado com sucesso, tamanho HTML:', html.length);

    // Retornar HTML para preview
    res.json({
      html: html,
      messages: result.messages || []
    });
  } catch (error) {
    console.error('Erro detalhado ao gerar preview:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar preview',
      error: error.message 
    });
  }
};

// Download do documento
const downloadDocument = async (req, res) => {
  try {
    console.log('Iniciando download do documento:', req.params.id);
    
    const { format = 'docx' } = req.query; // docx ou pdf
    const document = allDocuments.find(doc => doc.id === parseInt(req.params.id));
    
    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ message: 'Arquivo do documento não encontrado' });
    }

    console.log('Enviando arquivo para download:', document.file_path, 'formato:', format);

    if (format === 'docx') {
      // Download DOCX original
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.original_filename)}"`);
      
      const buffer = fs.readFileSync(document.file_path);
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer, 'binary');
      
      console.log('Download DOCX concluído com sucesso');
    } else if (format === 'pdf') {
      // Gerar PDF usando mammoth + puppeteer
      await generatePDFFromDocument(document, res);
    } else {
      res.status(400).json({ message: 'Formato não suportado. Use "docx" ou "pdf".' });
    }
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ 
      message: 'Erro ao fazer download',
      error: error.message 
    });
  }
};

// Função para gerar PDF do documento
const generatePDFFromDocument = async (document, res) => {
  let browser = null;
  
  try {
    console.log('Gerando PDF do documento:', document.name);
    
    // Ler arquivo como buffer
    const buffer = fs.readFileSync(document.file_path);
    
    // Verificar se é um ZIP válido (DOCX)
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      throw new Error('Arquivo não é um DOCX válido');
    }

    // Converter DOCX para HTML
    console.log('Convertendo DOCX para HTML...');
    const result = await mammoth.convertToHtml({ 
      buffer: buffer,
      options: {
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true
      }
    });
    
    let html = result.value;
    console.log('HTML gerado, tamanho:', html.length);

    // Criar HTML completo para PDF
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${document.name}</title>
        <style>
          @page {
            margin: 2cm;
            size: A4;
          }
          * {
            box-sizing: border-box;
          }
          body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.5; 
            margin: 0;
            padding: 0;
            color: #000;
            font-size: 12pt;
            background: white;
          }
          img { 
            max-width: 100%; 
            height: auto; 
            display: block;
            margin: 10px auto;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 15px 0;
            page-break-inside: auto;
          }
          
          /* Evitar quebra de página apenas no cabeçalho da tabela */
          thead, thead tr, thead th {
            page-break-inside: avoid;
            page-break-after: avoid;
          }
          
          /* Permitir quebra no corpo da tabela, mas evitar órfãs */
          tbody tr {
            page-break-inside: avoid;
          }
          
          /* Evitar que uma linha fique sozinha no final/início da página */
          tr {
            orphans: 2;
            widows: 2;
          }
          td, th { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: left;
            vertical-align: top;
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          p { 
            margin: 8px 0; 
            text-align: justify;
          }
          h1, h2, h3, h4, h5, h6 { 
            margin: 20px 0 10px 0; 
            page-break-after: avoid;
            color: #000;
          }
          h1 { font-size: 18pt; font-weight: bold; }
          h2 { font-size: 16pt; font-weight: bold; }
          h3 { font-size: 14pt; font-weight: bold; }
          ul, ol { 
            margin: 10px 0; 
            padding-left: 25px; 
          }
          li { 
            margin: 3px 0; 
          }
          strong, b { 
            font-weight: bold; 
          }
          em, i { 
            font-style: italic; 
          }
          .page-break { 
            page-break-before: always; 
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // Usar puppeteer para gerar PDF
    console.log('Iniciando Puppeteer...');
    const puppeteer = require('puppeteer');
    
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const page = await browser.newPage();
    
    // Configurar página
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('Carregando HTML na página...');
    await page.setContent(fullHtml, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Aguardar um pouco para garantir que tudo carregou
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Gerando PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      timeout: 30000
    });

    console.log('PDF gerado com sucesso! Tamanho:', pdfBuffer.length, 'bytes');

    // Fechar browser
    await browser.close();
    browser = null;

    // Verificar se o buffer é válido
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF buffer está vazio');
    }

    // Enviar PDF
    const fileName = `${document.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer, 'binary');
    
    console.log('Download PDF concluído com sucesso');
    
  } catch (pdfError) {
    console.error('Erro detalhado ao gerar PDF:', pdfError);
    
    // Fechar browser se ainda estiver aberto
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Erro ao fechar browser:', closeError);
      }
    }
    
    res.status(500).json({ 
      message: 'Erro ao gerar PDF. Tente o formato DOCX.',
      error: pdfError.message 
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocument,
  createDocument,
  deleteDocument,
  previewDocument,
  downloadDocument,
  upload
};