module.exports = {
  default: {
    require: [
      'hooks/**/*.js',
      'e2e/hooks/**/*.js',
      'e2e/step-definitions/**/*-steps.js',
      'step-definitions/**/*-steps.js',
      '!step-definitions/cucumber.js'
    ],
    paths: [
      'features/**/*.feature'
    ],
    format: [
      'progress',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html',
      'usage:reports/cucumber-usage.txt',
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 120000,
    publishQuiet: true,
    dryRun: false,
    failFast: false,
  }
};