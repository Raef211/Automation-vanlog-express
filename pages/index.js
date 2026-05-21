/**
 * Index des Pages Object Model (POM)
 * Facilite l'import de toutes les pages dans les step definitions
 */

const { BasePage } = require('./BasePage');
const { LoginPage } = require('./LoginPage');
const { SignupPage } = require('./SignupPage');
const { TrackingPage } = require('./TrackingPage');
const { DashboardPage } = require('./DashboardPage');

module.exports = {
  BasePage,
  LoginPage,
  SignupPage,
  TrackingPage,
  DashboardPage,
};
