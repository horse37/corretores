#!/usr/bin/env node

/**
 * Script de inicialização para corrigir permissões dos diretórios de upload
 * Executa automaticamente quando a aplicação inicia
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando correção de permissões...');

// Definir diretórios de upload
const baseDir = process.cwd();
const uploadDirs = [
  path.join(baseDir, 'public', 'uploads'),
  path.join(baseDir, 'public', 'uploads', 'imoveis'),
  path.join(baseDir, 'public', 'uploads', 'corretores'),
  path.join(baseDir, 'public', 'uploads', 'imoveis', 'videos')
];

console.log(`📁 Diretório base: ${baseDir}`);

// Função para criar diretório se não existir
function ensureDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Diretório criado: ${dirPath}`);
    } else {
      console.log(`📂 Diretório já existe: ${dirPath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao criar diretório ${dirPath}:`, error.message);
  }
}

// Função para aplicar permissões
function applyPermissions(dirPath) {
  try {
    // Tentar aplicar permissões usando fs.chmod
    fs.chmodSync(dirPath, 0o777);
    console.log(`🔐 Permissões aplicadas: ${dirPath}`);
  } catch (error) {
    console.warn(`⚠️ Não foi possível aplicar permissões via fs.chmod: ${error.message}`);
    
    // Tentar usando execSync como fallback
    try {
      execSync(`chmod 777 "${dirPath}"`, { stdio: 'ignore' });
      console.log(`🔐 Permissões aplicadas via chmod: ${dirPath}`);
    } catch (execError) {
      console.warn(`⚠️ Não foi possível aplicar permissões via chmod: ${execError.message}`);
    }
  }
}

// Função para testar escrita
function testWrite(dirPath) {
  const testFile = path.join(dirPath, 'test_write.tmp');
  try {
    fs.writeFileSync(testFile, 'teste de escrita');
    fs.unlinkSync(testFile);
    console.log(`✅ Teste de escrita bem-sucedido: ${dirPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Falha no teste de escrita em ${dirPath}:`, error.message);
    return false;
  }
}

// Executar correções
async function initPermissions() {
  console.log('\n=== CRIANDO DIRETÓRIOS ===');
  
  // Criar todos os diretórios
  uploadDirs.forEach(ensureDirectory);
  
  console.log('\n=== APLICANDO PERMISSÕES ===');
  
  // Aplicar permissões
  uploadDirs.forEach(applyPermissions);
  
  console.log('\n=== TESTANDO ESCRITA ===');
  
  // Testar escrita em cada diretório
  let allTestsPassed = true;
  uploadDirs.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      const testPassed = testWrite(dirPath);
      if (!testPassed) {
        allTestsPassed = false;
      }
    }
  });
  
  console.log('\n=== RESULTADO FINAL ===');
  if (allTestsPassed) {
    console.log('✅ Todas as permissões foram configuradas corretamente!');
  } else {
    console.log('⚠️ Algumas permissões podem não estar corretas. Verifique manualmente.');
    console.log('\n📋 Comandos manuais para executar como root:');
    console.log('mkdir -p /app/public/uploads/imoveis /app/public/uploads/corretores /app/public/uploads/imoveis/videos');
    console.log('chmod -R 777 /app/public/uploads');
    console.log('chown -R nextjs:nodejs /app/public/uploads');
  }
  
  console.log('\n📊 Status dos diretórios:');
  uploadDirs.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      try {
        const stats = fs.statSync(dirPath);
        const permissions = (stats.mode & parseInt('777', 8)).toString(8);
        console.log(`📁 ${dirPath}: ${permissions}`);
      } catch (error) {
        console.log(`📁 ${dirPath}: erro ao ler permissões`);
      }
    } else {
      console.log(`📁 ${dirPath}: não existe`);
    }
  });
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  initPermissions().catch(error => {
    console.error('❌ Erro durante inicialização:', error);
    process.exit(1);
  });
}

module.exports = { initPermissions };