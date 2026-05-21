const { BasePage } = require('./BasePage');

/**
 * DashboardPage - Tableau de bord Admin VanLog Express
 * Page principale du dashboard admin après connexion
 */
class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.adminUrl = 'https://vanlog-express.com/admin/dashboard';
  }

  // ============ SÉLECTEURS ============
  selectors = {
    // Header elements
    pageTitle: 'h4.header--page-label--title',
    userProfile: 'h3.header--user-name',
    userAvatar: '.ant-avatar',
    logoutButton: '.side-menu--logout',
    
    // Menu items
    menuItem: '.ant-menu-item',
    selectedMenuItem: '.ant-menu-item-selected',
    menuItemText: 'span.ant-menu-title-content',
    
    // Dashboard sections - specific menu items
    tableauDeBordMenu: '.ant-menu-item:has-text("Tableau de bord")',
    listeCommandesMenu: '.ant-menu-item:has-text("Liste des commandes")',
    listeTransporteursMenu: '.ant-menu-item:has-text("Liste des transporteurs")',
    listeClientsMenu: '.ant-menu-item:has-text("Liste des clients")',
    facturesMenu: '.ant-menu-item:has-text("Factures")',
    reclamationsMenu: '.ant-menu-item:has-text("Réclamations")',
    suiviCommandesMenu: '.ant-menu-item:has-text("Suivi des commandes")',
    
    // Dashboard Home (Tableau de bord) elements
    orderStatCard: '.order-stat-card-value',
    userStatCard: '.user-stat-card-value',
    statisticsCards: '.admin-dashboard-statics--cards-title',
    cardTitle: '.ant-card-head-title',
    
    // Orders page elements
    addOrderButton: 'button:has-text("Ajouter une commande")',
    orderSearchInput: 'input[placeholder*="Chercher avec numéro de suivi"]',
    
    // Transporters page elements
    transporterSearchInput: 'input[placeholder*="Chercher avec email"]',
    acceptButton: 'button:has-text("Accepter")',
    rejectButton: 'button:has-text("Rejeter")',
    
    // Clients page elements
    clientSearchInput: 'input[placeholder*="Chercher avec email"]',
    
    // Invoices page elements
    invoiceFormTitle: 'h2.invoice-form--title',
    generateInvoiceButton: '.invoice-form--generate-btn',
    dateFromInput: '#from',
    dateToInput: '#to',
    
    // Complaints page elements
    complaintSearchInput: 'input[placeholder*="Rechercher par sujet"]',
    
    // Tracking page elements
    trackingTitle: 'h3.auth-form--title',
    trackingNumberInput: '#trackingNumber',
    confirmButton: 'button:has-text("Confirmer")',
    
    // Table elements
    antTable: '.ant-table',
    tableHeader: 'th',
    pagination: '.ant-pagination',
    
    // Common elements
    searchInput: '.ant-input',
    primaryButton: '.ant-btn-primary',
  };

  // ============ MÉTHODES DE NAVIGATION ============

  /**
   * Navigate to admin dashboard
   */
  async navigate() {
    await this.navigateTo(this.adminUrl);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click on a menu item by its text
   * @param {string} menuText - The text of the menu item
   */
  async clickMenuItem(menuText) {
    const menuItem = this.page.locator('.ant-menu-item').filter({ hasText: menuText }).first();
    
    // Wait for menu item to be visible
    await menuItem.waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(500);
    
    // Click the menu item
    await menuItem.click({ force: true });
    
    // Wait for page navigation
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    } catch (e) {
      // If networkidle fails, just wait a bit longer
      await this.page.waitForTimeout(2000);
    }
    
    await this.page.waitForTimeout(1500);
  }

  /**
   * Navigate to Tableau de bord
   */
  async navigateToTableauDeBord() {
    await this.clickMenuItem('Tableau de bord');
  }

  /**
   * Navigate to Liste des commandes
   */
  async navigateToListeCommandes() {
    await this.clickMenuItem('Liste des commandes');
  }

  /**
   * Navigate to Liste des transporteurs
   */
  async navigateToListeTransporteurs() {
    await this.clickMenuItem('Liste des transporteurs');
  }

  /**
   * Navigate to Liste des clients
   */
  async navigateToListeClients() {
    await this.clickMenuItem('Liste des clients');
  }

  /**
   * Navigate to Factures
   */
  async navigateToFactures() {
    await this.clickMenuItem('Factures');
  }

  /**
   * Navigate to Réclamations
   */
  async navigateToReclamations() {
    await this.clickMenuItem('Réclamations');
  }

  /**
   * Navigate to Suivi des commandes
   */
  async navigateToSuiviCommandes() {
    await this.clickMenuItem('Suivi des commandes');
  }

  // ============ MÉTHODES DE VÉRIFICATION ============

  /**
   * Check if a menu item is visible
   * @param {string} menuText - The text of the menu item
   * @returns {Promise<boolean>}
   */
  async isMenuItemVisible(menuText) {
    const menuItem = this.page.locator('.ant-menu-item').filter({ hasText: menuText }).first();
    return await menuItem.isVisible();
  }

  /**
   * Check if a menu item is selected
   * @param {string} menuText - The text of the menu item
   * @returns {Promise<boolean>}
   */
  async isMenuItemSelected(menuText) {
    const menuItem = this.page.locator('.ant-menu-item-selected').filter({ hasText: menuText }).first();
    const count = await menuItem.count();
    return count > 0;
  }

  /**
   * Get the page title
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return await this.getText(this.selectors.pageTitle);
  }

  /**
   * Get the user profile name
   * @returns {Promise<string>}
   */
  async getUserProfile() {
    return await this.getText(this.selectors.userProfile);
  }

  /**
   * Check if user profile is visible
   * @returns {Promise<boolean>}
   */
  async isUserProfileVisible() {
    return await this.isVisible(this.selectors.userProfile);
  }

  /**
   * Check if a card with specific title exists
   * @param {string} cardTitle - The title of the card
   * @returns {Promise<boolean>}
   */
  async hasCard(cardTitle) {
    const card = this.page.locator('.ant-card-head-title').filter({ hasText: cardTitle }).first();
    return await card.isVisible();
  }

  /**
   * Check if a button with specific text exists
   * @param {string} buttonText - The text on the button
   * @returns {Promise<boolean>}
   */
  async hasButton(buttonText) {
    const button = this.page.locator('button').filter({ hasText: buttonText }).first();
    return await button.isVisible();
  }

  /**
   * Check if a search input with specific placeholder exists
   * @param {string} placeholder - The placeholder text
   * @returns {Promise<boolean>}
   */
  async hasSearchInput(placeholder) {
    const input = this.page.locator('input').filter({ hasText: placeholder }).first();
    const count = await input.count();
    if (count === 0) {
      // Try with placeholder attribute
      const inputByPlaceholder = this.page.locator(`input[placeholder*="${placeholder}"]`).first();
      return await inputByPlaceholder.isVisible();
    }
    return await input.isVisible();
  }

  /**
   * Check if a table exists
   * @returns {Promise<boolean>}
   */
  async hasTable() {
    return await this.isVisible(this.selectors.antTable);
  }

  /**
   * Check if table has specific columns
   * @param {string} columnsText - Comma-separated column names
   * @returns {Promise<boolean>}
   */
  async hasTableColumns(columnsText) {
    const columns = columnsText.split(',').map(c => c.trim());
    for (const column of columns) {
      const header = this.page.locator('th').filter({ hasText: column }).first();
      const count = await header.count();
      if (count === 0) return false;
    }
    return true;
  }

  /**
   * Check if an input field with specific id exists
   * @param {string} fieldId - The id of the field
   * @returns {Promise<boolean>}
   */
  async hasField(fieldId) {
    const field = this.page.locator(`#${fieldId}`).first();
    return await field.isVisible();
  }

  /**
   * Check if a heading with specific text exists
   * @param {string} headingText - The text of the heading
   * @returns {Promise<boolean>}
   */
  async hasHeading(headingText) {
    const heading = this.page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: headingText }).first();
    return await heading.isVisible();
  }

  /**
   * Click logout button
   */
  async logout() {
    await this.click(this.selectors.logoutButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get current URL
   * @returns {string}
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Check if URL contains specific text
   * @param {string} urlPart - The text that should be in the URL
   * @returns {boolean}
   */
  urlContains(urlPart) {
    return this.getCurrentUrl().includes(urlPart);
  }
}

module.exports = { DashboardPage };
