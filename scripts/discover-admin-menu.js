const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  // Admin login
  await page.goto('https://vanlog-express.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await page.locator('#loginEmail').fill('support@vanlog-express.com');
  await page.locator('#password').fill('y8JzyLZ5Utcw7Q+n(CnQ)');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(3000);
  console.log('Admin URL:', page.url());

  // Get all menu items
  const menuItems = await page.locator('.ant-menu-item, .ant-menu-submenu-title').allTextContents();
  console.log('Menu items:', JSON.stringify(menuItems));

  // Get all links
  const links = await page.locator('a[href]').evaluateAll(els =>
    els.map(el => ({ text: el.textContent.trim().substring(0, 60), href: el.getAttribute('href') }))
  );
  console.log('Links:', JSON.stringify(links.slice(0, 40)));

  // Try different candidate URLs
  const candidates = [
    '/admin/pending-accounts',
    '/admin/accounts',
    '/admin/users/pending',
    '/admin/account-requests',
    '/admin/clients',
    '/admin/clients/pending',
  ];

  for (const path of candidates) {
    await page.goto(`https://vanlog-express.com${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    const finalUrl = page.url();
    const tableRows = await page.locator('.ant-table-tbody tr').count();
    console.log(`TRY ${path} -> ${finalUrl} | rows: ${tableRows}`);
  }

  await page.screenshot({ path: 'screenshots/admin-menu-discovery.png', fullPage: true });
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
