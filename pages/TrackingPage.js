const { BasePage } = require('./BasePage');

/**
 * TrackingPage - Page de suivi des commandes VanLog Express
 * Permet de suivre l'état des livraisons et l'historique des commandes
 */
class TrackingPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://vanlog-express.com/tracking-orders';
  }

  // ============ SÉLECTEURS (basés sur l'inspection réelle du site) ============
  selectors = {
    // Titre de la page
    pageTitle: 'h3.auth-form--title',

    // Formulaire de recherche
    trackingNumberInput: '#trackingNumber',
    trackingLabel: 'label[for="trackingNumber"]',
    confirmButton: 'button[type="submit"]',
    
    // Navigation bar
    navBarItem: 'a.auth-page--menu-item',
    trackingNavLink: 'a.auth-page--menu-item[href="/tracking-orders"]',
    loginNavLink: 'a.auth-page--menu-item[href="/login"]',
    signupNavLink: 'a.auth-page--menu-item[href="/signup"]',
    activeNavItem: '.ant-menu-item-selected',

    // Messages d'erreur (Ant Design)
    validationError: '.ant-form-item-explain-error',
    formItemError: '.ant-form-item-has-error',
    toastError: '.ant-message-error, .ant-message-notice-error',

    // Langue
    languageDropdown: '.ant-dropdown-trigger',
  };

  // ============ MÉTHODES DE NAVIGATION ============

  /**
   * Naviguer vers la page de suivi
   */
  async navigate() {
    await this.navigateTo(this.url);
  }

  // ============ MÉTHODES DE RECHERCHE ============

  /**
   * Saisir un numéro de tracking
   * @param {string} trackingNumber 
   */
  async enterTrackingNumber(trackingNumber) {
    await this.fill(this.selectors.trackingNumberInput, trackingNumber);
  }

  /**
   * Effacer le champ de tracking
   */
  async clearTrackingInput() {
    await this.page.locator(this.selectors.trackingNumberInput).clear();
  }

  /**
   * Obtenir la valeur actuelle du champ de tracking
   * @returns {Promise<string>}
   */
  async getTrackingInputValue() {
    return await this.page.locator(this.selectors.trackingNumberInput).inputValue();
  }

  /**
   * Cliquer sur le bouton Confirmer
   */
  async clickConfirmButton() {
    await this.click(this.selectors.confirmButton);
  }

  /**
   * Rechercher une commande par numéro de tracking
   * @param {string} trackingNumber 
   */
  async searchOrder(trackingNumber) {
    await this.enterTrackingNumber(trackingNumber);
    await this.clickConfirmButton();
    await this.page.waitForLoadState('networkidle');
    await this.wait(1000);
  }

  // ============ MÉTHODES DE VÉRIFICATION ============

  /**
   * Vérifier que le titre de la page est visible
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    try {
      return await this.getText(this.selectors.pageTitle);
    } catch (error) {
      return '';
    }
  }

  /**
   * Vérifier que le champ de tracking est visible
   * @returns {Promise<boolean>}
   */
  async isTrackingInputVisible() {
    return await this.isVisible(this.selectors.trackingNumberInput);
  }

  /**
   * Vérifier que le label du champ est visible
   * @returns {Promise<boolean>}
   */
  async isTrackingLabelVisible() {
    return await this.isVisible(this.selectors.trackingLabel);
  }

  /**
   * Obtenir le texte du label
   * @returns {Promise<string>}
   */
  async getTrackingLabelText() {
    try {
      return await this.getText(this.selectors.trackingLabel);
    } catch (error) {
      return '';
    }
  }

  /**
   * Vérifier que le bouton Confirmer est visible
   * @returns {Promise<boolean>}
   */
  async isConfirmButtonVisible() {
    return await this.isVisible(this.selectors.confirmButton);
  }

  /**
   * Vérifier qu'une erreur de validation est affichée
   * @returns {Promise<boolean>}
   */
  async hasValidationError() {
    return await this.page.locator(this.selectors.validationError).count() > 0;
  }

  /**
   * Obtenir le texte de l'erreur de validation
   * @returns {Promise<string>}
   */
  async getValidationErrorText() {
    try {
      return await this.getText(this.selectors.validationError);
    } catch (error) {
      return '';
    }
  }

  /**
   * Vérifier qu'un élément de la barre de navigation est visible
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async isNavItemVisible(text) {
    const locator = this.page.locator(`a.auth-page--menu-item:has-text("${text}")`);
    return await locator.isVisible();
  }

  /**
   * Vérifier qu'un élément de la barre de navigation est actif (sélectionné)
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async isNavItemActive(text) {
    const menuItem = this.page.locator(`.ant-menu-item-selected:has-text("${text}")`);
    return await menuItem.count() > 0;
  }

  /**
   * Cliquer sur un élément de la barre de navigation
   * @param {string} text
   */
  async clickNavItem(text) {
    await this.page.locator(`a.auth-page--menu-item:has-text("${text}")`).click();
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { TrackingPage };
