module.exports = {
  default: {
    require: [
      'hooks/**/*.js',
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
      'allure-cucumberjs/reporter',
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 120000,
    exit: true,
    publishQuiet: true,
    dryRun: false,
    failFast: false,
  }
};