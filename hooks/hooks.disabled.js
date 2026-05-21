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
  // create directories omitted
});

Before(async function (scenario) {
  scenarioCount++;
  const scenarioName = scenario.pickle.name;
  const apiOnly = isApiScenario(scenario);

  this.isApiScenario = apiOnly;
  this.context = undefined;
  this.page = undefined;

  if (apiOnly) return;

  await ensureBrowser();
  this.context = await browser.newContext(contextConfig);
  this.page = await this.context.newPage();
  this.scenarioName = scenarioName.replace(/[^a-z0-9]/gi, '_');
});

After(async function (scenario) {
  // simplified cleanup in disabled hooks
  if (this.page && !this.page.isClosed()) {
    try { await this.page.close(); } catch (e) {}
  }
  if (this.context) {
    try { await this.context.close(); } catch (e) {}
  }
});
