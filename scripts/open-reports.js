#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const reportsDir = path.join(__dirname, '../reports');
const cucumberReport = path.join(reportsDir, 'cucumber-report.html');
const newmanReport = path.join(reportsDir, 'postman/newman-report.html');
const summaryFile = path.join(reportsDir, 'TEST_SUMMARY.txt');

console.log('\n📂 Ouverture des rapports de test...\n');

const openCommand = os.platform() === 'win32' 
  ? 'start' 
  : os.platform() === 'darwin' 
  ? 'open' 
  : 'xdg-open';

// Check and open reports
if (fs.existsSync(cucumberReport)) {
  console.log(`✅ Rapport Cucumber trouvé: ${cucumberReport}`);
  try {
    execSync(`${openCommand} "${cucumberReport}"`, { stdio: 'ignore' });
    console.log('   ▶️  Ouverture du navigateur...\n');
  } catch (e) {
    console.error('   ⚠️  Impossible d\'ouvrir automatiquement. Ouvrez manuellement le fichier.\n');
  }
} else {
  console.log(`❌ Rapport Cucumber non trouvé: ${cucumberReport}`);
}

if (fs.existsSync(newmanReport)) {
  console.log(`✅ Rapport Newman trouvé: ${newmanReport}`);
  try {
    setTimeout(() => {
      execSync(`${openCommand} "${newmanReport}"`, { stdio: 'ignore' });
      console.log('   ▶️  Ouverture du navigateur...\n');
    }, 2000);
  } catch (e) {
    console.error('   ⚠️  Impossible d\'ouvrir automatiquement. Ouvrez manuellement le fichier.\n');
  }
} else {
  console.log(`❌ Rapport Newman non trouvé: ${newmanReport}`);
}

if (fs.existsSync(summaryFile)) {
  console.log(`✅ Résumé des tests trouvé: ${summaryFile}`);
  console.log('   📄 Contenu du résumé:\n');
  const summary = fs.readFileSync(summaryFile, 'utf8');
  console.log(summary);
} else {
  console.log(`❌ Résumé des tests non trouvé: ${summaryFile}`);
}

console.log('\n📂 Tous les rapports disponibles dans: ' + reportsDir + '\n');
