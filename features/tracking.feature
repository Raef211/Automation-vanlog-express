# language: en
Feature: Suivez votre commande - Track Your Order
  Test the order tracking functionality on VanLog Express

  Background:
    Given I am on the tracking orders page

  @tracking @smoke
  Scenario: Verify tracking page elements
    Then I should see the title "Suivez votre commande"
    And I should see the tracking number input field
    And I should see the label "Numero de suivi de votre commande"
    And I should see the "Confirmer" submit button

  @tracking @validation
  Scenario: Submit empty tracking form
    When I click the "Confirmer" button without entering a tracking number
    Then I should see the validation error "Champs requis"

  @tracking @validation
  Scenario: Submit tracking form with invalid number
    When I enter the tracking number "INVALID123"
    And I click the "Confirmer" button
    Then the tracking form should be submitted
    And I should stay on the tracking page

  @tracking @validation
  Scenario: Submit tracking form with a valid tracking number
    When I enter the tracking number "E53VL261486"
    And I click the "Confirmer" button
    Then the tracking form should be submitted
    And I should stay on the tracking page

  @tracking @navigation
  Scenario: Navigate to tracking page from login page
    Given I am on the VanLog Express login page
    When I click on "Suivi des commandes" in the navigation bar
    Then I should be on the tracking orders page
    And I should see the title "Suivez votre commande"

  @tracking @input
  Scenario: Verify tracking number input accepts text
    When I enter the tracking number "TEST12345"
    Then the tracking number input should contain "TEST12345"

  @tracking @input
  Scenario: Clear and re-enter tracking number
    When I enter the tracking number "FIRST123"
    And I clear the tracking number input
    And I enter the tracking number "SECOND456"
    Then the tracking number input should contain "SECOND456"
