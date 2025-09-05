#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Função para adicionar uma nova imagem ao sistema
function addImage(imageName) {
  const configPath = path.join(__dirname, '../src/config/imageConfig.js');
  const imagesDir = path.join(__dirname, '../src/assets/login-images');
  
  // Verificar se a imagem existe
  const imagePath = path.join(imagesDir, imageName);
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Imagem não encontrada: ${imageName}`);
    console.log(`📁 Coloque a imagem em: ${imagesDir}`);
    return;
  }

  // Ler o arquivo de configuração
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Extrair o nome da imagem sem extensão
  const imageNameWithoutExt = path.parse(imageName).name;
  
  // Adicionar o import
  const importRegex = /(import image\d+ from '\.\.\/assets\/login-images\/image\d+\.jpg';)/g;
  const imports = configContent.match(importRegex);
  const lastImport = imports[imports.length - 1];
  const newImport = `import ${imageNameWithoutExt} from '../assets/login-images/${imageName}';`;
  
  configContent = configContent.replace(lastImport, `${lastImport}\n${newImport}`);
  
  // Adicionar ao array
  const arrayRegex = /(export const loginImages = \[[\s\S]*?\];)/;
  const arrayMatch = configContent.match(arrayRegex);
  if (arrayMatch) {
    const arrayContent = arrayMatch[1];
    const newArrayContent = arrayContent.replace(
      /(\];)/,
      `,\n  ${imageNameWithoutExt}\n];`
    );
    configContent = configContent.replace(arrayContent, newArrayContent);
  }
  
  // Salvar o arquivo
  fs.writeFileSync(configPath, configContent);
  
  console.log(`✅ Imagem ${imageName} adicionada com sucesso!`);
  console.log(`🔄 Reinicie o servidor para ver as mudanças`);
}

// Verificar argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('📖 Uso: node add-image.js <nome-da-imagem>');
  console.log('📖 Exemplo: node add-image.js minha-imagem.jpg');
  process.exit(1);
}

const imageName = args[0];
addImage(imageName);
