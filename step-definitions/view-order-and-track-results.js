const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let results = [];
  
  const log = (msg) => {
    results.push(msg);
    console.log(msg);
  };

  try {
    log('\n=== TRACKING ORDER WORKFLOW ===\n');
    
    // Navigate to login
    log('1️⃣  Navigating to login page...');
    await page.goto('https://vanlog-express.com');
    await page.waitForTimeout(2000);
    
    // Login
    log('2️⃣  Logging in with client account...');
    await page.fill('#loginEmail', 'client@gmail.com');
    await page.fill('#password', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    log('✅ Logged in successfully');
    
    // Navigate to orders list
    log('\n3️⃣  Navigating to orders list...');
    const ordersMenu = page.locator('.ant-menu-item').filter({ hasText: /liste.*commandes/i });
    await ordersMenu.first().click().catch(() => {
      log('⚠️  Could not find orders menu, trying direct navigation');
    });
    await page.waitForTimeout(2000);
    log('✅ On orders list page');
    
    // Look for orders in the table
    log('\n4️⃣  Looking for orders in table...');
    const rows = await page.locator('.ant-table-tbody tr').count();
    log(`📊 Found ${rows} order row(s) in table`);
    
    if (rows > 0) {
      // Find eye icon button
      log('\n5️⃣  Looking for eye icon to view details...');
      const firstRow = page.locator('.ant-table-tbody tr').first();
      const eyeIcon = firstRow.locator('svg[data-icon="eye"], .anticon-eye').first();
      const eyeCount = await eyeIcon.count();
      
      if (eyeCount > 0) {
        log(`✅ Found eye icon, clicking it...`);
        await eyeIcon.click({ force: true });
        await page.waitForTimeout(2000);
        
        // Extract order details
        log('\n6️⃣  Extracting order details from modal/drawer...');
        const details = await page.evaluate(() => {
          try {
            const result = {};
            
            // Try to find all text elements
            const allText = Array.from(document.querySelectorAll('*'))
              .filter(el => el.children.length === 0)
              .map(el => ({
                text: el.textContent?.trim(),
                html: el.outerHTML
              }))
              .filter(item => item.text && item.text.length > 0 && item.text.length < 100);
            
            // Look for tracking number patterns
            const trackingMatches = allText.filter(item => 
              /^[A-Z0-9]{6,}$/.test(item.text)
            );
            
            result.allResults = allText.slice(0, 20).map(t => t.text);
            result.trackingCandidates = trackingMatches.map(t => t.text);
            
            // Try to extract common fields
            result.modalContent = document.querySelector('.ant-modal-body, .ant-drawer-content')?.textContent?.substring(0, 500);
            
            return result;
          } catch (e) {
            return { error: e.message };
          }
        });
        
        log('\n📦 Order Details Extracted:');
        log(JSON.stringify(details, null, 2));
        
        // Try to find tracking number
        if (details.trackingCandidates && details.trackingCandidates.length > 0) {
          log(`\n✅ Tracking Number Candidates Found:`);
          details.trackingCandidates.forEach((num, idx) => {
            log(`   ${idx + 1}. ${num}`);
          });
        }
        
        // Close modal
        log('\n7️⃣  Closing modal...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        // Navigate to tracking page
        log('\n8️⃣  Navigating to Tracking Orders page...');
        await page.goto('https://vanlog-express.com/tracking-orders');
        await page.waitForTimeout(2000);
        log('✅ On Tracking Orders page');
        
        // If we found a tracking number, use it
        if (details.trackingCandidates && details.trackingCandidates.length > 0) {
          const trackingNumber = details.trackingCandidates[0];
          
          log(`\n9️⃣  Entering Tracking Number: ${trackingNumber}`);
          const trackingInput = page.locator('#trackingNumber, input[placeholder*="Tracking" i]').first();
          await trackingInput.fill(trackingNumber);
          await page.waitForTimeout(500);
          
          log('🔟 Clicking search/confirm button...');
          const confirmBtn = page.locator('button:has-text("Confirmer"), button:has-text("Rechercher")').first();
          await confirmBtn.click({ force: true });
          await page.waitForTimeout(2000);
          
          log('\n✅ Search completed');
          
          // Get results
          log('\n📋 Tracking Results:');
          const results = await page.evaluate(() => {
            const allText = Array.from(document.querySelectorAll('body *'))
              .filter(el => el.children.length === 0)
              .map(el => el.textContent?.trim())
              .filter(text => text && text.length > 2 && text.length < 200);
            
            return [...new Set(allText)].slice(0, 30);
          });
          
          results.forEach((result, idx) => {
            if (result) log(`   ${idx + 1}. ${result}`);
          });
        }
        
      } else {
        log('❌ Eye icon not found');
      }
    } else {
      log('⚠️  No orders found in table');
    }
    
    log('\n=== WORKFLOW COMPLETE ===\n');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`);
    log(error.stack);
  } finally {
    await browser.close();
    
    // Save results to file
    const resultsFile = path.join(__dirname, 'tracking-results.txt');
    fs.writeFileSync(resultsFile, results.join('\n'), 'utf-8');
    log(`\n✅ Results saved to: ${resultsFile}`);
  }
})();
