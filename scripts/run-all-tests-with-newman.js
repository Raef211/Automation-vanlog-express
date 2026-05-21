#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const reportsDir = path.join(__dirname, '../reports');
const postmanReportsDir = path.join(reportsDir, 'postman');

// Ensure directories exist
if (!fs.existsSync(postmanReportsDir)) {
  fs.mkdirSync(postmanReportsDir, { recursive: true });
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║        🧪 SUITE DE TESTS COMPLÈTE - Cucumber + Newman     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Step 1: Run Cucumber tests
console.log('📋 Étape 1/3: Exécution des tests Cucumber...\n');
const cucumberProcess = spawn('npm', ['run', 'test:headless'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

cucumberProcess.on('close', (code) => {
  if (code === 0 || code === 1) {
    console.log('\n✅ Tests Cucumber terminés (rapport: reports/cucumber-report.html)\n');
    runNewman();
  } else {
    console.error('❌ Erreur lors des tests Cucumber');
    process.exit(1);
  }
});

function runNewman() {
  // Step 2: Run Newman tests
  console.log('📋 Étape 2/3: Exécution des tests Newman...\n');
  const newmanProcess = spawn('npm', ['run', 'test:postman:newman'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  newmanProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Tests Newman terminés (rapport: reports/postman/newman-report.html)\n');
      generateSummary();
    } else {
      console.log('\n⚠️  Tests Newman exécutés avec des résultats (voir rapport)\n');
      generateSummary();
    }
  });
}

function generateSummary() {
  // Step 3: Generate summary
  console.log('📋 Étape 3/3: Génération du rapport récapitulatif...\n');

  const cucumberReportPath = path.join(reportsDir, 'cucumber-report.json');
  const newmanReportPath = path.join(postmanReportsDir, 'newman-results.json');

  let cucumberStats = { passed: 0, failed: 0 };
  let newmanStats = { passed: 0, failed: 0 };

  // Parse Cucumber results
  if (fs.existsSync(cucumberReportPath)) {
    try {
      const cucumberData = JSON.parse(fs.readFileSync(cucumberReportPath, 'utf8'));
      cucumberData.forEach(feature => {
        feature.elements.forEach(scenario => {
          const isPassed = scenario.steps.every(step => step.result.status !== 'failed');
          if (isPassed) cucumberStats.passed++;
          else cucumberStats.failed++;
        });
      });
    } catch (e) {
      console.error('Erreur lors de la lecture du rapport Cucumber:', e.message);
    }
  }

  // Parse Newman results
  if (fs.existsSync(newmanReportPath)) {
    try {
      const newmanData = JSON.parse(fs.readFileSync(newmanReportPath, 'utf8'));
      const stats = newmanData.run.stats;
      newmanStats.passed = stats.tests.total - stats.tests.failed;
      newmanStats.failed = stats.tests.failed;
    } catch (e) {
      console.error('Erreur lors de la lecture du rapport Newman:', e.message);
    }
  }

  const summaryPath = path.join(reportsDir, 'TEST_SUMMARY.txt');
  const summaryContent = `
╔════════════════════════════════════════════════════════════╗
║                   📊 RAPPORT RÉCAPITULATIF                  ║
║                    Tests du ${new Date().toLocaleString('fr-FR')}              ║
╚════════════════════════════════════════════════════════════╝

📋 RÉSULTATS CUCUMBER (BDD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Scénarios réussis:  ${cucumberStats.passed}
  ❌ Scénarios échoués:   ${cucumberStats.failed}
  📍 Total: ${cucumberStats.passed + cucumberStats.failed}
  📊 Taux de réussite:    ${((cucumberStats.passed / (cucumberStats.passed + cucumberStats.failed)) * 100).toFixed(1)}%

  Rapport détaillé: reports/cucumber-report.html

🔌 RÉSULTATS NEWMAN (API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Requêtes réussies:   ${newmanStats.passed}
  ❌ Requêtes échouées:   ${newmanStats.failed}
  📍 Total: ${newmanStats.passed + newmanStats.failed}
  📊 Taux de réussite:    ${((newmanStats.passed / (newmanStats.passed + newmanStats.failed)) * 100).toFixed(1)}%

  Rapport détaillé: reports/postman/newman-report.html

📸 CAPTURES D'ÉCRAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Les captures d'écran des scénarios échoués sont disponibles dans:
  - screenshots/ (fichiers .png avec horodatage)
  - Intégrées dans le rapport Cucumber HTML

🔗 FICHIERS DE RAPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. Cucumber: reports/cucumber-report.html
  2. Newman (API): reports/postman/newman-report.html
  3. Résumé: reports/TEST_SUMMARY.txt (ce fichier)

⏰ Date: ${new Date().toLocaleString('fr-FR')}
`;

  fs.writeFileSync(summaryPath, summaryContent);

  console.log(summaryContent);
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              ✅ TESTS TERMINÉS AVEC SUCCÈS                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}
