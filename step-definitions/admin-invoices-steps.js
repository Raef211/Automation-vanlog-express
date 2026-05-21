const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

function normalize(value) {
  return (value || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

async function openUserSelector(page) {
  // Try multiple selectors to find the user selector button
  const selectors = [
    () => page.locator('button, .ant-select-selector, [role="combobox"]').filter({ hasText: /select user|sélectionner|utilisateur/i }).first(),
    () => page.locator('.ant-select-selector').first(),
    () => page.locator('[role="combobox"]').first(),
    () => page.locator('button').filter({ hasText: /sélectionner|select|utilisateur/i }).first()
  ];

  let selectUserButton;
  for (const selectorFn of selectors) {
    selectUserButton = selectorFn();
    try {
      await expect(selectUserButton).toBeVisible({ timeout: 5000 });
      break;
    } catch (e) {
      // Try next selector
    }
  }

  if (!selectUserButton) {
    throw new Error('Could not find user selector button');
  }

  await expect(selectUserButton).toBeVisible({ timeout: 15000 });
  await selectUserButton.click({ force: true });
  await page.waitForTimeout(600);
}

async function getVisibleOptions(page) {
  await page.waitForTimeout(500); // Wait for dropdown to animate in
  
  const pickerContainer = page
    .locator('.ant-modal:visible, .ant-drawer:visible, .ant-select-dropdown:visible, .ant-dropdown:visible, [role="listbox"]:visible')
    .first();

  // Wait for container to be visible
  try {
    await expect(pickerContainer).toBeVisible({ timeout: 10000 });
  } catch (e) {
    // Container might not exist, but options could be elsewhere
  }

  const optionLocators = pickerContainer.locator(
    '[role="option"], .ant-select-item-option-content, .ant-dropdown-menu-title-content, .ant-list-item, tbody tr, .table--action-btn, button, li, span'
  );

  const count = await optionLocators.count();
  const options = [];

  for (let index = 0; index < count; index++) {
    const text = (await optionLocators.nth(index).innerText().catch(() => '')).trim();
    if (text && text.length > 0) {
      options.push({ index, text });
    }
  }

  return { pickerContainer, options, optionLocators };
}

function keywordRegex(userType) {
  const type = normalize(userType);
  if (type.includes('client')) {
    return /client|provider|entreprise/i;
  }
  if (type.includes('livreur')) {
    return /livreur|transporteur|carrier|driver/i;
  }
  return new RegExp(userType, 'i');
}

Then('je devrais voir le sélecteur utilisateur Factures', async function () {
  const selector = this.page
    .locator('button, .ant-select-selector, [role="combobox"]')
    .filter({ hasText: /select user|sélectionner|utilisateur/i })
    .first();

  await expect(selector).toBeVisible({ timeout: 15000 });
});

Then('je devrais voir les types utilisateur {string} et {string} dans Factures', async function (typeA, typeB) {
  await openUserSelector(this.page);

  const { options } = await getVisibleOptions(this.page);
  const labels = options.map(option => option.text);
  const normalizedLabels = labels.map(normalize);

  const hasTypeA = normalizedLabels.some(label => keywordRegex(typeA).test(label));
  const hasTypeB = normalizedLabels.some(label => keywordRegex(typeB).test(label));

  expect(hasTypeA, `Type utilisateur "${typeA}" non trouvé. Options visibles: ${labels.join(' | ')}`).toBeTruthy();
  expect(hasTypeB, `Type utilisateur "${typeB}" non trouvé. Options visibles: ${labels.join(' | ')}`).toBeTruthy();

  await this.page.keyboard.press('Escape').catch(() => {});
});

When('je sélectionne le type utilisateur {string} dans Factures', async function (userType) {
  await openUserSelector(this.page);

  const { options, optionLocators } = await getVisibleOptions(this.page);
  const matcher = keywordRegex(userType);

  const match = options.find(option => matcher.test(normalize(option.text)));
  if (!match) {
    // Fallback: try shared helper to select option by text
    const { selectOptionByText } = require('../e2e/step-definitions/support_manual');
    const ok = await selectOptionByText(this.page, userType).catch(() => false);
    if (ok) { await this.page.waitForTimeout(500); return; }
    throw new Error(`Impossible de trouver un utilisateur de type "${userType}". Options visibles: ${options.map(item => item.text).join(' | ')}`);
  }

  await optionLocators.nth(match.index).click({ force: true });
  await this.page.waitForTimeout(500);
});

When('je renseigne la période facture du {string} au {string}', async function (fromDate, toDate) {
  const fromInput = this.page.locator('#from').first();
  const toInput = this.page.locator('#to').first();

  await expect(fromInput).toBeVisible({ timeout: 10000 });
  await expect(toInput).toBeVisible({ timeout: 10000 });

  await fromInput.fill(fromDate);
  await toInput.fill(toDate);

  await expect(fromInput).toHaveValue(fromDate);
  await expect(toInput).toHaveValue(toDate);
});

When('je génère la facture admin', async function () {
  const generateButton = this.page
    .locator('button, .invoice-form--generate-btn')
    .filter({ hasText: /générer la facture|generer la facture|generate/i })
    .first();

  await expect(generateButton).toBeVisible({ timeout: 10000 });
  await generateButton.click({ force: true });
  await this.page.waitForTimeout(1200);
});

Then("l'action facture devrait se terminer sans erreur bloquante", async function () {
  const blockingError = this.page.locator('.ant-message-error:visible, .ant-notification-notice-error:visible, .ant-form-item-explain-error:visible');
  const errorCount = await blockingError.count();

  expect(errorCount, 'Une erreur bloquante est affichée après génération de facture').toBe(0);

  const invoiceTable = this.page.locator('.ant-table, table').first();
  const generateButton = this.page
    .locator('button, .invoice-form--generate-btn')
    .filter({ hasText: /générer la facture|generer la facture|generate/i })
    .first();

  const tableVisible = await invoiceTable.isVisible().catch(() => false);
  const buttonVisible = await generateButton.isVisible().catch(() => false);

  expect(tableVisible || buttonVisible).toBeTruthy();
});
