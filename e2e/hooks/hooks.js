const { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

setDefaultTimeout(90000);

const browserConfig = {
  headless: process.env.HEADLESS === 'true',
  slowMo: process.env.SLOWMO_MS ? Number(process.env.SLOWMO_MS) : 80,
  args: [
    '--start-maximized',
    '--window-size=1920,1080',
    // Linux/CI only: GitHub Actions sets CI=true, local Windows does not need these
    ...(process.env.CI === 'true' ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] : []),
  ],
};

const contextConfig = {
  viewport: null,
  locale: 'fr-FR',
  timezoneId: 'Europe/Paris',
  acceptDownloads: true,
};

let browser;
let context;
let sharedPage;

async function ensureBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch(browserConfig);
  }
}

async function ensureSharedPage() {
  await ensureBrowser();

  if (!context || context._closed) {
    context = await browser.newContext(contextConfig);
  }

  if (!sharedPage || sharedPage.isClosed()) {
    sharedPage = await context.newPage();
  }

  await sharedPage.bringToFront().catch(() => {});
  return sharedPage;
}

BeforeAll(async function () {
  console.log('\n🚀 Démarrage du navigateur pour les tests E2E...');
  await ensureSharedPage();
});

AfterAll(async function () {
  if (context) {
    await context.close().catch(() => {});
  }

  if (browser && browser.isConnected()) {
    await browser.close();
    console.log('\n🛑 Navigateur fermé.');
  }
});

Before(async function (scenario) {
  const name = scenario.pickle.name;
  console.log(`\n📋 Scénario: ${name}`);

  this.context = context || (await ensureSharedPage()).context();
  this.page = await ensureSharedPage();
  await this.context.clearCookies().catch(() => {});
  await this.page.goto('about:blank').catch(() => {});
  await this.page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
  this.scenarioName = name.replace(/[^a-z0-9]/gi, '_');
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

  if (this.page && !this.page.isClosed()) {
    await this.page.bringToFront().catch(() => {});
  }

  console.log(status === Status.PASSED ? '✅ Scénario réussi' : `❌ Scénario ${status}`);
});
