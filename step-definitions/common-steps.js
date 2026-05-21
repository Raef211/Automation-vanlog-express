const { When } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

When('je clique sur le bouton {string}', async function (buttonText) {
  const textRegex = new RegExp(`^\\s*${escapeRegex(buttonText)}\\s*$`, 'i');

  // Try to find button in visible modal first
  const visibleModals = this.page.locator('.ant-modal');
  const modalCount = await visibleModals.count();

  if (modalCount > 0) {
    const lastModal = visibleModals.last();
    
    // Try multiple selectors in modal
    const modalSelectors = [
      () => lastModal.locator('button').filter({ hasText: textRegex }).first(),
      () => lastModal.locator('.ant-btn').filter({ hasText: textRegex }).first(),
      () => lastModal.locator('[role="button"]').filter({ hasText: textRegex }).first(),
      () => lastModal.locator('span').filter({ hasText: textRegex }).first()
    ];

    for (const selectorFn of modalSelectors) {
      const btn = selectorFn();
      try {
        await expect(btn).toBeVisible({ timeout: 3000 });
        await btn.click({ force: true });
        await this.page.waitForTimeout(800);
        return;
      } catch (e) {
        // Try next selector
      }
    }
  }

  // Try to find button on page
  const pageSelectors = [
    () => this.page.locator('button').filter({ hasText: textRegex }).first(),
    () => this.page.locator('.ant-btn').filter({ hasText: textRegex }).first(),
    () => this.page.locator('[role="button"]').filter({ hasText: textRegex }).first(),
    () => this.page.locator('span').filter({ hasText: textRegex }).first()
  ];

  for (const selectorFn of pageSelectors) {
    const btn = selectorFn();
    try {
      await expect(btn).toBeVisible({ timeout: 5000 });
      await btn.click({ force: true });
      await this.page.waitForTimeout(800);
      return;
    } catch (e) {
      // Try next selector
    }
  }

  throw new Error(`Could not find button "${buttonText}" on page or modal`);
});