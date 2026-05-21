const { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

setDefaultTimeout(90000);

const browserConfig = {
  headless: process.env.HEADLESS === 'true',
  slowMo: process.env.SLOWMO_MS ? Number(process.env.SLOWMO_MS) : 80,
  args: ['--start-maximized'],
};

const contextConfig = {
  viewport: { width: 1920, height: 1080 },
  locale: 'fr-FR',
  timezoneId: 'Europe/Paris',
  acceptDownloads: true,
};

let browser;

async function ensureBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch(browserConfig);
  }
}

BeforeAll(async function () {
  console.log('\n🚀 Démarrage du navigateur pour les tests E2E...');
  await ensureBrowser();
});

AfterAll(async function () {
  if (browser && browser.isConnected()) {
    await browser.close();
    console.log('\n🛑 Navigateur fermé.');
  }
});

Before(async function (scenario) {
  const name = scenario.pickle.name;
  console.log(`\n📋 Scénario: ${name}`);

  await ensureBrowser();
  this.context = await browser.newContext(contextConfig);
  this.page = await this.context.newPage();
  this.scenarioName = name.replace(/[^a-z0-9]/gi, '_');

  this.page.on('console', msg => {
    if (msg.type() === 'error') console.log('❌ Console:', msg.text());
  });
});

After(async function (scenario) {
  const status = scenario.result.status;

  if (status === Status.FAILED && this.page && !this.page.isClosed()) {
    try {
      const screenshotsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(screenshotsDir, `${this.scenarioName}_${ts}.png`);
      const buf = await this.page.screenshot({ fullPage: true });
      fs.writeFileSync(filePath, buf);

      await this.attach(buf, 'image/png').catch(() => {});
      console.log(`📸 Screenshot: ${filePath}`);
    } catch (_) {}
  }

  if (this.page && !this.page.isClosed()) await this.page.close().catch(() => {});
  if (this.context) await this.context.close().catch(() => {});

  console.log(status === Status.PASSED ? '✅ Scénario réussi' : `❌ Scénario ${status}`);
});
