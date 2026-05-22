const { BasePage } = require('./BasePage');

/**
 * SignupPage - Page d'inscription VanLog Express
 * Gère la création de nouveaux comptes utilisateurs
 */
class SignupPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = 'https://vanlog-express.com/signup';
  }

  // ============ SÉLECTEURS ============
  selectors = {
    // Formulaire d'inscription - Sélecteurs réels de VanLog Express
    firstNameInput: '#firstName',
    lastNameInput: '#lastName',
    emailInput: '#signupEmail',
    phoneInput: '#phone',
    passwordInput: '#password',
    confirmPasswordInput: '#confirmPassword',
    
    // Indicateurs
    passwordStrengthIndicator: '.password-strength, [class*="strength"], [aria-label*="force"]',
    passwordStrengthWeak: '[class*="weak"], [class*="faible"]',
    passwordStrengthStrong: '[class*="strong"], [class*="fort"]',
    
    // Cases à cocher - Le site VanLog n'a pas de checkbox terms
    termsCheckbox: '.ant-checkbox, input[type="checkbox"]',
    newsletterCheckbox: 'input[type="checkbox"][name*="newsletter"]',
    
    // Boutons
    submitButton: 'button[type="submit"]',
    loginLink: 'a:has-text("Se connecter"), a:has-text("connexion")',
    
    // Messages
    successMessage: '.ant-message-success, .ant-notification-notice, [class*="success"], [role="status"]',
    errorMessage: '.ant-message-error, .ant-form-item-explain-error, .error, .error-message, [class*="alert-error"]',
    validationError: '.ant-form-item-explain-error, .ant-form-item-has-error, [aria-invalid="true"]',
    emailExistsError: '.ant-message-error, :has-text("email est déjà utilisé"), :has-text("already exists"), :has-text("existe déjà")',
    passwordMismatchError: '.ant-form-item-explain-error:has-text("ne correspondent pas"), .ant-form-item-explain-error:has-text("don\'t match"), .ant-form-item-explain-error',
    
    // Formulaire
    signupForm: 'form, .signup-form, [class*="register"], [class*="auth-form"]',
  };

  // ============ MÉTHODES DE NAVIGATION ============

  /**
   * Naviguer vers la page d'inscription
   */
  async navigate() {
    await this.navigateTo(this.url);
  }

  // ============ MÉTHODES DE REMPLISSAGE ============

  /**
   * Remplir le champ prénom
   * @param {string} firstName 
   */
  async fillFirstName(firstName) {
    await this.fill(this.selectors.firstNameInput, firstName);
  }

  /**
   * Remplir le champ nom
   * @param {string} lastName 
   */
  async fillLastName(lastName) {
    await this.fill(this.selectors.lastNameInput, lastName);
  }

  /**
   * Remplir le champ email
   * @param {string} email 
   */
  async fillEmail(email) {
    await this.fill(this.selectors.emailInput, email);
  }

  /**
   * Remplir le champ téléphone
   * @param {string} phone 
   */
  async fillPhone(phone) {
    await this.fill(this.selectors.phoneInput, phone);
  }

  /**
   * Remplir le champ mot de passe
   * @param {string} password 
   */
  async fillPassword(password) {
    await this.fill(this.selectors.passwordInput, password);
  }

  /**
   * Remplir le champ de confirmation du mot de passe
   * @param {string} password 
   */
  async fillConfirmPassword(password) {
    await this.fill(this.selectors.confirmPasswordInput, password);
  }

  /**
   * Remplir le formulaire complet d'inscription
   * @param {Object} data 
   * @param {string} data.firstName
   * @param {string} data.lastName
   * @param {string} data.email
   * @param {string} data.phone
   * @param {string} data.password
   * @param {string} data.confirmPassword
   */
  async fillSignupForm(data) {
    if (data.firstName) await this.fillFirstName(data.firstName);
    if (data.lastName) await this.fillLastName(data.lastName);
    if (data.email) await this.fillEmail(data.email);
    if (data.phone) await this.fillPhone(data.phone);
    if (data.password) await this.fillPassword(data.password);
    if (data.confirmPassword) await this.fillConfirmPassword(data.confirmPassword);
  }

  /**
   * Remplir avec un email déjà enregistré (pour tests négatifs)
   * @param {string} existingEmail 
   */
  async fillWithExistingEmail(existingEmail = 'existing@test.com') {
    await this.fillEmail(existingEmail);
  }

  // ============ MÉTHODES D'INTERACTION ============

  /**
   * Accepter les conditions d'utilisation
   */
  async acceptTerms() {
    await this.page.check(this.selectors.termsCheckbox);
  }

  /**
   * S'abonner à la newsletter
   */
  async subscribeNewsletter() {
    await this.page.check(this.selectors.newsletterCheckbox);
  }

  /**
   * Cliquer sur le bouton d'inscription
   */
  async clickSubmitButton() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Effectuer une inscription complète
   * @param {Object} data - Données du formulaire
   */
  async signup(data) {
    await this.fillSignupForm(data);
    await this.acceptTerms();
    await this.clickSubmitButton();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Passer au champ suivant (pour déclencher la validation)
   */
  async moveToNextField() {
    await this.page.keyboard.press('Tab');
  }

  /**
   * Cliquer sur le lien de connexion
   */
  async clickLoginLink() {
    await this.click(this.selectors.loginLink);
  }

  // ============ MÉTHODES DE VÉRIFICATION ============

  /**
   * Vérifier que le formulaire d'inscription est visible
   * @returns {Promise<boolean>}
   */
  async isSignupFormVisible() {
    return await this.isVisible(this.selectors.signupForm);
  }

  /**
   * Vérifier qu'un champ spécifique est visible
   * @param {string} fieldName 
   * @returns {Promise<boolean>}
   */
  async isFieldVisible(fieldName) {
    const selectorMap = {
      'prénom': this.selectors.firstNameInput,
      'first name': this.selectors.firstNameInput,
      'nom': this.selectors.lastNameInput,
      'last name': this.selectors.lastNameInput,
      'email': this.selectors.emailInput,
      'téléphone': this.selectors.phoneInput,
      'phone': this.selectors.phoneInput,
      'mot de passe': this.selectors.passwordInput,
      'password': this.selectors.passwordInput,
      'confirmation': this.selectors.confirmPasswordInput,
      'confirm password': this.selectors.confirmPasswordInput,
    };
    
    const selector = selectorMap[fieldName.toLowerCase()];
    return selector ? await this.isVisible(selector) : false;
  }

  /**
   * Obtenir la force du mot de passe
   * @returns {Promise<string>} - "weak", "strong", ou ""
   */
  async getPasswordStrength() {
    const isWeak = await this.isVisible(this.selectors.passwordStrengthWeak);
    if (isWeak) return 'weak';
    
    const isStrong = await this.isVisible(this.selectors.passwordStrengthStrong);
    if (isStrong) return 'strong';
    
    return '';
  }

  /**
   * Vérifier que l'indicateur de mot de passe faible est affiché
   * @returns {Promise<boolean>}
   */
  async hasWeakPasswordIndicator() {
    return await this.isVisible(this.selectors.passwordStrengthWeak);
  }

  /**
   * Vérifier que l'indicateur de mot de passe fort est affiché
   * @returns {Promise<boolean>}
   */
  async hasStrongPasswordIndicator() {
    return await this.isVisible(this.selectors.passwordStrengthStrong);
  }

  /**
   * Obtenir le message de succès
   * @returns {Promise<string>}
   */
  async getSuccessMessage() {
    try {
      return await this.getText(this.selectors.successMessage);
    } catch (error) {
      return '';
    }
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
   * Vérifier qu'une erreur "email déjà utilisé" est affichée
   * @returns {Promise<boolean>}
   */
  async hasEmailExistsError() {
    return await this.isVisible(this.selectors.emailExistsError);
  }

  /**
   * Vérifier qu'une erreur "mots de passe ne correspondent pas" est affichée
   * @returns {Promise<boolean>}
   */
  async hasPasswordMismatchError() {
    return await this.isVisible(this.selectors.passwordMismatchError);
  }

  /**
   * Obtenir le message de validation d'un champ spécifique
   * @param {string} fieldName 
   * @returns {Promise<string>}
   */
  async getFieldValidationError(fieldName) {
    const selectorMap = {
      'email': this.selectors.emailInput,
      'mot de passe': this.selectors.passwordInput,
      'confirmation': this.selectors.confirmPasswordInput,
    };
    
    const selector = selectorMap[fieldName.toLowerCase()];
    if (!selector) return '';
    
    const field = await this.page.locator(selector);
    return await field.evaluate(el => el.validationMessage);
  }

  /**
   * Vérifier qu'une erreur de validation est affichée
   * @param {string} errorText 
   * @returns {Promise<boolean>}
   */
  async hasValidationError(errorText) {
    return await this.isVisible(`:has-text("${errorText}")`);
  }
}

module.exports = { SignupPage };
