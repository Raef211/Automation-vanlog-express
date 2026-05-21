/**
 * BasePage - Classe de base pour toutes les pages
 * Contient les méthodes communes partagées entre toutes les pages
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Naviguer vers une URL
   * @param {string} url 
   */
  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  /**
   * Obtenir le titre de la page
   * @returns {Promise<string>}
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Obtenir l'URL courante
   * @returns {string}
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Attendre qu'un élément soit visible
   * @param {string} selector 
   */
  async waitForElement(selector) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Cliquer sur un élément
   * @param {string} selector 
   */
  async click(selector) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.waitForTimeout(500); // Attendre la stabilité du DOM
    await locator.click({ force: true, timeout: 30000 });
  }

  /**
   * Remplir un champ de texte
   * @param {string} selector 
   * @param {string} text 
   */
  async fill(selector, text) {
    const locator = this.page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: 30000 });
    // Use locator.fill which is more reliable for scoped elements
    await locator.fill(String(text), { timeout: 30000 }).catch(async () => {
      // Fallback: set value via DOM if fill fails
      await locator.evaluate((el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(text)).catch(() => {});
    });
  }

  /**
   * Obtenir le texte d'un élément
   * @param {string} selector 
   * @returns {Promise<string>}
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Vérifier si un élément est visible
   * @param {string} selector 
   * @returns {Promise<boolean>}
   */
  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  /**
   * Prendre une capture d'écran
   * @param {string} name 
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Attendre un délai (à utiliser avec précaution)
   * @param {number} ms 
   */
  async wait(ms) {
    await this.page.waitForTimeout(ms);
  }
}

module.exports = { BasePage };
