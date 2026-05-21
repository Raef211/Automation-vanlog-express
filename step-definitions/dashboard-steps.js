const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { DashboardPage } = require('../pages/DashboardPage');
const { LoginPage } = require('../pages/LoginPage');

// ============ GIVEN - PRECONDITIONS ============

Given('je suis sur la page de connexion', async function () {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.navigate();
});

// ============ WHEN - ACTIONS ============

When('je me connecte avec le compte admin', async function () {
  this.loginPage = new LoginPage(this.page);
  this.dashboardPage = new DashboardPage(this.page);
  
  // Admin credentials from inspection
  await this.loginPage.fillEmail('support@vanlog-express.com');
  await this.loginPage.fillPassword('y8JzyLZ5Utcw7Q+n(CnQ');
  await this.loginPage.clickLoginButton();
  
  // Wait for navigation to dashboard
  try {
    await this.page.waitForURL(url => url.includes('/admin/dashboard') || url.includes('/admin'), { timeout: 30000 });
  } catch (e) {
    // If URL wait fails, wait longer and check manually
    await this.page.waitForLoadState('networkidle');
  }
  
  await this.page.waitForTimeout(2000);
});

When('je clique sur le menu item {string}', async function (menuText) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  await this.dashboardPage.clickMenuItem(menuText);
});

// ============ THEN - ASSERTIONS ============

Then('je devrais être redirigé vers le dashboard', async function () {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const url = this.dashboardPage.getCurrentUrl();
  expect(url).toContain('/admin/dashboard');
});

Then('je devrais voir le menu item {string}', async function (menuText) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const isVisible = await this.dashboardPage.isMenuItemVisible(menuText);
  expect(isVisible).toBeTruthy();
});

Then('le menu item {string} devrait être sélectionné', async function (menuText) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const isSelected = await this.dashboardPage.isMenuItemSelected(menuText);
  expect(isSelected).toBeTruthy();
});

Then("l'URL devrait contenir {string}", async function (urlPart) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const url = this.dashboardPage.getCurrentUrl();
  expect(url).toContain(urlPart);
});

Then('le titre de la page devrait être {string}', async function (expectedTitle) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const pageTitle = await this.dashboardPage.getPageTitle();
  expect(pageTitle).toBe(expectedTitle);
});

Then('je devrais voir le titre {string}', async function (titleText) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const hasHeading = await this.dashboardPage.hasHeading(titleText);
  expect(hasHeading).toBeTruthy();
});

Then('je devrais voir la carte {string}', async function (cardTitle) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const hasCard = await this.dashboardPage.hasCard(cardTitle);
  expect(hasCard).toBeTruthy();
});

Then('je devrais voir le profil utilisateur {string}', async function (userName) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const profileName = await this.dashboardPage.getUserProfile();
  expect(profileName).toBe(userName);
});

Then('je devrais voir le bouton {string}', async function (buttonText) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const hasButton = await this.dashboardPage.hasButton(buttonText);
  expect(hasButton).toBeTruthy();
});

Then('je devrais voir le champ de recherche avec placeholder {string}', async function (placeholder) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const hasSearch = await this.dashboardPage.hasSearchInput(placeholder);
  expect(hasSearch).toBeTruthy();
});

Then('je devrais voir un tableau avec les colonnes {string}', async function (columns) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const hasTable = await this.dashboardPage.hasTable();
  expect(hasTable).toBeTruthy();
  
  const hasColumns = await this.dashboardPage.hasTableColumns(columns);
  expect(hasColumns).toBeTruthy();
});

Then('je devrais voir le champ {string}', async function (fieldText) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  // Check if it's searching by ID (for "Date de début" and "Date de fin")
  if (fieldText === 'Date de début') {
    const hasField = await this.dashboardPage.hasField('from');
    expect(hasField).toBeTruthy();
  } else if (fieldText === 'Date de fin') {
    const hasField = await this.dashboardPage.hasField('to');
    expect(hasField).toBeTruthy();
  } else {
    // Generic heading check
    const hasHeading = await this.dashboardPage.hasHeading(fieldText);
    expect(hasHeading).toBeTruthy();
  }
});

Then('je devrais voir le champ avec id {string}', async function (fieldId) {
  if (!this.dashboardPage) {
    this.dashboardPage = new DashboardPage(this.page);
  }
  
  const hasField = await this.dashboardPage.hasField(fieldId);
  expect(hasField).toBeTruthy();
});
