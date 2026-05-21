const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

function uniqueSeed() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function selectFirstOption(page, selectorId) {
  const input = page.locator(`#${selectorId}`).first();
  await expect(input).toBeVisible({ timeout: 15000 });
  await input.click({ force: true });
  await page.waitForTimeout(600);

  const option = page.locator('.ant-select-item-option:visible').first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click({ force: true });
  await page.waitForTimeout(400);
}

async function createAccount(page, accountType, index) {
  const seed = uniqueSeed();
  const isLivreur = accountType.toLowerCase().includes('livreur') || accountType.toLowerCase().includes('transporter');
  
  // Try multiple selectors for the role button
  let roleButton;
  const roleSelectors = [
    () => page.locator('button').filter({ hasText: isLivreur ? /^\s*transporter\s*$/i : /^\s*client\s*$/i }).first(),
    () => page.locator('.ant-btn').filter({ hasText: isLivreur ? /^\s*transporter\s*$/i : /^\s*client\s*$/i }).first(),
    () => page.locator('span').filter({ hasText: isLivreur ? /^\s*transporter\s*$/i : /^\s*client\s*$/i }).first(),
    () => page.locator('[role="button"]').filter({ hasText: isLivreur ? /^\s*transporter\s*$/i : /^\s*client\s*$/i }).first()
  ];

  for (const selectorFn of roleSelectors) {
    roleButton = selectorFn();
    try {
      await expect(roleButton).toBeVisible({ timeout: 5000 });
      break;
    } catch (e) {
      // Try next selector
    }
  }

  if (!roleButton) {
    throw new Error(`Could not find role button for "${accountType}" (${isLivreur ? 'transporter' : 'client'})`);
  }

  await expect(roleButton).toBeVisible({ timeout: 10000 });
  await roleButton.click({ force: true });

  const email = `${isLivreur ? 'livreur' : 'client'}.${seed}.${index}@test-vl.com`;

  await page.fill('#firstName', isLivreur ? `Livreur${seed.slice(-4)}` : `Client${seed.slice(-4)}`);
  await page.fill('#lastName', `Automation${index}`);
  await page.fill('#companyName', isLivreur ? `Transporteur-${seed}-${index}` : `Entreprise-${seed}-${index}`);
  await page.fill('#signupEmail', email);
  await page.fill('#password', 'SecurePass123!');
  await page.fill('#confirmPassword', 'SecurePass123!');
  await page.fill('#phone', `2${seed.slice(-7)}`);
  await page.fill('#patent', seed.slice(-6));
  await page.fill('#address', `Adresse test ${seed}`);
  await page.fill('#zipCode', '1000');

  await selectFirstOption(page, 'companyTypeId');
  await selectFirstOption(page, 'companyActivityId');
  await selectFirstOption(page, 'country');
  await selectFirstOption(page, 'city');

  const signupButton = page.locator('button[type="submit"]').first();
  await expect(signupButton).toBeVisible({ timeout: 10000 });
  await signupButton.click({ force: true });
  await page.waitForTimeout(2500);

  const blockingErrors = page.locator('.ant-form-item-explain-error:visible, .ant-message-error:visible, .ant-notification-notice-error:visible');
  const errorCount = await blockingErrors.count();
  const hasSuccess = await page.locator('.ant-message-success:visible, .ant-notification-notice-success:visible').first().isVisible().catch(() => false);
  const movedFromSignup = !page.url().includes('/signup');

  expect(errorCount === 0 || hasSuccess || movedFromSignup).toBeTruthy();

  return email;
}

async function openSignupForm(page, context) {
  await context.clearCookies();
  await page.goto('https://vanlog-express.com/signup');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      // ignore
    }
  }).catch(() => {});

  if (!page.url().includes('/signup')) {
    await page.goto('https://vanlog-express.com/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
  }

  // Try multiple selectors for the client button
  let clientButton;
  const clientSelectors = [
    () => page.locator('button').filter({ hasText: /^\s*client\s*$/i }).first(),
    () => page.locator('.ant-btn').filter({ hasText: /^\s*client\s*$/i }).first(),
    () => page.locator('span').filter({ hasText: /^\s*client\s*$/i }).first(),
    () => page.locator('[role="button"]').filter({ hasText: /^\s*client\s*$/i }).first()
  ];

  for (const selectorFn of clientSelectors) {
    clientButton = selectorFn();
    try {
      await expect(clientButton).toBeVisible({ timeout: 5000 });
      break;
    } catch (e) {
      // Try next selector
    }
  }

  if (!clientButton) {
    throw new Error('Could not find client button on signup page');
  }

  await expect(clientButton).toBeVisible({ timeout: 15000 });
}

async function processAccountInAdminList(page, menuText, email, actionText) {
  const menuItem = page.locator('.ant-menu-item').filter({ hasText: menuText }).first();
  await expect(menuItem).toBeVisible({ timeout: 15000 });
  await menuItem.click({ force: true });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  const searchInput = page.locator('input[placeholder*="Chercher avec email"], input[placeholder*="email"]').first();
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await searchInput.fill(email);
  await page.waitForTimeout(2000);

  const row = page.locator('.ant-table-tbody tr').filter({ hasText: email }).first();
  await expect(row).toBeVisible({ timeout: 15000 });

  // Try multiple selectors to find the action button
  let actionButton;
  const selectors = [
    () => row.locator('button').filter({ hasText: new RegExp(`^\\s*${escapeRegex(actionText)}\\s*$`, 'i') }).first(),
    () => row.locator('.ant-btn').filter({ hasText: new RegExp(`^\\s*${escapeRegex(actionText)}\\s*$`, 'i') }).first(),
    () => row.locator('span').filter({ hasText: new RegExp(`^\\s*${escapeRegex(actionText)}\\s*$`, 'i') }).first(),
    () => row.locator('[role="button"]').filter({ hasText: new RegExp(`^\\s*${escapeRegex(actionText)}\\s*$`, 'i') }).first(),
    () => row.locator('*').filter({ hasText: new RegExp(`^\\s*${escapeRegex(actionText)}\\s*$`, 'i') }).first()
  ];

  for (const selectorFn of selectors) {
    actionButton = selectorFn();
    try {
      await expect(actionButton).toBeVisible({ timeout: 3000 });
      break;
    } catch (e) {
      // Try next selector
    }
  }

  if (!actionButton) {
    throw new Error(`Could not find action button "${actionText}" in row with email "${email}"`);
  }

  await actionButton.click({ force: true });
  await page.waitForTimeout(1500);

  const errorCount = await page.locator('.ant-message-error:visible, .ant-notification-notice-error:visible').count();
  expect(errorCount).toBe(0);
}

Given('je suis sur la page signup', async function () {
  await openSignupForm(this.page, this.context);
});

When('je crée 2 comptes {string} et 2 comptes {string}', { timeout: 8 * 60 * 1000 }, async function (firstType, secondType) {
  this.createdAccounts = {
    client: [],
    livreur: [],
  };

  const sequence = [
    { type: firstType, index: 1 },
    { type: firstType, index: 2 },
    { type: secondType, index: 1 },
    { type: secondType, index: 2 },
  ];

  for (const item of sequence) {
    await openSignupForm(this.page, this.context);

    const email = await createAccount(this.page, item.type, item.index);
    const key = item.type.toLowerCase().includes('livreur') || item.type.toLowerCase().includes('transporter')
      ? 'livreur'
      : 'client';

    this.createdAccounts[key].push(email);
  }
});

Then('les 4 comptes devraient être créés sans erreur bloquante', async function () {
  expect(this.createdAccounts).toBeTruthy();
  expect(this.createdAccounts.client.length).toBe(2);
  expect(this.createdAccounts.livreur.length).toBe(2);
});

When('je traite les comptes {string} depuis {string}', { timeout: 4 * 60 * 1000 }, async function (accountType, menuText) {
  expect(this.createdAccounts).toBeTruthy();

  const key = accountType.toLowerCase().includes('livreur') || accountType.toLowerCase().includes('transporter')
    ? 'livreur'
    : 'client';

  const [firstEmail, secondEmail] = this.createdAccounts[key];
  expect(firstEmail).toBeTruthy();
  expect(secondEmail).toBeTruthy();

  await processAccountInAdminList(this.page, menuText, firstEmail, 'Accepter');
  await processAccountInAdminList(this.page, menuText, secondEmail, 'Rejeter');
});

Then('le traitement admin des 4 comptes devrait être terminé', async function () {
  expect(this.createdAccounts).toBeTruthy();
  expect(this.createdAccounts.client.length + this.createdAccounts.livreur.length).toBe(4);
});

When('je crée un nouveau compte {string}', async function (accountType) {
  await createAccount(this.page, accountType, 1);

  this.lastCreatedAccountType = accountType;
});

Then('la création du compte devrait se terminer sans erreur bloquante', async function () {
  const blockingErrors = this.page.locator('.ant-form-item-explain-error:visible, .ant-message-error:visible, .ant-notification-notice-error:visible');
  const errorCount = await blockingErrors.count();

  const hasSuccess = await this.page.locator('.ant-message-success:visible, .ant-notification-notice-success:visible').first().isVisible().catch(() => false);
  const movedFromSignup = !this.page.url().includes('/signup');

  expect(errorCount === 0 || hasSuccess || movedFromSignup).toBeTruthy();
});

Then('je devrais voir les boutons admin {string} et {string}', async function (firstText, secondText) {
  // Try multiple selectors to find buttons
  async function findButton(page, text) {
    const selectors = [
      () => page.locator('button').filter({ hasText: new RegExp(`^\\s*${escapeRegex(text)}\\s*$`, 'i') }).first(),
      () => page.locator('.ant-btn').filter({ hasText: new RegExp(`^\\s*${escapeRegex(text)}\\s*$`, 'i') }).first(),
      () => page.locator('span').filter({ hasText: new RegExp(`^\\s*${escapeRegex(text)}\\s*$`, 'i') }).first(),
      () => page.locator('[role="button"]').filter({ hasText: new RegExp(`^\\s*${escapeRegex(text)}\\s*$`, 'i') }).first()
    ];
    for (const selectorFn of selectors) {
      const btn = selectorFn();
      try {
        await expect(btn).toBeVisible({ timeout: 3000 });
        return btn;
      } catch (e) {}
    }
    throw new Error(`Could not find button with text "${text}"`);
  }

  const firstButton = await findButton(this.page, firstText);
  const secondButton = await findButton(this.page, secondText);

  await expect(firstButton).toBeVisible({ timeout: 10000 });
  await expect(secondButton).toBeVisible({ timeout: 10000 });
});

When('je clique sur le premier bouton admin {string}', async function (buttonText) {
  // Try multiple selectors to find button
  let button;
  const selectors = [
    () => this.page.locator('button').filter({ hasText: new RegExp(`^\\s*${escapeRegex(buttonText)}\\s*$`, 'i') }).first(),
    () => this.page.locator('.ant-btn').filter({ hasText: new RegExp(`^\\s*${escapeRegex(buttonText)}\\s*$`, 'i') }).first(),
    () => this.page.locator('span').filter({ hasText: new RegExp(`^\\s*${escapeRegex(buttonText)}\\s*$`, 'i') }).first(),
    () => this.page.locator('[role="button"]').filter({ hasText: new RegExp(`^\\s*${escapeRegex(buttonText)}\\s*$`, 'i') }).first()
  ];
  for (const selectorFn of selectors) {
    button = selectorFn();
    try {
      await expect(button).toBeVisible({ timeout: 3000 });
      break;
    } catch (e) {}
  }
  if (!button) throw new Error(`Could not find button "${buttonText}"`);
  await expect(button).toBeVisible({ timeout: 10000 });
  await button.click({ force: true });
  await this.page.waitForTimeout(1200);
});

Then("l'action admin devrait se terminer sans erreur bloquante", async function () {
  const errorCount = await this.page.locator('.ant-message-error:visible, .ant-notification-notice-error:visible').count();
  expect(errorCount).toBe(0);
});
