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
    ],
    timeout: 60000,
    publishQuiet: true
  }
};
