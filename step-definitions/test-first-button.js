const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    // Login
    console.log('Logging in...');
    await page.goto('https://vanlog-express.com');
    await page.waitForTimeout(2000);
    await page.fill('#loginEmail', 'client@gmail.com');
    await page.fill('#password', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Go to orders page
    console.log('Going to orders list...');
    const ordersMenu = page.locator('.ant-menu-item').filter({ hasText: /liste.*commandes/i });
    await ordersMenu.first().click().catch(() => {});
    await page.waitForTimeout(3000);
    
    // Click the first action button in the last cell
    const firstButton = page.locator('.ant-table-tbody tr:not(.ant-table-measure-row) td:last-child button').first();
    console.log('Clicking first button...');
    await firstButton.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Check if a modal appeared
    const modalExists = await page.locator('.ant-modal').count() > 0;
    const drawerExists = await page.locator('.ant-drawer').count() > 0;
    
    console.log(`Modal exists: ${modalExists}`);
    console.log(`Drawer exists: ${drawerExists}`);
    
    if (modalExists || drawerExists) {
      console.log('✅ Details modal/drawer opened!');
      
      // Get the content
      const content = await page.evaluate(() => {
        const modal = document.querySelector('.ant-modal-body');
        const drawer = document.querySelector('.ant-drawer-body');
        const container = modal || drawer;
        
        if (container) {
          return container.textContent.substring(0, 1000);
        }
        return 'No content found';
      });
      
      console.log('\n📦 Modal/Drawer Content:');
      console.log(content);
      
      // Save to file
      fs.writeFileSync('modal-content.txt', content, 'utf-8');
      console.log('\n✅ Content saved to modal-content.txt');
    } else {
      console.log('❌ No modal or drawer appeared');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
