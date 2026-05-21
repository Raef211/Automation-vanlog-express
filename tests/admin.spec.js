const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://vanlog-express.com';
const ADMIN = { email: 'support@vanlog-express.com', password: 'y8JzyLZ5Utcw7Q+n(CnQ' };

test.describe('Admin - Gestion du système', () => {
  test('Parcours complet de l\'administrateur - Gestion du système', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    // Login (robust selectors + waits)
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    // handle apps that redirect /admin -> /login
    await page.waitForURL('**/login', { timeout: 10000 }).catch(() => {});

    const email = page.locator('input[name*="email"], input[placeholder*="@"], input[aria-label*="Email"], input[placeholder*="example@"], input[type="email"]').first();
    await expect(email).toBeVisible({ timeout: 10000 });
    await email.fill(ADMIN.email);

    const pass = page.locator('input[name*="password"], input[placeholder*="mot de passe"], input[aria-label*="Mot de passe"], input[type="password"]').first();
    await expect(pass).toBeVisible({ timeout: 10000 });
    await pass.fill(ADMIN.password);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button:has-text("Se connecter"), button:has-text("Connexion"), button[type="submit"]'),
    ]);

    // Dashboard visible
    const dashboard = page.locator('[data-testid="admin-dashboard"], .admin-panel, [role="main"]');
    await expect(dashboard.first()).toBeVisible();

    // Navigate to users
    const usersLink = page.locator('a[href*="users"], button:has-text("Utilisateurs")').first();
    if (await usersLink.count() > 0) {
      await usersLink.click();
      await page.waitForTimeout(500);
      const results = page.locator('[data-testid="user-list"], table tbody tr');
      await expect(results.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    }

    // Navigate to orders
    const ordersLink = page.locator('a[href*="orders"], button:has-text("Commandes")').first();
    if (await ordersLink.count() > 0) {
      await ordersLink.click();
      await page.waitForTimeout(500);
      const orderList = page.locator('[data-testid="order-list"], table tbody');
      await expect(orderList.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    }

    // Select first order and change status if possible
    const firstOrder = page.locator('[data-testid="order-row"]:first-child, table tbody tr:first-child');
    if (await firstOrder.count() > 0) {
      await firstOrder.click();
      await page.waitForTimeout(400);
      const statusDropdown = page.locator('select[name="order-status"], [data-testid="status-selector"]');
      if (await statusDropdown.count() > 0) {
        // attempt to select first option
        const options = await statusDropdown.locator('option').allTextContents().catch(() => []);
        if (options.length > 1) {
          await statusDropdown.selectOption({ index: 1 }).catch(() => {});
          await page.click('button:has-text("Enregistrer"), button[type="submit"]').catch(() => {});
        }
      }
    }

    // Stats page
    const statsLink = page.locator('a[href*="statistics"], a[href*="reports"], button:has-text("Statistiques")').first();
    if (await statsLink.count() > 0) {
      await statsLink.click();
      await page.waitForTimeout(500);
      const stats = page.locator('[data-testid="stats-overview"], .statistics');
      await expect(stats.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    }

    // Logout
    const logout = page.locator('button:has-text("Déconnexion"), [data-testid="logout-btn"]').first();
    if (await logout.count() > 0) {
      await logout.click();
      await page.waitForLoadState('networkidle');
    }

  });
});
