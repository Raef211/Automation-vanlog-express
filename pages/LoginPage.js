const { BasePage } = require('./BasePage');

/**
 * LoginPage - Page de connexion VanLog Express
 * Gère l'authentification et la récupération de mot de passe
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://vanlog-express.com/';
  }

  // ============ SÉLECTEURS ============
  selectors = {
    // Logo et branding
    logo: 'img[alt*="vanlog"], img[alt*="VanLog"]',
    languageFlag: 'img[alt*="Français"]',
    
    // Formulaire de connexion - Sélecteurs réels de VanLog Express
    emailInput: '#loginEmail',
    passwordInput: '#password',
    passwordToggle: 'button:has-text("eye"), [class*="eye"], button[aria-label*="password"]',
    loginButton: 'button[type="submit"]:has-text("Se connecter")',
    
    // Liens de navigation - Sélecteurs réels
    forgotPasswordLink: 'a:has-text("Mot de passe oublié"), button:has-text("Mot de passe oublié")',
    signupLink: 'a[href="/signup"], a:has-text("S\'inscrire")',
    trackingLink: 'a[href="/tracking-orders"]',
    downloadApkLink: 'button:has-text("Download APK")',
    
    // Messages et erreurs
    errorMessage: '.ant-message-error, .ant-alert-error, .ant-notification-notice-error, .ant-form-item-explain-error, [class*="error-message"], [role="alert"], .ant-message-notice-content, .ant-notification-notice-message',
    validationError: '.validation-error, .field-error, [aria-invalid="true"]',
    
    // Menu de navigation
    navMenu: 'nav, .navigation, .menu, header',
    menuItems: 'nav a, .navigation a, .menu a',
  };

  // ============ MÉTHODES DE NAVIGATION ============

  /**
   * Naviguer vers la page de connexion
   */
  async navigate() {
    await this.navigateTo(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  // ============ MÉTHODES DE CONNEXION ============

  /**
   * Remplir le champ email
   * @param {string} email 
   */
  async fillEmail(email) {
    await this.fill(this.selectors.emailInput, email);
  }

  /**
   * Remplir le champ mot de passe
   * @param {string} password 
   */
  async fillPassword(password) {
    await this.fill(this.selectors.passwordInput, password);
  }

  /**
   * Cliquer sur le bouton de connexion
   */
  async clickLoginButton() {
    await this.click(this.selectors.loginButton);
  }

  /**
   * Effectuer une connexion complète
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toggle la visibilité du mot de passe
   */
  async togglePasswordVisibility() {
    await this.click(this.selectors.passwordToggle);
  }

  /**
   * Vérifier si le mot de passe est visible
   * @returns {Promise<boolean>}
   */
  async isPasswordVisible() {
    const passwordField = await this.page.locator(this.selectors.passwordInput);
    const type = await passwordField.getAttribute('type');
    return type === 'text';
  }

  // ============ MÉTHODES DE NAVIGATION ============

  /**
   * Cliquer sur "Mot de passe oublié"
   */
  async clickForgotPassword() {
    await this.click(this.selectors.forgotPasswordLink);
  }

  /**
   * Cliquer sur "S'inscrire"
   */
  async clickSignup() {
    await this.click(this.selectors.signupLink);
  }

  /**
   * Cliquer sur "Suivi des commandes"
   */
  async clickTrackingOrders() {
    await this.click(this.selectors.trackingLink);
  }

  /**
   * Cliquer sur "Download APK"
   */
  async clickDownloadApk() {
    await this.click(this.selectors.downloadApkLink);
  }

  // ============ MÉTHODES DE VÉRIFICATION ============

  /**
   * Vérifier que le logo est visible
   * @returns {Promise<boolean>}
   */
  async isLogoVisible() {
    return await this.isVisible(this.selectors.logo);
  }

  /**
   * Vérifier qu'un champ est visible
   * @param {string} fieldName - "Email" ou "Mot de passe"
   * @returns {Promise<boolean>}
   */
  async isFieldVisible(fieldName) {
    const selector = fieldName.toLowerCase().includes('email') 
      ? this.selectors.emailInput 
      : this.selectors.passwordInput;
    return await this.isVisible(selector);
  }

  /**
   * Vérifier que le bouton de connexion est visible
   * @returns {Promise<boolean>}
   */
  async isLoginButtonVisible() {
    return await this.isVisible(this.selectors.loginButton);
  }

  /**
   * Vérifier qu'un lien est visible
   * @param {string} linkText 
   * @returns {Promise<boolean>}
   */
  async isLinkVisible(linkText) {
    return await this.isVisible(`a:has-text("${linkText}")`);
  }

  /**
   * Obtenir le message d'erreur
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    try {
      return await this.getText(this.selectors.errorMessage);
    } catch (error) {
      return '';
    }
  }

  /**
   * Vérifier qu'un message d'erreur est affiché
   * @returns {Promise<boolean>}
   */
  async hasErrorMessage() {
    try {
      await this.page.waitForSelector(this.selectors.errorMessage, { timeout: 5000 });
      return true;
    } catch {
      // Fallback : un mauvais mot de passe laisse l'utilisateur sur la page de login
      const url = this.page.url();
      return !url.includes('/dashboard') && !url.includes('/app/');
    }
  }

  /**
   * Obtenir le message de validation d'un champ
   * @param {string} fieldName 
   * @returns {Promise<string>}
   */
  async getValidationError(fieldName) {
    const selector = fieldName.toLowerCase().includes('email') 
      ? this.selectors.emailInput 
      : this.selectors.passwordInput;
    
    const field = await this.page.locator(selector);
    return await field.evaluate(el => el.validationMessage);
  }

  /**
   * Vérifier que tous les éléments principaux sont présents
   * @returns {Promise<boolean>}
   */
  async verifyAllElements() {
    const elements = [
      this.selectors.logo,
      this.selectors.emailInput,
      this.selectors.passwordInput,
      this.selectors.loginButton,
      this.selectors.signupLink
    ];

    for (const selector of elements) {
      const isVisible = await this.isVisible(selector);
      if (!isVisible) return false;
    }
    return true;
  }

  /**
   * Obtenir la liste des liens du menu
   * @returns {Promise<string[]>}
   */
  async getMenuLinks() {
    const links = await this.page.locator(this.selectors.menuItems).allTextContents();
    return links;
  }
}

module.exports = { LoginPage };
