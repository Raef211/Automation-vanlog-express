# language: en
Feature: Navigation Bar Buttons
  Test the navigation bar buttons present on all auth pages (login, signup, tracking)

  Background:
    Given I am on the VanLog Express login page

  @navbar @navigation
  Scenario: Verify navigation bar buttons are visible on login page
    Then I should see the "Suivi des commandes" button in the navigation bar
    And I should see the "Se Connecter" button in the navigation bar
    And I should see the "S'inscrire" button in the navigation bar

  @navbar @navigation
  Scenario: Navigate to tracking page from navigation bar
    When I click on "Suivi des commandes" in the navigation bar
    Then I should be on the tracking orders page
    And the "Suivi des commandes" button should be active in the navigation bar

  @navbar @navigation
  Scenario: Navigate to signup page from navigation bar
    When I click on "S'inscrire" in the navigation bar
    Then I should be on the signup page
    And the "S'inscrire" button should be active in the navigation bar

  @navbar @navigation
  Scenario: Navigate to login page from navigation bar on tracking page
    When I click on "Suivi des commandes" in the navigation bar
    And I click on "Se Connecter" in the navigation bar
    Then I should be on the login page
    And the "Se Connecter" button should be active in the navigation bar

  @navbar @navigation
  Scenario: Navigate between all pages using navigation bar
    When I click on "Suivi des commandes" in the navigation bar
    Then I should be on the tracking orders page
    When I click on "S'inscrire" in the navigation bar
    Then I should be on the signup page
    When I click on "Se Connecter" in the navigation bar
    Then I should be on the login page

  @navbar @navigation
  Scenario: Verify navigation bar is present on tracking page
    When I click on "Suivi des commandes" in the navigation bar
    Then I should see the "Suivi des commandes" button in the navigation bar
    And I should see the "Se Connecter" button in the navigation bar
    And I should see the "S'inscrire" button in the navigation bar

  @navbar @navigation
  Scenario: Verify navigation bar is present on signup page
    When I click on "S'inscrire" in the navigation bar
    Then I should see the "Suivi des commandes" button in the navigation bar
    And I should see the "Se Connecter" button in the navigation bar
    And I should see the "S'inscrire" button in the navigation bar
