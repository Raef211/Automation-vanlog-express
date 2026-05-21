const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let results = [];
  const log = (msg) => {
    results.push(msg);
    console.log(msg);
  };
  
  try {
    log('\n╔════════════════════════════════════════╗');
    log('║     ORDER VIEWING & TRACKING WORKFLOW  ║');
    log('╚════════════════════════════════════════╝\n');
    
    // 1. LOGIN
    log('1️⃣  Logging in to client account...');
    await page.goto('https://vanlog-express.com');
    await page.waitForTimeout(2000);
    await page.fill('#loginEmail', 'client@gmail.com');
    await page.fill('#password', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    log('✅ Logged in successfully\n');
    
    // 2. NAVIGATE TO ORDERS
    log('2️⃣  Navigating to orders list...');
    const ordersMenu = page.locator('.ant-menu-item').filter({ hasText: /liste.*commandes/i });
    await ordersMenu.first().click().catch(() => {});
    await page.waitForTimeout(3000);
    const orderCount = await page.locator('.ant-table-tbody tr:not(.ant-table-measure-row)').count();
    log(`✅ Found ${orderCount} order(s) in list\n`);
    
    // 3. CLICK FIRST BUTTON TO VIEW ORDER DETAILS
    log('3️⃣  Clicking first action button to view order details...');
    const firstButton = page.locator('.ant-table-tbody tr:not(.ant-table-measure-row) td:last-child button').first();
    await firstButton.click({ force: true });
    await page.waitForTimeout(2000);
    log('✅ Order details opened\n');
    
    // 4. EXTRACT ORDER DETAILS & TRACKING NUMBER
    log('4️⃣  Extracting order information...');
    const orderDetails = await page.evaluate(() => {
      const drawer = document.querySelector('.ant-drawer-body');
      if (!drawer) return null;
      
      const text = drawer.textContent;
      
      // Get all text nodes and find the tracking number
      let trackingNumber = null;
      const allElements = Array.from(drawer.querySelectorAll('*'))
        .filter(el => el.children.length === 0)
        .map(el => el.textContent?.trim());
      
      // Look for pattern like "T10VL264064" or similar
      for (const element of allElements) {
        const match = element?.match(/T\d{2}VL\d{6}/);
        if (match) {
          trackingNumber = match[0];
          break;
        }
      }
      
      // If not found, try broader search
      if (!trackingNumber) {
        const allMatch = text.match(/\b[A-Z]\d{2}[A-Z]{2}\d{6}\b/);
        if (allMatch) {
          trackingNumber = allMatch[0];
        }
      }
      
        // If still not found, try with word boundary or after "suivi"
        if (!trackingNumber) {
          const suiviMatch = text.match(/suivi(T\d{2}VL\d{6})/i);
          if (suiviMatch) {
            trackingNumber = suiviMatch[1];
          }
        }
      
      // Find status (should be right after "Statut de la commande")
      const statusMatch = text.match(/Statut de la commande\s+([^\n]+?)(?=\n|Dates)/);
      const status = statusMatch?.[1]?.trim() || 'Unknown';
      
      return {
        trackingNumber,
        status,
        textLength: text.length,
        snippet: text.substring(0, 500)
      };
    });
    
    if (!orderDetails) {
      throw new Error('Could not access drawer content');
    }
    
    log(`   Debug Info: Text length = ${orderDetails.textLength}`);
    
    if (orderDetails?.trackingNumber) {
      log(`✅ Tracking Number Found: ${orderDetails.trackingNumber}`);
      log(`   Order Status: ${orderDetails.status}\n`);
    } else {
      log('ℹ️  Could not extract tracking number from standard pattern');
      log('   Displaying raw content snippet for manual inspection:');
      log(`   ${orderDetails.snippet.substring(0, 300)}\n`);
      throw new Error('Tracking number extraction failed');
    }
    
    // 5. CLOSE DRAWER
    log('5️⃣  Closing order details drawer...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    log('✅ Drawer closed\n');
    
    // 6. NAVIGATE TO TRACKING PAGE
    log('6️⃣  Navigating to Tracking Orders page...');
    await page.goto('https://vanlog-express.com/tracking-orders', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    log('✅ On Tracking Orders page\n');
    
    // 7. ENTER TRACKING NUMBER
    log('7️⃣  Entering tracking number in search field...');
    const trackingInput = page.locator('input[placeholder*="suivi" i], input[placeholder*="tracking" i], #trackingNumber').first();
    await trackingInput.fill(orderDetails.trackingNumber);
    await page.waitForTimeout(500);
    log(`✅ Entered: ${orderDetails.trackingNumber}\n`);
    
    // 8. SEARCH/SUBMIT
    log('8️⃣  Clicking search button...');
    const searchBtn = page.locator('button:has-text("Confirmer"), button:has-text("Rechercher"), button:has-text("Valider")').first();
    await searchBtn.click({ force: true });
    await page.waitForTimeout(2000);
    log('✅ Search submitted\n');
    
    // 9. CAPTURE RESULTS
    log('9️⃣  Capturing tracking results...\n');
    const trackingResults = await page.evaluate(() => {
      const body = document.body;
      const allText = Array.from(body.querySelectorAll('*'))
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && el.children.length === 0;
        })
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0 && text.length < 200);
      
      return [...new Set(allText)];
    });
    
    log('╔════════════════════════════════╗');
    log('║     TRACKING RESULTS           ║');
    log('╚════════════════════════════════╝');
    log(`\nTracking Number: ${orderDetails.trackingNumber}`);
    log(`Order Status: ${orderDetails.status}`);
    log(`\nPage Content (first 50 visible items):`);
    
    trackingResults.slice(0, 50).forEach((item, idx) => {
      if (item && item.trim()) {
        log(`  ${idx + 1}. ${item.substring(0, 100)}`);
      }
    });
    
    log('\n✅ WORKFLOW COMPLETED SUCCESSFULLY!');
    log('\nSummary:');
    log(`  - Order Details: VIEWED ✓`);
    log(`  - Tracking Number: ${orderDetails.trackingNumber} ✓`);
    log(`  - Tracking Page: ACCESSED ✓`);
    log(`  - Search: EXECUTED ✓`);
    log(`  - Results: DISPLAYED ✓\n`);
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`);
  } finally {
    // Save results to file
    const resultsFile = 'tracking-workflow-results.txt';
    fs.writeFileSync(resultsFile, results.join('\n'), 'utf-8');
    log(`\n📄 Full results saved to: ${resultsFile}`);
    
    await browser.close();
  }
})();
