const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ============ WHEN STEPS ============

When('I open the language dropdown', async function () {
  await this.page.locator('.ant-dropdown-trigger').click();
  await this.page.waitForTimeout(1000);
  // Wait for dropdown menu to appear
  await this.page.locator('.ant-dropdown-menu').waitFor({ state: 'visible', timeout: 5000 });
});

When('I select {string} language', async function (language) {
  const menuItem = this.page.locator('.ant-dropdown-menu-item').filter({ hasText: language }).first();
  await menuItem.click();
  await this.page.waitForTimeout(2000);
  await this.page.waitForLoadState('networkidle');
});

// ============ THEN STEPS ============

Then('the language flag should show {string}', async function (expectedLang) {
  const flagAlt = await this.page.locator('.ant-dropdown-trigger img').getAttribute('alt');
  expect(flagAlt).toContain(expectedLang);
});

Then('the login button should display {string}', async function (expectedText) {
  const btnText = await this.page.locator('button[type="submit"]').textContent();
  expect(btnText.trim()).toBe(expectedText);
});

Then('the navigation bar should display {string}', async function (expectedText) {
  const navItem = this.page.locator(`a.auth-page--menu-item:has-text("${expectedText}")`);
  const isVisible = await navItem.isVisible();
  expect(isVisible).toBe(true);
});

Then('the form should have a label {string}', async function (expectedLabel) {
  const label = this.page.locator(`label:has-text("${expectedLabel}")`);
  const count = await label.count();
  expect(count).toBeGreaterThan(0);
});

Then('the {string} option should be disabled in the language dropdown', async function (language) {
  const disabledItem = this.page.locator('.ant-dropdown-menu-item-disabled').filter({ hasText: language });
  const count = await disabledItem.count();
  expect(count).toBeGreaterThan(0);
});

Then('the {string} option should be enabled in the language dropdown', async function (language) {
  const enabledItem = this.page.locator('.ant-dropdown-menu-item:not(.ant-dropdown-menu-item-disabled)').filter({ hasText: language });
  const count = await enabledItem.count();
  expect(count).toBeGreaterThan(0);
});
