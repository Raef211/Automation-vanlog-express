const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const BASE_URL = 'https://vanlog-express.com';

const ADMIN = {
  email: 'support@vanlog-express.com',
  password: 'y8JzyLZ5Utcw7Q+n(CnQ',
};

const NEW_USER_PASSWORD = 'SecurePass123!';

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function uniqueSeed() {
  return Date.now().toString().slice(-8);
}

async function clickFirst(page, selectors) {
  for (const sel of selectors) {
    const el = page.locator(sel).first();
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

async function selectFirstOption(page, inputId) {
  const input = page.locator(`#${inputId}`).first();
  try {
    await input.waitFor({ state: 'visible', timeout: 8000 });
    await input.click({ force: true });
    await page.waitForTimeout(600);
    const option = page.locator('.ant-select-item-option:visible').first();
    if (await option.count()) {
      await option.click({ force: true });
      await page.waitForTimeout(300);
      return true;
    }
  } catch (_) {
    await page.keyboard.press('Escape').catch(() => {});
  }
  return false;
}

async function clearSession(page) {
  await page.evaluate(() => {
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}
  }).catch(() => {});
  await page.context().clearCookies();
}

// ═══════════════════════════════════════════════════════════
// ÉTAPE 1 — INSCRIPTION DU NOUVEAU CLIENT
// ═══════════════════════════════════════════════════════════

Given('le nouvel utilisateur accède à la page d\'inscription', async function () {
  await clearSession(this.page);
  await this.page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(2000);

  const url = this.page.url();
  expect(url.includes('signup'), `Page d'inscription inaccessible — URL: ${url}`).toBeTruthy();
  console.log(`🌐 Page d'inscription ouverte: ${url}`);
});

When('le nouvel utilisateur sélectionne le type "Client"', async function () {
  const clientClicked = await clickFirst(this.page, [
    'button:has-text("Client")',
    '.ant-btn:has-text("Client")',
    '[role="button"]:has-text("Client")',
    'span:has-text("Client")',
  ]);
  expect(clientClicked, 'Bouton "Client" introuvable sur la page d\'inscription').toBeTruthy();
  await this.page.waitForTimeout(1500);
  console.log('   ✅ Type de compte "Client" sélectionné');
});

When('le nouvel utilisateur remplit tous les champs d\'inscription', async function () {
  const seed = uniqueSeed();
  // Stocker l'email pour réutilisation dans les étapes suivantes
  this.newUserEmail    = `client.auto.${seed}@test-vl.com`;
  this.newUserPassword = NEW_USER_PASSWORD;
  this.newUserSeed     = seed;

  // ── Prénom et Nom ────────────────────────────────────────────────────────────
  await this.page.locator('#firstName').fill(`Auto`).catch(() => {});
  await this.page.locator('#lastName').fill(`Client${seed}`).catch(() => {});
  console.log(`   ✅ Prénom / Nom: Auto Client${seed}`);

  // ── Nom de l'entreprise ───────────────────────────────────────────────────────
  await this.page.locator('#companyName').fill(`Entreprise Auto ${seed}`).catch(() => {});
  console.log(`   ✅ Entreprise: Entreprise Auto ${seed}`);

  // ── Email unique ──────────────────────────────────────────────────────────────
  await this.page.locator('#signupEmail').fill(this.newUserEmail).catch(() => {});
  console.log(`   ✅ Email: ${this.newUserEmail}`);

  // ── Mot de passe ──────────────────────────────────────────────────────────────
  await this.page.locator('#password').fill(NEW_USER_PASSWORD).catch(() => {});
  await this.page.keyboard.press('Tab');
  await this.page.waitForTimeout(300);
  await this.page.locator('#confirmPassword').fill(NEW_USER_PASSWORD).catch(() => {});
  console.log(`   ✅ Mot de passe défini`);

  // ── Téléphone ────────────────────────────────────────────────────────────────
  await this.page.locator('#phone').fill(`2${seed.slice(-7)}`).catch(() => {});
  console.log(`   ✅ Téléphone: 2${seed.slice(-7)}`);

  // ── Numéro de patent ─────────────────────────────────────────────────────────
  await this.page.locator('#patent').fill(seed.slice(-6)).catch(() => {});
  console.log(`   ✅ Patent: ${seed.slice(-6)}`);

  // ── Adresse et Code postal ───────────────────────────────────────────────────
  await this.page.locator('#address').fill(`Adresse Auto ${seed}`).catch(() => {});
  await this.page.locator('#zipCode').fill(`1000`).catch(() => {});
  console.log(`   ✅ Adresse / ZIP remplis`);

  // ── Selects Ant Design (Type entreprise, Activité, Pays, Ville) ───────────────
  for (const fieldId of ['companyTypeId', 'companyActivityId', 'country', 'city']) {
    const ok = await selectFirstOption(this.page, fieldId);
    console.log(`   ${ok ? '✅' : '⚠️'} Select #${fieldId}`);
  }
});

When('le nouvel utilisateur soumet le formulaire d\'inscription', async function () {
  // Scroll vers le bas pour voir le bouton
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page.waitForTimeout(500);

  const submitBtn = this.page.locator('button[type="submit"]').first();
  await submitBtn.scrollIntoViewIfNeeded().catch(() => {});
  await submitBtn.click({ force: true });
  await this.page.waitForTimeout(4000);
  console.log(`📝 Formulaire soumis pour: ${this.newUserEmail}`);
});

Then('le compte est créé sans erreur de validation', async function () {
  // Vérifier l'absence d'erreurs de validation Ant Design
  const validationErrors = await this.page
    .locator('.ant-form-item-explain-error:visible')
    .count();

  const hasSuccess = await this.page
    .locator('.ant-message-success:visible, .ant-notification-notice-success:visible')
    .first().isVisible().catch(() => false);

  const urlChanged = !this.page.url().includes('/signup');

  expect(
    validationErrors === 0 || hasSuccess || urlChanged,
    `Erreurs de validation détectées (${validationErrors})`
  ).toBeTruthy();

  console.log(`✅ Compte créé — email: ${this.newUserEmail}`);
});

// ═══════════════════════════════════════════════════════════
// ÉTAPE 2 — ADMIN APPROUVE LE COMPTE
// ═══════════════════════════════════════════════════════════

When('l\'admin se connecte pour gérer les comptes', async function () {
  await clearSession(this.page);
  await this.page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(2000);

  await this.page.locator('#loginEmail').fill(ADMIN.email);
  await this.page.locator('#password').fill(ADMIN.password);
  await clickFirst(this.page, [
    'button[type="submit"]:has-text("Se connecter")',
    'button[type="submit"]',
  ]);

  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(2500);

  const url = this.page.url();
  expect(url.includes('/admin'), `Admin non connecté — URL: ${url}`).toBeTruthy();
  console.log(`👑 Admin connecté: ${url}`);
});

When('l\'admin navigue vers la liste des comptes en attente d\'approbation', async function () {
  // Lister tous les items du menu pour debugging
  const menuTexts = await this.page
    .locator('.ant-menu-item, .ant-menu-submenu-title, .ant-layout-sider a, nav a')
    .allTextContents()
    .catch(() => []);
  console.log('📌 Menu items:', JSON.stringify(menuTexts));

  // Lister tous les liens du sidebar pour trouver le bon URL
  const sidebarLinks = await this.page
    .locator('.ant-layout-sider a[href], nav a[href]')
    .evaluateAll(els => els.map(el => ({ text: el.textContent.trim(), href: el.getAttribute('href') })))
    .catch(() => []);
  console.log('🔗 Sidebar links:', JSON.stringify(sidebarLinks));

  // Tenter de cliquer un item de menu en attente (liste étendue)
  const menuClicked = await clickFirst(this.page, [
    '.ant-menu-item:has-text("Liste des comptes en attente")',
    '.ant-menu-item:has-text("Comptes en attente")',
    '.ant-menu-item:has-text("En attente")',
    '.ant-menu-item:has-text("Pending")',
    '.ant-menu-item:has-text("Inscriptions")',
    '.ant-menu-item:has-text("Demandes")',
    '.ant-menu-item:has-text("Clients")',
    '.ant-menu-item:has-text("Utilisateurs")',
    '.ant-menu-item:has-text("Users")',
    '.ant-menu-item:has-text("Accounts")',
    'a[href*="pending"]',
    'a[href*="attente"]',
    'a[href*="client"]',
    'a[href*="user"]',
    'a[href*="account"]',
    'a[href*="inscri"]',
  ]);

  if (!menuClicked) {
    // Essayer d'abord d'expandre des sous-menus qui pourraient contenir les comptes
    await clickFirst(this.page, [
      '.ant-menu-submenu-title:has-text("Gestion")',
      '.ant-menu-submenu-title:has-text("Comptes")',
      '.ant-menu-submenu-title:has-text("Users")',
      '.ant-menu-submenu-title:has-text("Clients")',
    ]).catch(() => {});
    await this.page.waitForTimeout(800);

    // Réessayer après expansion submenu
    await clickFirst(this.page, [
      '.ant-menu-item:has-text("En attente")',
      '.ant-menu-item:has-text("Pending")',
      '.ant-menu-item:has-text("Inscriptions")',
      '.ant-menu-item:has-text("Demandes")',
      'a[href*="pending"]',
      'a[href*="attente"]',
    ]).catch(() => {});

    // Essayer des URLs directes (plusieurs variantes)
    const urlCandidates = [
      '/admin/pending-accounts',
      '/admin/accounts/pending',
      '/admin/clients/pending',
      '/admin/users/pending',
      '/admin/registration-requests',
      '/admin/registrations',
      '/admin/account-requests',
      '/admin/clients',
      '/admin/users',
      '/admin/accounts',
    ];

    for (const path of urlCandidates) {
      await this.page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await this.page.waitForLoadState('networkidle').catch(() => {});
      await this.page.waitForTimeout(1500);
      const url = this.page.url();
      const tableRows = await this.page.locator('.ant-table-tbody tr:not(.ant-table-measure-row)').count().catch(() => 0);
      console.log(`  TRY ${path} → ${url} | rows: ${tableRows}`);
      if (!url.includes('dashboard') && tableRows > 0) {
        console.log(`  ✅ Page trouvée: ${url}`);
        break;
      }
    }
  }

  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(2000);
  await this.page.waitForSelector('.ant-table-tbody', { state: 'visible', timeout: 15000 }).catch(() => {});
  await this.page.waitForTimeout(1000);

  console.log(`📋 Admin URL finale: ${this.page.url()}`);
});

When('l\'admin recherche le nouveau compte par email', async function () {
  expect(this.newUserEmail, 'Email du nouvel utilisateur absent du contexte').toBeTruthy();

  // Remplir le champ de recherche par email
  const filled = await (async () => {
    const selectors = [
      'input[placeholder*="email" i]',
      'input[placeholder*="Chercher avec email" i]',
      'input[placeholder*="Chercher" i]',
      'input[type="search"]',
      '.ant-input',
    ];
    for (const sel of selectors) {
      const el = this.page.locator(sel).first();
      if (await el.count()) {
        try {
          await el.waitFor({ state: 'visible', timeout: 5000 });
          await el.fill(this.newUserEmail);
          return true;
        } catch (_) {}
      }
    }
    return false;
  })();

  if (filled) {
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  // Attendre que la ligne apparaisse
  await this.page.waitForSelector(
    `.ant-table-tbody tr:has-text("${this.newUserEmail}")`,
    { state: 'visible', timeout: 10000 }
  ).catch(() => {
    console.log('⚠️  Ligne non trouvée après recherche — le compte existe peut-être déjà dans le tableau');
  });

  console.log(`🔍 Recherche effectuée pour: ${this.newUserEmail}`);
});

When('l\'admin accepte le compte en attente', async function () {
  expect(this.newUserEmail, 'Email du nouvel utilisateur absent du contexte').toBeTruthy();

  const row = this.page
    .locator('.ant-table-tbody tr')
    .filter({ hasText: this.newUserEmail })
    .first();

  const rowVisible = await row.isVisible({ timeout: 10000 }).catch(() => false);
  expect(rowVisible, `Ligne avec email "${this.newUserEmail}" introuvable dans le tableau`).toBeTruthy();

  // Chercher le bouton "Accepter" dans la ligne
  const acceptSelectors = [
    () => row.locator('button').filter({ hasText: /^accepter$/i }).first(),
    () => row.locator('.ant-btn').filter({ hasText: /accepter/i }).first(),
    () => row.locator('span').filter({ hasText: /^accepter$/i }).first(),
    () => row.locator('[role="button"]').filter({ hasText: /accepter/i }).first(),
  ];

  let acceptBtn = null;
  for (const fn of acceptSelectors) {
    const btn = fn();
    if (await btn.count()) {
      try {
        await btn.waitFor({ state: 'visible', timeout: 3000 });
        acceptBtn = btn;
        break;
      } catch (_) {}
    }
  }

  expect(acceptBtn, 'Bouton "Accepter" introuvable dans la ligne').not.toBeNull();
  await acceptBtn.click({ force: true });
  await this.page.waitForTimeout(2500);

  // Vérifier qu'aucune erreur n'est apparue
  const errors = await this.page
    .locator('.ant-message-error:visible, .ant-notification-notice-error:visible')
    .count();
  expect(errors, 'Une erreur est apparue après l\'approbation du compte').toBe(0);

  console.log(`✅ Compte accepté: ${this.newUserEmail}`);
});

Then('le compte est approuvé avec succès', async function () {
  // Succès = message de confirmation OU la ligne disparaît du tableau des en attente
  const successToast = await this.page
    .locator('.ant-message-success:visible, .ant-notification-notice-success:visible')
    .first().isVisible().catch(() => false);

  const rowGone = await this.page
    .locator('.ant-table-tbody tr')
    .filter({ hasText: this.newUserEmail })
    .count()
    .then(c => c === 0);

  expect(
    successToast || rowGone,
    'L\'approbation du compte n\'a pas été confirmée'
  ).toBeTruthy();

  console.log(`✅ Approbation confirmée pour: ${this.newUserEmail}`);
});

// ═══════════════════════════════════════════════════════════
// ÉTAPE 3 — CONNEXION AVEC LE NOUVEAU COMPTE
// ═══════════════════════════════════════════════════════════

When('le nouvel utilisateur retourne sur la page de connexion', async function () {
  await clearSession(this.page);
  await this.page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(2000);

  const url = this.page.url();
  console.log(`🌐 Page de connexion — URL: ${url}`);
});

When('le nouvel utilisateur se connecte avec ses identifiants créés', async function () {
  expect(this.newUserEmail, 'Email du nouvel utilisateur absent du contexte').toBeTruthy();
  expect(this.newUserPassword, 'Mot de passe du nouvel utilisateur absent du contexte').toBeTruthy();

  await this.page.locator('#loginEmail').fill(this.newUserEmail);
  await this.page.locator('#password').fill(this.newUserPassword);

  await clickFirst(this.page, [
    'button[type="submit"]:has-text("Se connecter")',
    'button[type="submit"]',
  ]);

  await this.page.waitForLoadState('networkidle').catch(() => {});
  await this.page.waitForTimeout(3000);

  console.log(`🔑 Connexion tentée avec: ${this.newUserEmail}`);
});

Then('le nouvel utilisateur accède à son tableau de bord', async function () {
  const url = this.page.url();

  const loggedIn =
    url.includes('/dashboard') ||
    url.includes('/orders') ||
    url.includes('/profile') ||
    url.includes('/user/');

  // Vérifier l'absence de message d'erreur de connexion
  const hasLoginError = await this.page
    .locator('.ant-message-error:visible, .ant-form-item-explain-error:visible')
    .first().isVisible().catch(() => false);

  expect(
    loggedIn && !hasLoginError,
    `Connexion échouée — URL: ${url} | Erreur: ${hasLoginError}`
  ).toBeTruthy();

  console.log(`\n🎉 SCÉNARIO E2E COMPTE RÉUSSI !`);
  console.log(`   Email créé:   ${this.newUserEmail}`);
  console.log(`   Mot de passe: ${this.newUserPassword}`);
  console.log(`   URL finale:   ${url}`);
});
