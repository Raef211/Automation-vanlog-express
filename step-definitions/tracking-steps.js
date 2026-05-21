const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { TrackingPage } = require('../pages/TrackingPage');
const { LoginPage } = require('../pages/LoginPage');

let trackingPage;
let loginPage;

// ============ GIVEN STEPS ============

Given('I am on the tracking orders page', async function () {
  trackingPage = new TrackingPage(this.page);
  await trackingPage.navigate();
  await this.page.waitForTimeout(1000);
});

// ============ WHEN STEPS ============

When('I click the {string} button without entering a tracking number', async function (buttonText) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  await trackingPage.clickConfirmButton();
  await this.page.waitForTimeout(1000);
});

When('I enter the tracking number {string}', async function (trackingNumber) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  await trackingPage.enterTrackingNumber(trackingNumber);
  await this.page.waitForTimeout(500);
});

When('I click the {string} button', async function (buttonText) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  await trackingPage.clickConfirmButton();
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(2000);
});

When('I clear the tracking number input', async function () {
  trackingPage = trackingPage || new TrackingPage(this.page);
  await trackingPage.clearTrackingInput();
  await this.page.waitForTimeout(500);
});

// ============ THEN STEPS ============

Then('I should see the title {string}', async function (expectedTitle) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const title = await trackingPage.getPageTitle();
  expect(title).toContain(expectedTitle);
});

Then('I should see the tracking number input field', async function () {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const isVisible = await trackingPage.isTrackingInputVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the label {string}', async function (expectedLabel) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const labelText = await trackingPage.getTrackingLabelText();
  expect(labelText).toContain(expectedLabel);
});

Then('I should see the {string} submit button', async function (buttonText) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const isVisible = await trackingPage.isConfirmButtonVisible();
  expect(isVisible).toBe(true);
  // Also verify the button text
  const btnText = await this.page.locator('button[type="submit"]').textContent();
  expect(btnText).toContain(buttonText);
});

Then('I should see the validation error {string}', async function (expectedError) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const hasError = await trackingPage.hasValidationError();
  expect(hasError).toBe(true);
  const errorText = await trackingPage.getValidationErrorText();
  expect(errorText).toContain(expectedError);
});

Then('the tracking form should be submitted', async function () {
  // The form is submitted — no client-side error should be present
  trackingPage = trackingPage || new TrackingPage(this.page);
  // Verify that we don't have the "Champs requis" validation error
  const hasRequiredError = await this.page.locator('.ant-form-item-explain-error:has-text("Champs requis")').count();
  expect(hasRequiredError).toBe(0);
});

Then('I should stay on the tracking page', async function () {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('tracking');
});

Then('the tracking number input should contain {string}', async function (expectedValue) {
  trackingPage = trackingPage || new TrackingPage(this.page);
  const value = await trackingPage.getTrackingInputValue();
  expect(value).toBe(expectedValue);
});
