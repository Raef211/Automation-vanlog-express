const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

const ADMIN_EMAIL = 'support@vanlog-express.com';
const ADMIN_PASSWORD = 'y8JzyLZ5Utcw7Q+n(CnQ';

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

async function clickFirstVisible(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.count()) {
      try {
        await locator.click({ force: true });
        return true;
      } catch (_) {
        // Try next selector.
      }
    }
  }
  return false;
}

async function fillFirstVisible(page, selectors, value) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.count()) {
      try {
        await locator.fill(value);
        return true;
      } catch (_) {
        // Try next selector.
      }
    }
  }
  return false;
}

When('je récupère le numéro de suivi de la commande créée', async function () {
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1500);

  const rowLocator = this.page
    .locator('.ant-table-tbody tr:not(.ant-table-measure-row)')
    .first();

  const hasRows = await rowLocator.count();
  expect(hasRows).toBeGreaterThan(0);

  let trackingNumber = null;

  const firstRowText = (await rowLocator.innerText()).trim();
  const firstMatch = firstRowText.match(/\b[A-Z]\d{1,3}[A-Z]{1,3}\d{3,10}\b/);
  if (firstMatch) {
    trackingNumber = firstMatch[0];
  }

  if (!trackingNumber) {
    const allCellTexts = await this.page.locator('.ant-table-tbody tr td').allTextContents();
    for (const cellText of allCellTexts) {
      const match = String(cellText).match(/\b[A-Z]\d{1,3}[A-Z]{1,3}\d{3,10}\b/);
      if (match) {
        trackingNumber = match[0];
        break;
      }
    }
  }

  expect(trackingNumber).toBeTruthy();
  this.createdTrackingNumber = trackingNumber;
});

When('je me reconnecte en admin pour gérer la commande', async function () {
  await this.page.goto('https://vanlog-express.com/', { waitUntil: 'domcontentloaded' });

  await fillFirstVisible(this.page, ['#loginEmail', 'input[name="email"]'], ADMIN_EMAIL);
  await fillFirstVisible(this.page, ['#password', 'input[type="password"]'], ADMIN_PASSWORD);

  const loggedIn = await clickFirstVisible(this.page, [
    'button[type="submit"]:has-text("Se connecter")',
    'button[type="submit"]'
  ]);

  expect(loggedIn).toBeTruthy();

  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

When('je vais vers la liste des commandes admin', async function () {
  const clicked = await clickFirstVisible(this.page, [
    '.ant-menu-item:has-text("Liste des commandes")',
    '.ant-menu-item:has-text("commandes")',
    'a[href*="/admin/orders"]',
    'a[href*="/orders"]'
  ]);

  if (!clicked) {
    await this.page.goto('https://vanlog-express.com/admin/orders', { waitUntil: 'networkidle' });
  }

  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(1200);
});

When('je filtre la commande créée par numéro de suivi', async function () {
  expect(this.createdTrackingNumber).toBeTruthy();

  const filled = await fillFirstVisible(this.page, [
    'input[placeholder*="suivi" i]',
    'input[placeholder*="Chercher" i]',
    'input[type="search"]',
    '.ant-input'
  ], this.createdTrackingNumber);

  expect(filled).toBeTruthy();

  await this.page.keyboard.press('Enter');
  await this.page.waitForTimeout(1200);

  const row = this.page
    .locator('.ant-table-tbody tr:not(.ant-table-measure-row)')
    .filter({ hasText: this.createdTrackingNumber })
    .first();

  expect(await row.count()).toBeGreaterThan(0);
});

When('je passe le statut de la commande filtrée à {string}', async function (targetStatus) {
  expect(this.createdTrackingNumber).toBeTruthy();

  const row = this.page
    .locator('.ant-table-tbody tr:not(.ant-table-measure-row)')
    .filter({ hasText: this.createdTrackingNumber })
    .first();

  expect(await row.count()).toBeGreaterThan(0);

  const opened = await clickFirstVisible(this.page, [
    `.ant-table-tbody tr:has-text("${this.createdTrackingNumber}") .ant-select-selector`,
    `.ant-table-tbody tr:has-text("${this.createdTrackingNumber}") [class*="status"]`,
    `.ant-table-tbody tr:has-text("${this.createdTrackingNumber}") .ant-tag`
  ]);

  expect(opened).toBeTruthy();

  const option = this.page
    .locator('.ant-select-item-option, [role="option"], li')
    .filter({ hasText: targetStatus })
    .first();

  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click({ force: true });

  await this.page.waitForTimeout(1200);
  this.finalStatus = targetStatus;
});

Then('la commande filtrée doit afficher le statut {string}', async function (expectedStatus) {
  expect(this.createdTrackingNumber).toBeTruthy();

  const rowText = await this.page
    .locator('.ant-table-tbody tr:not(.ant-table-measure-row)')
    .filter({ hasText: this.createdTrackingNumber })
    .first()
    .innerText();

  const normalizedRow = normalizeText(rowText);
  const normalizedExpected = normalizeText(expectedStatus);

  expect(normalizedRow.includes(normalizedExpected)).toBeTruthy();
});

When('je vais vers la page de suivi public', async function () {
  await this.page.goto('https://vanlog-express.com/tracking-orders', { waitUntil: 'networkidle' });
  await this.page.waitForTimeout(1000);
});

When('je recherche le numéro de suivi créé', async function () {
  expect(this.createdTrackingNumber).toBeTruthy();

  const filled = await fillFirstVisible(this.page, [
    'input[placeholder*="suivi" i]',
    'input[placeholder*="tracking" i]',
    '#trackingNumber',
    'input[type="text"]'
  ], this.createdTrackingNumber);

  expect(filled).toBeTruthy();

  const submitted = await clickFirstVisible(this.page, [
    'button:has-text("Confirmer")',
    'button:has-text("Rechercher")',
    'button:has-text("Valider")',
    'button[type="submit"]'
  ]);

  expect(submitted).toBeTruthy();
  await this.page.waitForTimeout(1500);
});

Then('le suivi public doit afficher le statut {string}', async function (expectedStatus) {
  const normalizedExpected = normalizeText(expectedStatus);

  const allTexts = await this.page
    .locator('body *')
    .evaluateAll((elements) => elements
      .map((el) => (el && el.textContent ? el.textContent.trim() : ''))
      .filter((text) => text.length > 0)
    );

  const matched = allTexts.some((text) => normalizeText(text).includes(normalizedExpected));
  expect(matched).toBeTruthy();
});
