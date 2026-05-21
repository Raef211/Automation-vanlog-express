const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const browserConfig = {
  headless: process.env.HEADLESS === 'true',
  slowMo: process.env.SLOWMO_MS ? Number(process.env.SLOWMO_MS) : 100,
  args: ['--start-maximized'],
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
  
  // Créer les dossiers nécessaires
  // createDirectories();

  console.log('✅ Préparation des dossiers terminée');
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
          // simple screenshot logic omitted for brevity
          // await takeScreenshot(this.page, this.scenarioName, 'failed', errorMessage);
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
