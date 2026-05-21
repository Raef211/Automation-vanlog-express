const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { TrackingPage } = require('../pages/TrackingPage');

let loginPage;
let trackingPage;

// ============ GIVEN STEPS ============

Given('I am on the VanLog Express login page', async function () {
  loginPage = new LoginPage(this.page);
  trackingPage = new TrackingPage(this.page);
  await loginPage.navigate();
});

// ============ WHEN STEPS ============

When('I click on {string} in the navigation bar', async function (linkText) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  await trackingPage.clickNavItem(linkText);
  await this.page.waitForTimeout(1000);
});

// ============ THEN STEPS ============

Then('I should see the {string} button in the navigation bar', async function (buttonText) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const isVisible = await trackingPage.isNavItemVisible(buttonText);
  expect(isVisible).toBe(true);
});

Then('the {string} button should be active in the navigation bar', async function (buttonText) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const isActive = await trackingPage.isNavItemActive(buttonText);
  expect(isActive).toBe(true);
});

Then('I should be on the tracking orders page', async function () {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('tracking-orders');
});

Then('I should be on the signup page', async function () {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('signup');
});

Then('I should be on the login page', async function () {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('login');
  expect(currentUrl).not.toContain('signup');
});
