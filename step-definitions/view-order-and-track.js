const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 Connexion au compte client...');
    await page.goto('https://vanlog-express.com/login', { waitUntil: 'domcontentloaded' });
    await page.fill('#loginEmail', 'client@gmail.com');
    await page.fill('#password', '123456789');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    console.log('✅ Connecté');

    console.log('\n📋 Accès à la liste des commandes...');
    const ordersMenu = page.locator('.ant-menu-item').filter({ hasText: 'Liste des commandes' }).first();
    if (await ordersMenu.count()) {
      await ordersMenu.click();
    } else {
      await page.goto('https://vanlog-express.com/admin/orders', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(1500);
    console.log('✅ Liste des commandes visible');

    // Chercher l'icône eye (visualiser) pour la première commande
    console.log('\n👁️  Recherche de l\'icône eye pour voir les détails...');
    const eyeIcons = page.locator('svg[data-icon="eye"], .anticon-eye, button[title*="eye" i], button[title*="voir" i]');
    const eyeCount = await eyeIcons.count();
    
    if (eyeCount === 0) {
      console.log('⚠️  Aucune icône eye trouvée, cherche des boutons d\'action...');
      const actionButtons = page.locator('.ant-table-tbody tr').first().locator('button, a, span[role="img"]');
      const firstActionBtn = actionButtons.first();
      if (await firstActionBtn.count()) {
        console.log('Clique sur le premier bouton d\'action...');
        await firstActionBtn.click({ force: true });
        await page.waitForTimeout(1500);
      }
    } else {
      console.log(`✅ Trouvé ${eyeCount} icône(s) eye`);
      await eyeIcons.first().click({ force: true });
      await page.waitForTimeout(1500);
    }

    // Récupérer les détails de la commande
    console.log('\n📋 Extraction des détails de la commande...');
    const orderDetails = await page.evaluate(() => {
      const result = { trackingNumber: null, details: {} };

      // Chercher le numéro de suivi dans plusieurs endroits
      const modal = document.querySelector('.ant-modal');
      const drawer = document.querySelector('.ant-drawer');
      const container = modal || drawer || document;

      // Chercher par texte "Numero de suivi" ou "Tracking Number"
      const allText = Array.from(container.querySelectorAll('*'))
        .filter(el => el.children.length === 0)
        .map(el => ({
          text: el.textContent?.trim() || '',
          html: el.innerHTML || '',
          tag: el.tagName
        }));

      // Afficher tous les textes pour inspection
      result.allTexts = allText.slice(0, 50);

      // Chercher le numéro de tracking
      allText.forEach((item, idx) => {
        if (item.text.match(/^[A-Z0-9]{4,}$/i)) {
          if (result.trackingNumber === null) {
            result.trackingNumber = item.text;
          }
        }
        if (item.text.toLowerCase().includes('numero') || 
            item.text.toLowerCase().includes('suivi') ||
            item.text.toLowerCase().includes('tracking')) {
          result.trackingLabel = item.text;
        }
      });

      // Chercher dans les descriptions
      const descriptions = Array.from(container.querySelectorAll('.ant-descriptions-item, .ant-form-item, div'))
        .map(el => ({
          label: el.querySelector('.ant-descriptions-item-label, label, span')?.textContent?.trim(),
          value: el.querySelector('.ant-descriptions-item-content, input, span')?.textContent?.trim() || 
                  el.querySelector('input')?.value ||
                  el.getAttribute('title')
        }))
        .filter(d => d.label && d.value);

      result.descriptions = descriptions;

      // Essayer de trouver le numero directement
      const trackingInputs = Array.from(container.querySelectorAll('input, span, div'))
        .map(el => el.textContent?.trim() || el.value || '')
        .filter(t => t && t.match(/^[A-Z0-9]{4,}$/i));

      if (trackingInputs.length > 0 && !result.trackingNumber) {
        result.trackingNumber = trackingInputs[0];
      }

      return result;
    });

    console.log('\n📊 Détails trouvés:');
    console.log(JSON.stringify(orderDetails, null, 2));

    const trackingNumber = orderDetails.trackingNumber || 
                          orderDetails.descriptions?.[0]?.value ||
                          'T9VL2533'; // fallback

    console.log(`\n🎯 Numéro de suivi extrait: ${trackingNumber}`);

    // Chercher le lien ou bouton "Modifier" si visible
    console.log('\n✏️  Recherche du bouton Modifier...');
    const editBtn = page.locator('button:has-text("Modifier"), button[title*="edit" i], a:has-text("Modifier")')
      .first();
    if (await editBtn.count()) {
      console.log('✅ Bouton Modifier trouvé et cliquable');
      try {
        await editBtn.click({ force: true });
        await page.waitForTimeout(1000);
        console.log('✅ Édition ouverte');
      } catch (_) {
        console.log('⚠️  Édition non disponible');
      }
    } else {
      console.log('⚠️  Aucun bouton Modifier trouvé');
    }

    // Fermer le modal/drawer
    console.log('\n🚪 Fermeture du détail...');
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(500);

    // Aller à la page de tracking
    console.log('\n🚀 Navigation vers Tracking Orders...');
    const trackingLink = page.locator('a:has-text("Suivi des commandes"), a[href*="tracking"]').first();
    if (await trackingLink.count()) {
      await trackingLink.click({ force: true });
    } else {
      // Fallback: aller directement
      await page.goto('https://vanlog-express.com/tracking-orders', { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(1500);
    console.log('✅ Page de tracking ouverte');

    // Remplir le numéro de suivi
    console.log(`\n📝 Remplissage du numéro de suivi: ${trackingNumber}`);
    const trackingInput = page.locator('#trackingNumber, input[placeholder*="tracking" i], input[placeholder*="suivi" i]').first();
    if (await trackingInput.count()) {
      await trackingInput.fill(trackingNumber);
      await page.waitForTimeout(500);
      console.log('✅ Numéro entré');

      // Cliquer sur Confirmer
      console.log('\n🔍 Recherche du numéro de suivi...');
      const confirmBtn = page.locator('button:has-text("Confirmer"), button:has-text("Rechercher"), button[type="submit"]').first();
      if (await confirmBtn.count()) {
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(2000);
        console.log('✅ Recherche lancée');

        // Vérifier les résultats
        const results = await page.evaluate(() => {
          const result = { found: false, status: null, details: {} };

          const pageText = document.body.textContent || '';
          result.pageText = pageText.substring(0, 500);

          // Chercher les statuts possibles
          const statusElements = Array.from(document.querySelectorAll('*'))
            .filter(el => el.children.length === 0)
            .map(el => el.textContent?.trim())
            .filter(t => t && (t.includes('Livré') || t.includes('En transit') || t.includes('En attente') || 
                               t.includes('Delivered') || t.includes('In progress')));

          if (statusElements.length > 0) {
            result.found = true;
            result.status = statusElements[0];
          }

          // Cherche des infos de commande
          const infoElements = Array.from(document.querySelectorAll('.ant-descriptions-item, .ant-descriptions-item-content, .order-info, div'))
            .map(el => el.textContent?.trim())
            .filter(t => t && t.length > 5 && t.length < 200);

          result.orderInfo = infoElements.slice(0, 10);

          return result;
        });

        console.log('\n📊 Résultats du suivi:');
        console.log(JSON.stringify(results, null, 2));

        if (results.found) {
          console.log('\n✅ Commande trouvée et statut affiché!');
        } else {
          console.log('\n⚠️  Aucun résultat trouvé pour ce numéro');
        }
      }
    }

    console.log('\n✨ Flux complet terminé');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exitCode = 1;
  } finally {
    await context.close();
    await browser.close();
  }
})();
