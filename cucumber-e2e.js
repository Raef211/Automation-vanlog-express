module.exports = {
  default: {
    require: [
      'e2e/hooks/**/*.js',
      'e2e/step-definitions/**/*.js'
    ],
    paths: [
      'e2e/features/**/*.feature'
    ],
    format: [
      'progress',
      'json:reports/cucumber-e2e-report.json',
      'html:reports/cucumber-e2e-report.html',
      'allure-cucumberjs/reporter',
    ],
    formatOptions: {
      resultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results'
    },
    timeout: 60000,
    publishQuiet: true
  }
};
