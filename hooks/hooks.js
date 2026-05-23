const { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout, AttachmentRegistry } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ============================================
// CONFIGURATION
// ============================================

const browserConfig = {
  headless: process.env.HEADLESS === 'true',
  slowMo: process.env.SLOWMO_MS ? Number(process.env.SLOWMO_MS) : 100,
  args: [
    '--start-maximized',
    // Linux/CI only: GitHub Actions sets CI=true, local Windows does not need these
    ...(process.env.CI === 'true' ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] : []),
  ],
};

const contextConfig = {
  viewport: { width: 1920, height: 1080 },
  locale: 'fr-FR',
  timezoneId: 'Europe/Paris',
  acceptDownloads: true,
  recordVideo: process.env.RECORD_VIDEO ? { dir: 'videos/' } : undefined,
};

let browser;
let scenarioCount = 0;

function isApiScenario(scenario) {
  const tags = scenario?.pickle?.tags || [];
  return tags.some(tag => tag.name === '@api');
}

function isTechnicalClosedError(message) {
  const text = String(message || '').toLowerCase();
  return (
    text.includes('browser has been closed') ||
    text.includes('context has been closed') ||
    text.includes('target page, context or browser has been closed') ||
    text.includes('page has been closed')
  );
}

async function ensureBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch(browserConfig);
  }
}

BeforeAll(async function () {
  console.log('🚀 Lancement du navigateur Chromium...');
  console.log('✅ Préparation des dossiers terminée');
});

AfterAll(async function () {
  if (browser && browser.isConnected()) {
    await browser.close();
    console.log('🛑 Navigateur principal fermé.');
  }

  // Playwright leaves open handles that prevent Node from exiting naturally.
  // unref() means the timer won't block exit if Node finishes on its own first;
  // if it's still alive after 5s (hanging), this forces a clean exit.
  setTimeout(() => process.exit(0), 5000).unref();

  if (process.env.CI !== 'true') {
    try {
      console.log('\n📊 Génération du rapport Allure...');
      execSync('npx allure generate allure-results --clean -o allure-report', { stdio: 'inherit' });
      console.log('✅ Rapport Allure généré dans allure-report/');
      console.log('🌐 Ouverture du rapport Allure dans le navigateur...');
      spawn('npx allure open allure-report', {
        detached: true,
        stdio: 'ignore',
        shell: true,
      }).unref();
    } catch (error) {
      console.log(`⚠️  Rapport Allure non généré: ${error.message}`);
      console.log('💡 Lancez manuellement: npm run allure:generate && npm run allure:open');
    }
  }
});

Before(async function (scenario) {
  scenarioCount++;
  const scenarioName = scenario.pickle.name;
  const apiOnly = isApiScenario(scenario);
  console.log(`\n📝 Scénario ${scenarioCount}: ${scenarioName}`);
  console.log(apiOnly ? '🔄 Mode API (sans navigateur)' : '🔄 Création du contexte et de la page...');

  this.isApiScenario = apiOnly;
  this.context = undefined;
  this.page = undefined;

  if (apiOnly) {
    return;
  }

  // S'assurer que le navigateur est toujours actif
  await ensureBrowser();
  
  // Créer un nouveau contexte avec isolation complète
  try {
    this.context = await browser.newContext(contextConfig);
  } catch (error) {
    const browserClosedError = error.message.includes('browser has been closed') ||
                               error.message.includes('Target page, context or browser has been closed');

    if (!browserClosedError) {
      throw error;
    }

    console.log('⚠️  Navigateur fermé détecté, relancement...');
    await ensureBrowser();
    this.context = await browser.newContext(contextConfig);
  }
  
  // Créer une nouvelle page
  this.page = await this.context.newPage();
  
  // Stocker le nom du scénario pour les captures d'écran
  this.scenarioName = scenarioName.replace(/[^a-z0-9]/gi, '_');
  
  // Configurer les logs de console du navigateur
  this.page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // Configurer les logs d'erreurs de page
  this.page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  console.log('✅ Contexte et page créés');
});

After(async function (scenario) {
  const scenarioStatus = scenario.result.status;
  const scenarioName = scenario.pickle.name;
  const apiOnly = this.isApiScenario === true;
  
  if (scenarioStatus === Status.FAILED) {
    console.log(`❌ Scénario échoué: ${scenarioName}`);
    const errorMessage = scenario.result.message || '';
    const isTechnicalFailure = isTechnicalClosedError(errorMessage);
    
    if (this.page && !isTechnicalFailure) {
      try {
        const isPageOpen = !this.page.isClosed();
        if (isPageOpen) {
          // Créer le dossier screenshots s'il n'existe pas
          const screenshotsDir = path.join(__dirname, '../screenshots');
          if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
          }
          
          // Générer le nom du fichier avec timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const safeScenarioName = this.scenarioName.substring(0, 100);
          const screenshotPath = path.join(screenshotsDir, `${safeScenarioName}_failed_${timestamp}.png`);
          
          // Prendre la capture d'écran
          const screenshotBuffer = await this.page.screenshot({ fullPage: true });
          fs.writeFileSync(screenshotPath, screenshotBuffer);
          console.log(`📸 Screenshot capturé: ${screenshotPath}`);
          
          // Attacher la capture d'écran au rapport Cucumber
          try {
            await this.attach(screenshotBuffer, 'image/png');
            console.log('✅ Screenshot ajouté au rapport');
          } catch (attachError) {
            console.log(`⚠️  Impossible d'ajouter le screenshot au rapport: ${attachError.message}`);
          }
        }
      } catch (error) {
        if (!error.message.includes('closed')) {
          console.log(`⚠️  Screenshot non disponible: ${error.message}`);
        }
      }
    }
  } else if (scenarioStatus === Status.PASSED) {
    console.log(`✅ Scénario réussi: ${scenarioName}`);
  } else {
    console.log(`⚠️  Scénario ${scenarioStatus}: ${scenarioName}`);
  }
  
  if (!apiOnly && this.page && !this.page.isClosed()) {
    try {
      await this.page.close();
      console.log('🗑️  Page fermée');
    } catch (error) {}
  }
  
  if (!apiOnly && this.context) {
    try {
      await this.context.close();
      console.log('🗑️  Contexte fermé');
    } catch (error) {}
  }
});

module.exports = { Before, After, BeforeAll, AfterAll };
