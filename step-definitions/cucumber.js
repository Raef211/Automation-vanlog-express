module.exports = {
  default: {
    require: [
      '../hooks/**/*.js',
      '../e2e/hooks/**/*.js',
      '../step-definitions/**/*-steps.js',
      '../e2e/step-definitions/**/*-steps.js'
    ],
    paths: ['../features/**/*.feature', '../e2e/features/**/*.feature'],
    format: [
      'progress',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html'
    ],
    publishQuiet: true,
  }
};
