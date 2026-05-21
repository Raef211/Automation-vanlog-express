const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  function suffix() {
    return Date.now().toString().slice(-6);
  }

  async function fillFirstVisible(selectors, value) {
    for (const selector of selectors) {
      const el = page.locator(selector).first();
      if (await el.count()) {
        try {
          await el.fill(value);
          return true;
        } catch (_) {}
      }
    }
    return false;
  }

  async function clickFirstVisible(selectors) {
    for (const selector of selectors) {
      const el = page.locator(selector).first();
      if (await el.count()) {
        try {
          await el.click({ force: true });
          return true;
        } catch (_) {}
      }
    }
    return false;
  }

  try {
    console.log('📍 Connexion...');
    await page.goto('https://vanlog-express.com/login', { waitUntil: 'domcontentloaded' });
    await page.fill('#loginEmail', 'client@gmail.com');
    await page.fill('#password', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);

    console.log('📍 Accès à la liste des commandes...');
    const ordersOpened = await clickFirstVisible([
      '.ant-menu-item:has-text("Liste des commandes")',
      'a[href*="/orders"]'
    ]);

    if (!ordersOpened) {
      if (page.url().includes('/admin/')) {
        await page.goto('https://vanlog-express.com/admin/orders', { waitUntil: 'domcontentloaded' });
      } else {
        await page.goto('https://vanlog-express.com/orders', { waitUntil: 'domcontentloaded' });
      }
    }

    await page.waitForTimeout(1000);

    for (let orderNum = 1; orderNum <= 2; orderNum++) {
      console.log(`\n📦 Création de la commande ${orderNum}...`);

      const addClicked = await clickFirstVisible([
        'button:has-text("Ajouter une commande")',
        'button:has-text("Ajouter")',
        'button:has-text("Nouvelle commande")'
      ]);

      if (!addClicked) {
        console.log(`❌ Impossible d'ouvrir le formulaire de commande ${orderNum}`);
        continue;
      }

      await page.waitForTimeout(1200);

      const s = suffix();
      const orderType = orderNum % 2 === 1 ? 'Livrer une commande' : 'Apportez une commande';
      await clickFirstVisible([
        `button:has-text("${orderType}")`,
        'button:has-text("Livrer une commande")',
        'button:has-text("Apportez une commande")'
      ]);

      await page.waitForTimeout(1500);

      // Remplir TOUS les champs visibles
      const allNumberInputs = page.locator('input[type="number"]:visible, input[inputmode="numeric"]:visible');
      const allTextInputs = page.locator('input[type="text"]:visible, input:not([type="number"]):not([type="hidden"]):not([type="password"]):visible');
      const allSelects = page.locator('.ant-select:visible');

      // Remplir les inputs numéro
      const numCount = await allNumberInputs.count();
      for (let i = 0; i < numCount; i++) {
        try {
          const inp = allNumberInputs.nth(i);
          await inp.fill(`26${s}${i}`);
        } catch (_) {}
      }

      // Remplir les inputs texte
      const textCount = await allTextInputs.count();
      for (let i = 0; i < textCount; i++) {
        try {
          const inp = allTextInputs.nth(i);
          const placeholder = await inp.getAttribute('placeholder');
          let value = `Order${orderNum}-Field${i}-${s}`;
          
          if (placeholder && placeholder.toLowerCase().includes('nom')) {
            value = `Client Ordre ${orderNum}`;
          } else if (placeholder && placeholder.toLowerCase().includes('adresse')) {
            value = `Adresse ${orderNum} - Rue ${s}`;
          } else if (placeholder && placeholder.toLowerCase().includes('ville')) {
            value = `Ville ${orderNum}`;
          }
          
          await inp.fill(value);
        } catch (_) {}
      }

      // Cliquer sur les selects et prendre la première option
      const selectCount = await allSelects.count();
      for (let i = 0; i < selectCount; i++) {
        try {
          const sel = allSelects.nth(i);
          await sel.click({ force: true });
          await page.waitForTimeout(300);
          const option = page.locator('.ant-select-item-option:visible').first();
          if (await option.count()) {
            await option.click({ force: true });
            await page.waitForTimeout(200);
          }
        } catch (_) {}
      }

      await page.waitForTimeout(500);

      const submitClicked = await clickFirstVisible([
        '.ant-modal button[type="submit"]',
        '.ant-drawer button[type="submit"]',
        'button:has-text("Confirmer")',
        'button:has-text("Valider")',
        'button:has-text("Ajouter")',
        'button[type="submit"]'
      ]);

      if (!submitClicked) {
        console.log(`❌ Impossible de soumettre la commande ${orderNum}`);
        continue;
      }

      await page.waitForTimeout(2500);

      const visibleErrors = await page.locator('.ant-form-item-explain-error:visible, [role="alert"]:visible').count();
      if (visibleErrors > 0) {
        console.log(`⚠️  Erreurs de validation pour la commande ${orderNum}: ${visibleErrors}`);
      } else {
        console.log(`✅ Commande ${orderNum} créée avec succès`);
      }

      // Fermer le modal/drawer si encore ouvert
      await clickFirstVisible([
        '.ant-modal-close',
        '.ant-drawer-close'
      ]);

      await page.waitForTimeout(1000);
    }

    console.log('\n✨ Création des 2 commandes terminée');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
})();
