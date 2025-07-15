const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const mammoth = require('mammoth');
const DocumentLayout = require('../models/DocumentLayout');

// Função para extrair placeholders de um documento DOCX
const extractPlaceholders = (filePath) => {
  try {
    console.log('Extraindo placeholders do arquivo:', filePath);
    
    const content = fs.readFileSync(filePath, 'binary');
    const zip = new PizZip(content);
    
    // Extrair texto diretamente do XML sem usar docxtemplater
    let documentXml = '';
    
    try {
      // Tentar ler document.xml
      documentXml = zip.files['word/document.xml'].asText();
    } catch (xmlError) {
      console.error('Erro ao ler document.xml:', xmlError);
      return [];
    }

    // Extrair placeholders usando regex no XML bruto
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = [];
    let match;

    // Limpar o XML de tags para obter texto puro
    const textContent = documentXml
      .replace(/<[^>]*>/g, '') // Remove todas as tags XML
      .replace(/&lt;/g, '<')   // Decodifica entidades HTML
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    console.log('Texto extraído (primeiros 500 chars):', textContent.substring(0, 500));

    while ((match = placeholderRegex.exec(textContent)) !== null) {
      const placeholder = match[1].trim();
      if (placeholder && !placeholders.includes(placeholder)) {
        placeholders.push(placeholder);
      }
    }

    console.log('Placeholders encontrados:', placeholders);
    return placeholders;
  } catch (error) {
    console.error('Erro ao extrair placeholders:', error);
    return [];
  }
};

// Listar todos os layouts
const getAllLayouts = async (req, res) => {
  try {
    console.log('Buscando todos os layouts...');
    
    const layouts = await DocumentLayout.findAll({
      order: [['created_at', 'DESC']]
    });
    
    console.log(`Encontrados ${layouts.length} layouts`);
    
    // Garantir que placeholders seja sempre um array
    const layoutsWithParsedPlaceholders = layouts.map(layout => {
      const layoutData = layout.toJSON();
      
      // Se placeholders já é um array (devido ao getter do modelo), usar diretamente
      // Senão, tentar fazer parse
      let placeholders = [];
      if (Array.isArray(layoutData.placeholders)) {
        placeholders = layoutData.placeholders;
      } else if (typeof layoutData.placeholders === 'string') {
        try {
          placeholders = JSON.parse(layoutData.placeholders);
        } catch (e) {
          console.error('Erro ao fazer parse dos placeholders:', e);
          placeholders = [];
        }
      }
      
      return {
        ...layoutData,
        placeholders: placeholders
      };
    });
    
    res.json(layoutsWithParsedPlaceholders);
  } catch (error) {
    console.error('Erro ao buscar layouts:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Buscar layout por ID
const getLayout = async (req, res) => {
  try {
    const layout = await DocumentLayout.findByPk(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout não encontrado' });
    }
    
    const layoutData = layout.toJSON();
    
    // Garantir que placeholders seja sempre um array
    let placeholders = [];
    if (Array.isArray(layoutData.placeholders)) {
      placeholders = layoutData.placeholders;
    } else if (typeof layoutData.placeholders === 'string') {
      try {
        placeholders = JSON.parse(layoutData.placeholders);
      } catch (e) {
        console.error('Erro ao fazer parse dos placeholders:', e);
        placeholders = [];
      }
    }
    
    const responseLayout = {
      ...layoutData,
      placeholders: placeholders
    };
    
    res.json(responseLayout);
  } catch (error) {
    console.error('Erro ao buscar layout:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar novo layout
const createLayout = async (req, res) => {
  try {
    console.log('Criando novo layout...');
    console.log('Arquivo recebido:', req.file);
    console.log('Dados do body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo DOCX é obrigatório' });
    }

    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }

    // Extrair placeholders do arquivo
    const placeholders = extractPlaceholders(req.file.path);
    console.log('Placeholders extraídos para salvar:', placeholders);

    // Criar registro no banco - usar string JSON diretamente para evitar conflitos com getter/setter
    const layout = await DocumentLayout.create({
      name: name.trim(),
      description: description?.trim() || '',
      file_path: req.file.path,
      original_filename: req.file.originalname,
      placeholders: JSON.stringify(placeholders), // Forçar string JSON
      created_by: req.user?.id || 1
    });

    console.log('Layout criado com ID:', layout.id);

    // Retornar layout com placeholders como array
    const responseLayout = {
      id: layout.id,
      name: layout.name,
      description: layout.description,
      file_path: layout.file_path,
      original_filename: layout.original_filename,
      placeholders: placeholders, // Array direto
      created_by: layout.created_by,
      created_at: layout.created_at,
      updated_at: layout.updated_at
    };

    res.status(201).json(responseLayout);
  } catch (error) {
    console.error('Erro ao criar layout:', error);
    
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

// Deletar layout
const deleteLayout = async (req, res) => {
  try {
    const layout = await DocumentLayout.findByPk(req.params.id);
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout não encontrado' });
    }

    // Remover arquivo do sistema
    if (fs.existsSync(layout.file_path)) {
      fs.unlinkSync(layout.file_path);
    }

    await layout.destroy();
    res.json({ message: 'Layout excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar layout:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Preview do layout (sem dados preenchidos)
const previewLayout = async (req, res) => {
  try {
    console.log('Gerando preview do layout:', req.params.id);
    
    const layout = await DocumentLayout.findByPk(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout não encontrado' });
    }

    if (!fs.existsSync(layout.file_path)) {
      return res.status(404).json({ message: 'Arquivo do layout não encontrado' });
    }

    // Converter DOCX para HTML usando mammoth para preview
    const result = await mammoth.convertToHtml({ path: layout.file_path });
    const html = result.value;

    // Retornar HTML para preview
    res.json({
      html: html,
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

// Preview do documento com dados preenchidos
const previewDocument = async (req, res) => {
  try {
    console.log('Gerando preview do documento com dados:', req.params.id);
    console.log('Dados recebidos:', req.body);
    
    const { data } = req.body;
    
    const layout = await DocumentLayout.findByPk(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout não encontrado' });
    }

    if (!fs.existsSync(layout.file_path)) {
      return res.status(404).json({ message: 'Arquivo do layout não encontrado' });
    }

    // Ler o arquivo template
    const content = fs.readFileSync(layout.file_path, 'binary');
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // Substituir placeholders usando a nova API
    doc.render(data);

    // Gerar DOCX temporário
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    
    // Salvar temporariamente
    const tempPath = path.join(__dirname, '../temp', `preview-${Date.now()}.docx`);
    const tempDir = path.dirname(tempPath);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempPath, buf);

    try {
      // Converter para HTML para preview
      const result = await mammoth.convertToHtml({ path: tempPath });
      const html = result.value;

      // Limpar arquivo temporário
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      // Retornar HTML para preview
      res.json({
        html: html,
        messages: result.messages
      });
    } catch (previewError) {
      // Limpar arquivo temporário em caso de erro
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw previewError;
    }
  } catch (error) {
    console.error('Erro ao gerar preview do documento:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar preview do documento',
      error: error.message 
    });
  }
};

// Gerar documento
const generateDocument = async (req, res) => {
  try {
    console.log('Gerando documento para layout:', req.params.id);
    console.log('Dados recebidos:', req.body);
    
    const { data, format = 'docx' } = req.body;
    
    const layout = await DocumentLayout.findByPk(req.params.id);
    if (!layout) {
      return res.status(404).json({ message: 'Layout não encontrado' });
    }

    if (!fs.existsSync(layout.file_path)) {
      return res.status(404).json({ message: 'Arquivo do layout não encontrado' });
    }

    // Ler o arquivo template
    const content = fs.readFileSync(layout.file_path, 'binary');
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // Substituir placeholders usando a nova API
    doc.render(data);

    if (format === 'docx') {
      // Gerar DOCX
      const buf = doc.getZip().generate({ type: 'nodebuffer' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(layout.name)}.docx"`);
      res.end(buf, 'binary');
    } else if (format === 'pdf') {
      // Gerar PDF usando uma abordagem mais robusta
      await generatePDF(doc, layout, res);
    } else {
      res.status(400).json({ message: 'Formato não suportado. Use "docx" ou "pdf".' });
    }
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar documento',
      error: error.message 
    });
  }
};

// Função separada para gerar PDF usando abordagem híbrida
const generatePDF = async (doc, layout, res) => {
  let browser = null;
  let tempDocxPath = null;
  
  try {
    console.log('Iniciando geração de PDF híbrida (layout preservado + bordas)...');
    
    // Gerar DOCX temporário
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    
    tempDocxPath = path.join(__dirname, '../temp', `temp-${Date.now()}.docx`);
    const tempDir = path.dirname(tempDocxPath);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempDocxPath, buf);
    console.log('DOCX temporário criado:', tempDocxPath);

    // Converter DOCX para HTML usando mammoth
    console.log('Convertendo DOCX para HTML...');
    const result = await mammoth.convertToHtml({ 
      path: tempDocxPath,
      options: {
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true
      }
    });
    
    let html = result.value;
    console.log('HTML gerado, tamanho:', html.length);

    // Criar HTML completo para PDF com CSS otimizado para preservar layout E bordas
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${layout.name}</title>
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
            line-height: 1.4; 
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
          
          /* REGRAS PARA MANTER TABELAS UNIDAS E COM BORDAS */
          table { 
            border-collapse: collapse !important; 
            width: 100% !important; 
            margin: 5px 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #000 !important;
          }
          
          /* Forçar TODAS as tabelas a ficarem na mesma página */
          table, table * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Células da tabela com bordas visíveis */
          td, th {
            border: 1px solid #000 !important; 
            padding: 6px !important; 
            text-align: left !important;
            vertical-align: top !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Cabeçalho da tabela */
          th { 
            background-color: #f5f5f5 !important; 
            font-weight: bold !important;
            border: 1px solid #000 !important;
          }
          
          /* Linhas da tabela */
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #000 !important;
          }
          
          /* Cabeçalho e corpo da tabela */
          thead, thead tr, thead th {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #000 !important;
          }
          
          tbody, tbody tr, tbody td {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #000 !important;
          }
          
          /* Remover espaçamentos desnecessários */
          p + table, div + table, br + table {
            margin-top: 2px !important;
          }
          
          table + p, table + div, table + br {
            margin-bottom: 2px !important;
          }
          
          p { 
            margin: 6px 0; 
            text-align: justify;
          }
          h1, h2, h3, h4, h5, h6 { 
            margin: 15px 0 8px 0; 
            page-break-after: avoid;
            color: #000;
          }
          h1 { font-size: 18pt; font-weight: bold; }
          h2 { font-size: 16pt; font-weight: bold; }
          h3 { font-size: 14pt; font-weight: bold; }
          ul, ol { 
            margin: 8px 0; 
            padding-left: 25px; 
          }
          li { 
            margin: 2px 0; 
          }
          strong, b { 
            font-weight: bold; 
          }
          em, i { 
            font-style: italic; 
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
    
    // Executar JavaScript para otimizar tabelas (preservar layout + garantir bordas)
    await page.evaluate(() => {
      console.log('Otimizando tabelas para preservar layout e bordas...');
      
      const tables = document.querySelectorAll('table');
      console.log(`Encontradas ${tables.length} tabelas para otimizar`);
      
      tables.forEach((table, index) => {
        console.log(`Processando tabela ${index + 1}...`);
        
        // FORÇAR propriedades de não quebra
        table.style.setProperty('page-break-inside', 'avoid', 'important');
        table.style.setProperty('break-inside', 'avoid', 'important');
        table.style.setProperty('border-collapse', 'collapse', 'important');
        table.style.setProperty('border', '1px solid #000', 'important');
        table.style.setProperty('margin', '5px 0', 'important');
        
        // Garantir bordas em todas as células
        const cells = table.querySelectorAll('td, th');
        cells.forEach(cell => {
          cell.style.setProperty('border', '1px solid #000', 'important');
          cell.style.setProperty('padding', '6px', 'important');
          cell.style.setProperty('page-break-inside', 'avoid', 'important');
          cell.style.setProperty('break-inside', 'avoid', 'important');
        });
        
        // Garantir bordas em todas as linhas
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          row.style.setProperty('border', '1px solid #000', 'important');
          row.style.setProperty('page-break-inside', 'avoid', 'important');
          row.style.setProperty('break-inside', 'avoid', 'important');
        });
        
        // Aplicar a TODOS os elementos filhos da tabela
        const allTableElements = table.querySelectorAll('*');
        allTableElements.forEach(element => {
          element.style.setProperty('page-break-inside', 'avoid', 'important');
          element.style.setProperty('break-inside', 'avoid', 'important');
        });
        
        // Remover espaços vazios antes da tabela (mas preservar conteúdo)
        let prevElement = table.previousElementSibling;
        while (prevElement) {
          if (prevElement.tagName === 'P' && (!prevElement.textContent || prevElement.textContent.trim() === '')) {
            const toRemove = prevElement;
            prevElement = prevElement.previousElementSibling;
            toRemove.remove();
          } else if (prevElement.tagName === 'BR') {
            const toRemove = prevElement;
            prevElement = prevElement.previousElementSibling;
            toRemove.remove();
          } else {
            prevElement.style.setProperty('margin-bottom', '2px', 'important');
            break;
          }
        }
        
        console.log(`Tabela ${index + 1} otimizada com bordas preservadas`);
      });
      
      console.log('Otimização de tabelas concluída');
    });
    
    // Aguardar mais um pouco após as modificações
    await new Promise(resolve => setTimeout(resolve, 500));
    
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

    // Limpar arquivo temporário
    if (tempDocxPath && fs.existsSync(tempDocxPath)) {
      fs.unlinkSync(tempDocxPath);
    }

    // Verificar se o buffer é válido
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF buffer está vazio');
    }

    // Enviar PDF
    const fileName = `${layout.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer, 'binary');
    
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
    
    // Limpar arquivo temporário
    if (tempDocxPath && fs.existsSync(tempDocxPath)) {
      fs.unlinkSync(tempDocxPath);
    }
    
    res.status(500).json({ 
      message: 'Erro ao gerar PDF. Tente o formato DOCX.',
      error: pdfError.message 
    });
  }
};

module.exports = {
  getAllLayouts,
  getLayout,
  createLayout,
  deleteLayout,
  previewLayout,
  previewDocument,
  generateDocument
};
