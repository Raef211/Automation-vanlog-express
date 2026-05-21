const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(60 * 1000);

let browser;

async function ensureBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: process.env.HEADLESS === 'true',
      slowMo: process.env.SLOWMO_MS ? Number(process.env.SLOWMO_MS) : 100,
      args: ['--start-maximized'],
      timeout: 30000
    });
  }
}

Before(async function () {
  try {
    await ensureBrowser();
    this.context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    this.page = await this.context.newPage();
  } catch (error) {
    console.warn('⚠️ Browser init failed, reconnecting...', error.message);
    browser = null;
    await ensureBrowser();
    this.context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    this.page = await this.context.newPage();
  }
});

After(async function ({ result, pickle }) {
  if (result.status === 'FAILED' && this.page && !this.page.isClosed()) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = pickle.name.replace(/[^a-z0-9]/gi, '_');
    await this.page.screenshot({ path: `screenshots/${name}_${timestamp}.png` }).catch(() => {});
  }
  if (this.page && !this.page.isClosed()) {
    await this.page.close().catch(() => {});
  }
  if (this.context) {
    await this.context.close().catch(() => {});
  }
  this.page = null;
  this.context = null;
});
