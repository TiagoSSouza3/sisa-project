#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Instalando todas as dependências...\n');

const runCommand = (command, cwd = process.cwd()) => {
  try {
    console.log(`📦 Executando: ${command}`);
    console.log(`📁 Diretório: ${cwd}\n`);
    
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    
    console.log('✅ Sucesso!\n');
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    console.error(`Diretório: ${cwd}`);
    console.error(`Erro: ${error.message}\n`);
    process.exit(1);
  }
};

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('1️⃣ Instalando dependências da raiz...');
runCommand('npm install', rootDir);

console.log('2️⃣ Instalando dependências do backend...');
runCommand('npm install', backendDir);

console.log('3️⃣ Instalando dependências do frontend...');
runCommand('npm install', frontendDir);

console.log('🎉 Todas as dependências foram instaladas com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('   npm start    - Iniciar backend + frontend');
console.log('   npm run dev  - Iniciar em modo desenvolvimento');