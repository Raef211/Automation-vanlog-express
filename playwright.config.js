// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuration Playwright pour le projet d'automatisation POM
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Dossier des tests
  testDir: './tests',

  // Exécuter les tests en parallèle
  fullyParallel: true,

  // Reporter pour les résultats
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  // Configuration partagée pour tous les tests
  use: {
    // URL de base pour les tests
    baseURL: 'https://vanlog-express.com',

    // Capturer des screenshots en cas d'échec
    screenshot: 'only-on-failure',

    // Enregistrer une vidéo en cas d'échec
    video: 'retain-on-failure',

    // Capturer la trace en cas d'échec
    trace: 'retain-on-failure',

    // Viewport par défaut
    viewport: { width: 1280, height: 720 },
  },

  // Configuration des projets (navigateurs)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Dossier de sortie pour les artefacts
  outputDir: 'test-results/',

  // Timeout global pour les tests
  timeout: 30000,

  // Timeout pour les expect
  expect: {
    timeout: 5000,
  },

  // Nombre de retries en cas d'échec
  retries: 1,
});
