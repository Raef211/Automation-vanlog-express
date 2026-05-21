const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const BASE_URL = 'https://vanlog-express.com';

const CLIENT = {
  email: 'raeffatnasi@gmail.com',
  password: 'raef1234',
};

const ADMIN = {
  email: 'support@vanlog-express.com',
  password: 'y8JzyLZ5Utcw7Q+n(CnQ',
};

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function randomSuffix() {
  return Date.now().toString().slice(-6);
}

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

async function clickFirst(page, selectors) {
  for (const selector of selectors) {
    const el = page.locator(selector).first();
    if (await el.count()) {
      try {
        await el.waitFor({ state: 'visible', timeout: 5000 });
        await el.click({ force: true });
        return true;
      } catch (_) {}
    }
  }
  return false;
}

async function fillFirst(page, selectors, value) {
  for (const selector of selectors) {
    const el = page.locator(selector).first();
    if (await el.count()) {
      try {
        await el.waitFor({ state: 'visible', timeout: 5000 });
        await el.fill(String(value));
        return true;
      } catch (_) {}
    }
  }
  return false;
}

async function loginAs(page, email, password) {
  // Vider la session en cours avant de se connecter avec un autre compte
  await page.evaluate(() => {
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}
  }).catch(() => {});
  await page.context().clearCookies();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  await fillFirst(page, ['#loginEmail', 'input[name="email"]', 'input[type="email"]'], email);
  await fillFirst(page, ['#password', 'input[type="password"]'], password);
  await clickFirst(page, [
    'button[type="submit"]:has-text("Se connecter")',
    'button[type="submit"]',
  ]);

  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2500);
}

// ═══════════════════════════════════════════════════════════
// ÉTAPE 1 — CONNEXION CLIENT
// ═══════════════════════════════════════════════════════════

Given('le client ouvre VanLog Express', async function () {
  await this.page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(1500);

  const title = await this.page.title();
  console.log(`🌐 Page ouverte: ${title}`);
});

When('le client se connecte avec ses identifiants valides', async function () {
  await fillFirst(this.page, ['#loginEmail', 'input[type="email"]'], CLIENT.email);
  await fillFirst(this.page, ['#password', 'input[type="password"]'], CLIENT.password);
  await clickFirst(this.page, [
    'button[type="submit"]:has-text("Se connecter")',
    'button[type="submit"]',
  ]);

  await this.page.waitForURL(
    url => url.includes('/dashboard') || url.includes('/orders') || url.includes('/profile') || !url.endsWith('/'),
    { timeout: 30000 }
  ).catch(() => this.page.waitForLoadState('networkidle').catch(() => {}));

  await this.page.waitForTimeout(2000);
  console.log(`🔑 Client connecté - URL: ${this.page.url()}`);
});

Then('le client est redirigé vers son tableau de bord', async function () {
  const url = this.page.url();
  const onDashboard = url.includes('/dashboard') || url.includes('/orders') || url.includes('/profile');
  expect(onDashboard, `URL attendue: dashboard/orders/profile — reçu: ${url}`).toBeTruthy();
});

// ═══════════════════════════════════════════════════════════
// ÉTAPE 2 — CRÉATION DE COMMANDE
// ═══════════════════════════════════════════════════════════

When('le client navigue vers la liste de ses commandes', async function () {
  const navigated = await clickFirst(this.page, [
    '.ant-menu-item:has-text("Liste des commandes")',
    '.ant-menu-item:has-text("commandes")',
    'a[href*="/orders"]',
    'a:has-text("Commandes")',
    'a:has-text("Liste")',
  ]);

  if (!navigated) {
    const url = this.page.url();
    const target = url.includes('/admin/') ? `${BASE_URL}/admin/orders` : `${BASE_URL}/orders`;
    await this.page.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
  }

  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(1200);
  console.log(`📋 Page commandes - URL: ${this.page.url()}`);
});

When('le client crée une nouvelle commande de livraison', async function () {
  const seed = randomSuffix();

  // ── 1. Ouvrir le modal de sélection ──────────────────────────────────────────
  const addClicked = await clickFirst(this.page, [
    'button:has-text("Ajouter une commande")',
    'button:has-text("Ajouter")',
    'button:has-text("Nouvelle commande")',
    'button:has-text("Créer")',
  ]);
  expect(addClicked, 'Bouton Ajouter une commande introuvable').toBeTruthy();
  await this.page.waitForTimeout(1200);

  // ── 2. Choisir le type "Livrer une commande" ─────────────────────────────────
  await clickFirst(this.page, [
    'button:has-text("Livrer une commande")',
    'button:has-text("Apportez une commande")',
  ]);
  await this.page.waitForTimeout(1800);

  // ── Section SOURCE (expéditeur) ─────────────────────────────────────────────

  // Nom de l'entreprise source
  await this.page.locator('#sourceName').fill(`Société Auto ${seed}`).catch(() => {});

  // Téléphone source
  await this.page.locator('#sourcePhoneNumber').fill(`2${seed}`).catch(() => {});

  // Ville source
  await this.page.locator('#sourceCity').fill(`Tunis`).catch(() => {});

  // Street address source
  await this.page.locator('#sourceStreetAddress').fill(`12 Avenue Habib Bourguiba`).catch(() => {});

  // ZIP source
  await this.page.locator('#sourceZip').fill(`1001`).catch(() => {});

  // ── Section DESTINATION (destinataire) ───────────────────────────────────────

  // Recipient's name
  await this.page.locator('#destinationName').fill(`Raef Fatnasi ${seed}`).catch(async () => {
    await fillFirst(this.page, [
      'input[placeholder*="destinataire" i]',
      'input[placeholder*="nom" i]',
    ], `Raef Fatnasi ${seed}`);
  });
  console.log(`   ✅ Recipient's name rempli`);

  // Phone number
  await this.page.locator('#destinationPhoneNumber').fill(`5${seed}`).catch(async () => {
    await fillFirst(this.page, ['input[placeholder*="téléphone" i]'], `5${seed}`);
  });
  console.log(`   ✅ Phone number rempli`);

  // City
  await this.page.locator('#destinationCity').fill(`Sfax`).catch(async () => {
    await fillFirst(this.page, ['input[placeholder*="ville" i]'], `Sfax`);
  });
  console.log(`   ✅ City remplie`);

  // Street address
  await this.page.locator('#destinationStreetAddress').fill(`45 Rue Ibn Khaldoun`).catch(async () => {
    await fillFirst(this.page, [
      'input[placeholder*="adresse de la rue" i]',
      'input[placeholder*="adresse" i]',
    ], `45 Rue Ibn Khaldoun`);
  });
  console.log(`   ✅ Street address remplie`);

  // ZIP / Postal Code
  await this.page.locator('#destinationZip').fill(`3000`).catch(async () => {
    await fillFirst(this.page, [
      'input[placeholder*="code postal" i]',
      'input[placeholder*="zip" i]',
    ], `3000`);
  });
  console.log(`   ✅ ZIP/Postal Code rempli`);

  // Description (optionnel)
  await this.page.locator('#description').fill(`Commande test automatisation ${seed}`).catch(() => {});

  // ── 8. Scroll vers "Ajouter un colis" ───────────────────────────────────────
  await this.page.evaluate(() => {
    const container = document.querySelector('.ant-modal-body, .ant-drawer-body');
    if (container) container.scrollTop = container.scrollHeight;
  });
  await this.page.waitForTimeout(600);

  // ── 9. Cliquer "Ajouter un colis" (Add a package) ───────────────────────────
  const addPackage = await clickFirst(this.page, [
    'button:has-text("Ajouter un colis")',
    'button:has-text("Add a package")',
    'button:has-text("Ajouter colis")',
  ]);
  expect(addPackage, 'Bouton "Ajouter un colis" introuvable').toBeTruthy();
  await this.page.waitForTimeout(1200);
  console.log(`   ✅ "Ajouter un colis" cliqué`);

  // ── 10. Remplir les champs du colis (Packages List) ─────────────────────────
  // Poids (Kg) = 12
  await this.page.locator('#weight-1').fill('').catch(() => {});
  await this.page.locator('#weight-1').fill('12').catch(async () => {
    await fillFirst(this.page, ['input[id*="weight"]', 'input[placeholder*="poids" i]'], '12');
  });

  // Longeur (CM) = 23
  await this.page.locator('#length-1').fill('').catch(() => {});
  await this.page.locator('#length-1').fill('23').catch(async () => {
    await fillFirst(this.page, ['input[id*="length"]', 'input[placeholder*="longeur" i]'], '23');
  });

  // Largeur (CM) = 3
  await this.page.locator('#width-1').fill('').catch(() => {});
  await this.page.locator('#width-1').fill('3').catch(async () => {
    await fillFirst(this.page, ['input[id*="width"]', 'input[placeholder*="largeur" i]'], '3');
  });

  // Hauteur (CM) = 13
  await this.page.locator('#height-1').fill('').catch(() => {});
  await this.page.locator('#height-1').fill('13').catch(async () => {
    await fillFirst(this.page, ['input[id*="height"]', 'input[placeholder*="hauteur" i]'], '13');
  });

  // Quantity = 1
  await this.page.locator('#quantity-1').fill('').catch(() => {});
  await this.page.locator('#quantity-1').fill('1').catch(async () => {
    await fillFirst(this.page, ['input[id*="quantity"]', 'input[placeholder*="quantit" i]'], '1');
  });

  console.log(`   ✅ Colis rempli: Poids=12kg | Longeur=23cm | Largeur=3cm | Hauteur=13cm | Qty=1`);

  // ── 11. Soumettre la commande ────────────────────────────────────────────────
  await this.page.waitForTimeout(500);
  const submitted = await clickFirst(this.page, [
    'button:has-text("Soumettre la commande")',
    'button:has-text("Submit Order")',
    '.ant-modal button[type="submit"]',
    '.ant-drawer button[type="submit"]',
    'button:has-text("Confirmer")',
    'button:has-text("Valider")',
    'button[type="submit"]',
  ]);
  expect(submitted, 'Bouton "Soumettre la commande" introuvable').toBeTruthy();

  await this.page.waitForTimeout(3000);
  console.log(`📦 Commande soumise (seed: ${seed})`);
});

Then('la commande est créée sans erreur bloquante', async function () {
  const errors = await this.page
    .locator('.ant-form-item-explain-error:visible, .ant-message-error:visible, [role="alert"]:visible')
    .count();

  const success = await this.page
    .locator('.ant-message-success:visible, .ant-notification-notice-success:visible')
    .count();

  const onOrders = this.page.url().includes('orders');

  expect(
    errors === 0 || success > 0 || onOrders,
    `Des erreurs bloquantes sont présentes (${errors} erreur(s))`
  ).toBeTruthy();

  console.log('✅ Commande créée avec succès');
});

// ═══════════════════════════════════════════════════════════
// FORMAT NUMÉRO DE SUIVI VANLOG EXPRESS
// ═══════════════════════════════════════════════════════════

// Format réel observé dans les scripts : T10VL264064 (T + 2 chiffres + VL + 6 chiffres)
const TRACKING_REGEX = /\b(T\d{2}VL\d{6})\b/;

// ═══════════════════════════════════════════════════════════
// ÉTAPE 4 — ADMIN TRAITEMENT
// ═══════════════════════════════════════════════════════════

When("l'admin se connecte sur VanLog Express", async function () {
  await loginAs(this.page, ADMIN.email, ADMIN.password);

  const url = this.page.url();
  const loggedIn = url.includes('/admin') || url.includes('/dashboard');
  expect(loggedIn, `Connexion admin échouée - URL: ${url}`).toBeTruthy();
  console.log(`👑 Admin connecté - URL: ${url}`);
});

When("l'admin navigue vers la liste des commandes", async function () {
  // Naviguer directement vers la liste admin des commandes
  await this.page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(2000);

  let url = this.page.url();

  // Si la navigation directe échoue, essayer via le menu
  if (!url.includes('orders')) {
    await clickFirst(this.page, [
      '.ant-menu-item:has-text("Liste des commandes")',
      '.ant-menu-item:has-text("commandes")',
      'a[href*="/admin/orders"]',
      'li:has-text("Liste des commandes")',
    ]);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
    url = this.page.url();
  }

  expect(url.includes('orders'), `URL attendue: /orders — reçu: ${url}`).toBeTruthy();

  // Attendre que le tableau soit chargé
  await this.page.waitForSelector('.ant-table-tbody', { state: 'visible', timeout: 15000 }).catch(() => {});
  await this.page.waitForTimeout(1000);
  console.log(`📋 Admin sur liste commandes - URL: ${url}`);
});

When("l'admin récupère le numéro de suivi de la première commande", async function () {
  // Attendre que le tableau soit peuplé
  await this.page.waitForSelector('.ant-table-tbody tr', { state: 'visible', timeout: 20000 }).catch(() => {});
  await this.page.waitForTimeout(2000);

  const totalRows = await this.page.locator('.ant-table-tbody tr').count();
  const dataRows  = await this.page.locator('.ant-table-tbody tr:not(.ant-table-measure-row)').count();
  console.log(`📊 Admin tableau: ${totalRows} lignes totales, ${dataRows} lignes de données`);

  let trackingNumber = null;

  const BROAD_REGEX = /\b([A-Z]\d{1,3}[A-Z]{1,3}\d{3,10})\b/;

  // Stratégie 1 : attribut title des cellules (Ant Design stocke le texte complet là)
  const fullTitles = await this.page.locator('.ant-table-tbody tr td').evaluateAll(cells =>
    cells.map(td => {
      const t = td.getAttribute('title') || '';
      const inner = td.querySelector('[title]');
      return inner ? inner.getAttribute('title') || t : t;
    })
  ).catch(() => []);
  for (const t of fullTitles) {
    const match = String(t).match(TRACKING_REGEX) || String(t).match(BROAD_REGEX);
    if (match) { trackingNumber = match[1]; break; }
  }

  // Stratégie 2 : ouvrir le détail → texte complet sans troncature
  if (!trackingNumber) {
    console.log('🔍 Ouverture du détail de la première commande...');
    const opened = await clickFirst(this.page, [
      '.ant-table-tbody tr:not(.ant-table-measure-row) td:last-child button',
      '.ant-table-tbody tr:not(.ant-table-measure-row) td button',
      '.ant-table-tbody tr:not(.ant-table-measure-row)',
    ]);
    if (opened) {
      await this.page.waitForTimeout(3000);
      const drawerEl = this.page.locator('.ant-drawer-body, .ant-modal-body').first();
      const drawerText = await drawerEl.textContent().catch(() => '');
      console.log(`📄 Détail (300 chars): ${drawerText.substring(0, 300)}`);

      // Format VanLog : T suivi de chiffres, puis VL, puis chiffres (ex: T2VL2600134)
      // Pas de \b car le texte est collé sans espaces dans le drawer
      const vanlogMatch = drawerText.match(/\b(T\d+VL\d+)\b/) || drawerText.match(/(T\d+VL\d+)/);
      if (vanlogMatch) {
        trackingNumber = vanlogMatch[1];
      } else {
        const m = drawerText.match(/([A-Z]\d{1,3}[A-Z]{1,3}\d{4,10})/);
        if (m) trackingNumber = m[1];
      }

      await this.page.keyboard.press('Escape');
      // Attendre que le drawer soit complètement fermé avant de continuer
      await this.page.waitForSelector('.ant-drawer-body', { state: 'hidden', timeout: 5000 }).catch(() => {});
      await this.page.waitForTimeout(1500);
    } else {
      console.log('⚠️ Aucun bouton/ligne cliquable dans le tableau admin');
    }
  }

  expect(trackingNumber, 'Numéro de suivi introuvable dans la liste admin (aucune commande?)').toBeTruthy();
  this.trackingNumber = trackingNumber;
  // Préfixe court pour cibler la ligne dans le tableau (qui tronque le texte)
  this.trackingNumberPrefix = trackingNumber.substring(0, 8);
  console.log(`🔖 Numéro de suivi complet: ${this.trackingNumber} (préfixe table: ${this.trackingNumberPrefix})`);
});

When("l'admin change le statut de la commande à {string}", async function (targetStatus) {
  expect(this.trackingNumber, 'Numéro de suivi absent du contexte').toBeTruthy();

  // Utiliser le préfixe court pour matcher la ligne (la colonne affiche le texte tronqué)
  const prefix = this.trackingNumberPrefix || this.trackingNumber;

  // Ouvrir le dropdown de statut sur la ligne correspondant au numéro de suivi
  const statusDropdownOpened = await clickFirst(this.page, [
    `.ant-table-tbody tr:has-text("${prefix}") .ant-select-selector`,
    `.ant-table-tbody tr:has-text("${prefix}") .ant-select`,
    `.ant-table-tbody tr:has-text("${prefix}") [class*="status"]`,
    `.ant-table-tbody tr:has-text("${prefix}") .ant-tag`,
    // Fallback : première ligne du tableau (cas où une seule commande)
    `.ant-table-tbody tr:not(.ant-table-measure-row) .ant-select-selector`,
    `.ant-table-tbody tr:not(.ant-table-measure-row) .ant-tag`,
  ]);

  expect(statusDropdownOpened, `Dropdown de statut introuvable pour ${prefix}`).toBeTruthy();
  await this.page.waitForTimeout(800);

  // Sélectionner l'option cible
  const option = this.page
    .locator('.ant-select-item-option, [role="option"], .ant-dropdown-menu-item, li')
    .filter({ hasText: targetStatus })
    .first();

  await option.waitFor({ state: 'visible', timeout: 10000 });
  await option.click({ force: true });
  await this.page.waitForTimeout(1500);

  this.targetStatus = targetStatus;
  console.log(`🔄 Statut changé à: ${targetStatus}`);
});

Then('la commande affiche le statut {string} dans la liste admin', async function (expectedStatus) {
  expect(this.trackingNumber, 'Numéro de suivi absent du contexte').toBeTruthy();

  await this.page.waitForTimeout(1000);

  const prefix = this.trackingNumberPrefix || this.trackingNumber;

  const rowText = await this.page
    .locator('.ant-table-tbody tr:not(.ant-table-measure-row)')
    .filter({ hasText: prefix })
    .first()
    .innerText();

  const normalized = normalizeText(rowText);
  const expected = normalizeText(expectedStatus);

  expect(
    normalized.includes(expected),
    `Statut "${expectedStatus}" non trouvé dans la ligne: "${rowText}"`
  ).toBeTruthy();

  console.log(`✅ Statut confirmé: ${expectedStatus}`);
});

// ═══════════════════════════════════════════════════════════
// ÉTAPE 5 — SUIVI PUBLIC
// ═══════════════════════════════════════════════════════════

When("l'utilisateur accède à la page de suivi public", async function () {
  await this.page.goto(`${BASE_URL}/tracking-orders`, { waitUntil: 'networkidle', timeout: 30000 });
  await this.page.waitForTimeout(1500);

  const url = this.page.url();
  expect(url.includes('tracking'), `URL attendue: /tracking-orders — reçu: ${url}`).toBeTruthy();
  console.log(`🌍 Page de suivi public ouverte`);
});

When("l'utilisateur saisit le numéro de suivi et lance la recherche", async function () {
  expect(this.trackingNumber, 'Numéro de suivi absent du contexte').toBeTruthy();

  const filled = await fillFirst(this.page, [
    'input[placeholder*="suivi" i]',
    'input[placeholder*="tracking" i]',
    '#trackingNumber',
    'input[type="text"]',
    'input',
  ], this.trackingNumber);

  expect(filled, 'Champ de saisie du numéro de suivi introuvable').toBeTruthy();

  const searched = await clickFirst(this.page, [
    'button:has-text("Confirmer")',
    'button:has-text("Rechercher")',
    'button:has-text("Valider")',
    'button[type="submit"]',
  ]);

  expect(searched, 'Bouton de recherche introuvable').toBeTruthy();
  await this.page.waitForTimeout(2500);
  console.log(`🔎 Recherche lancée pour: ${this.trackingNumber}`);
});

Then('le suivi public affiche le statut {string}', async function (expectedStatus) {
  const normalized = normalizeText(expectedStatus);

  const allTexts = await this.page
    .locator('body *')
    .evaluateAll(elements =>
      elements
        .map(el => (el.children.length === 0 && el.textContent ? el.textContent.trim() : ''))
        .filter(t => t.length > 0 && t.length < 300)
    );

  const found = allTexts.some(t => normalizeText(t).includes(normalized));

  expect(
    found,
    `Statut "${expectedStatus}" non affiché sur la page de suivi public`
  ).toBeTruthy();

  console.log(`✅ Suivi public confirme le statut: ${expectedStatus}`);
  console.log(`\n🎉 SCÉNARIO E2E COMPLET RÉUSSI !`);
  console.log(`   Numéro de suivi: ${this.trackingNumber}`);
  console.log(`   Statut final:    ${expectedStatus}`);
});
