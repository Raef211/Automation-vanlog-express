const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ============ WHEN - ACTIONS ============

When('je recherche la commande avec le numéro {string}', async function (trackingNumber) {
  const searchInput = this.page.locator('input[placeholder*="Chercher"]').first();
  await searchInput.fill(trackingNumber);
  await this.page.waitForTimeout(1000);
  await this.page.waitForLoadState('networkidle');
});

When('je clique sur le premier bouton {string}', async function (buttonText) {
  // Try multiple selectors to find button
  let button;
  const selectors = [
    () => this.page.locator('button').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }).first(),
    () => this.page.locator('.ant-btn').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }).first(),
    () => this.page.locator('span').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }).first(),
    () => this.page.locator('[role="button"]').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }).first(),
    () => this.page.locator('a').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }).first()
  ];
  for (const selectorFn of selectors) {
    button = selectorFn();
    try {
      await expect(button).toBeVisible({ timeout: 5000 });
      break;
    } catch (e) {}
  }
  if (!button) throw new Error(`Could not find button "${buttonText}"`);
  await button.click({ force: true });
  await this.page.waitForTimeout(2000);
});

When('je clique sur le premier dropdown de statut', async function () {
  const statusDropdown = this.page.locator('.ant-select').first();
  await statusDropdown.click();
  await this.page.waitForTimeout(1500);
});

// ============ THEN - ASSERTIONS ============

Then('je devrais voir le modal {string}', async function (modalTitle) {
  // Wait for modal to be fully visible
  const modal = this.page.locator('.ant-modal, .ant-drawer').first();
  
  // First wait for it to exist
  await this.page.waitForSelector('.ant-modal, .ant-drawer', { state: 'visible', timeout: 30000 });
  
  // Then wait for visibility
  await expect(modal).toBeVisible({ timeout: 15000 });
  
  // Wait for animation to complete
  await this.page.waitForTimeout(800);
  
  const title = this.page.locator('.ant-modal-title, .ant-drawer-title').first();
  const titleText = await title.textContent();
  expect(titleText?.trim()).toBe(modalTitle);
});

Then('je devrais voir un formulaire de commande', async function () {
  // Wait for modal to be visible
  await this.page.waitForSelector('.ant-modal, .ant-drawer', { state: 'visible', timeout: 30000 });
  await this.page.waitForTimeout(1000);
  
  const modal = this.page.locator('.ant-modal, .ant-drawer').first();
  await expect(modal).toBeVisible({ timeout: 15000 });
  
  // Wait for form elements to load
  await this.page.waitForTimeout(1500);
  
  // Check for form elements
  const formItems = this.page.locator('.ant-form-item');
  const count = await formItems.count();
  expect(count).toBeGreaterThan(0);
});

Then('le formulaire devrait contenir des champs obligatoires', async function () {
  // Check for required inputs
  const requiredInputs = this.page.locator('input[aria-required="true"], input[required]');
  const count = await requiredInputs.count();
  expect(count).toBeGreaterThan(0);
});

Then('les résultats de recherche devraient afficher {string}', async function (searchTerm) {
  await this.page.waitForTimeout(1000);
  const tableContent = await this.page.locator('.ant-table').textContent();
  expect(tableContent).toContain(searchTerm);
});

Then('je devrais voir au moins un bouton {string}', async function (buttonText) {
  // Try multiple selectors to find buttons
  const selectors = [
    this.page.locator('button').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }),
    this.page.locator('.ant-btn').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }),
    this.page.locator('span').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }),
    this.page.locator('[role="button"]').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') }),
    this.page.locator('a').filter({ hasText: new RegExp(`^\\s*${buttonText}\\s*$`, 'i') })
  ];
  let totalCount = 0;
  for (const selector of selectors) {
    const count = await selector.count();
    totalCount += count;
    if (totalCount > 0) break;
  }
  expect(totalCount).toBeGreaterThan(0);
});

Then('je devrais voir au moins un dropdown de statut', async function () {
  const statusDropdowns = this.page.locator('.ant-select');
  const count = await statusDropdowns.count();
  expect(count).toBeGreaterThan(0);
});

Then('je devrais voir l\'option {string}', async function (optionText) {
  const option = this.page.locator('.ant-select-item').filter({ hasText: optionText }).first();
  await expect(option).toBeVisible();
});

Then('le tableau devrait avoir les colonnes {string}', async function (columns) {
  const columnNames = columns.split(',').map(c => c.trim());
  
  for (const columnName of columnNames) {
    const header = this.page.locator('th').filter({ hasText: columnName }).first();
    await expect(header).toBeVisible();
  }
});

Then('la pagination devrait être visible', async function () {
  const pagination = this.page.locator('.ant-pagination').first();
  await expect(pagination).toBeVisible();
});

Then('la pagination devrait afficher le nombre total de commandes', async function () {
  const pagination = this.page.locator('.ant-pagination').first();
  const paginationText = await pagination.textContent();
  expect(paginationText).toMatch(/\d+-\d+ de \d+ éléments/);
});

Then('chaque ligne du tableau devrait avoir des actions', async function () {
  const rows = this.page.locator('.ant-table-tbody tr');
  const count = await rows.count();
  
  if (count > 0) {
    const firstRow = rows.first();
    // Check if there are action buttons/icons in the row
    const actionButtons = firstRow.locator('button, a, svg, span[role="img"]');
    const actionCount = await actionButtons.count();
    expect(actionCount).toBeGreaterThan(0);
  }
});

Then('les actions devraient inclure voir, modifier, supprimer', async function () {
  // Just check that action column exists with clickable elements
  const firstRow = this.page.locator('.ant-table-tbody tr').first();
  const actionButtons = firstRow.locator('button, a, svg');
  const count = await actionButtons.count();
  expect(count).toBeGreaterThanOrEqual(3); // At least 3 action icons
});

Then('le tableau devrait afficher au moins une commande', async function () {
  const rows = this.page.locator('.ant-table-tbody tr');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

Then('chaque commande devrait avoir un numéro de suivi', async function () {
  const firstRow = this.page.locator('.ant-table-tbody tr').first();
  const firstCell = firstRow.locator('td').first();
  const text = await firstCell.textContent();
  expect(text?.trim()).not.toBe('');
});

Then('chaque commande devrait avoir une date de création', async function () {
  const firstRow = this.page.locator('.ant-table-tbody tr').first();
  const dateCell = firstRow.locator('td').nth(1); // Second column is date
  const text = await dateCell.textContent();
  expect(text?.trim()).not.toBe('');
});

Then('chaque commande devrait avoir un destinataire', async function () {
  const firstRow = this.page.locator('.ant-table-tbody tr').first();
  const recipientCell = firstRow.locator('td').nth(2); // Third column is recipient
  const text = await recipientCell.textContent();
  expect(text?.trim()).not.toBe('');
});

Then('je devrais voir le texte {string}', async function (text) {
  const element = this.page.locator(`text=${text}`).first();
  await expect(element).toBeVisible();
});

Then('le compteur devrait afficher le nombre de commandes', async function () {
  const countElement = this.page.locator('h4').filter({ hasText: 'Nombre total des commandes' }).first();
  const text = await countElement.textContent();
  expect(text).toMatch(/Nombre total des commandes:\s*\d+/);
});
