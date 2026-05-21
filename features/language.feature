# language: en
Feature: Language Switching - French and English
  Test the language toggle between French (FR) and English (EN) on VanLog Express

  Background:
    Given I am on the VanLog Express login page

  @language @smoke
  Scenario: Default language is French
    Then the language flag should show "Français"
    And the login button should display "Se connecter"
    And the navigation bar should display "Suivi des commandes"
    And the navigation bar should display "Se Connecter"
    And the navigation bar should display "S'inscrire"

  @language @switch
  Scenario: Switch language from French to English
    When I open the language dropdown
    And I select "English" language
    Then the language flag should show "English"
    And the login button should display "Log in"
    And the navigation bar should display "Tracking Orders"
    And the navigation bar should display "Login"
    And the navigation bar should display "Signup"

  @language @switch
  Scenario: Switch language from English back to French
    When I open the language dropdown
    And I select "English" language
    Then the login button should display "Log in"
    When I open the language dropdown
    And I select "Français" language
    Then the language flag should show "Français"
    And the login button should display "Se connecter"
    And the navigation bar should display "Suivi des commandes"

  @language @labels
  Scenario: Verify form labels in French
    Then the form should have a label "Email"
    And the form should have a label "Mot de passe"

  @language @labels
  Scenario: Verify form labels in English
    When I open the language dropdown
    And I select "English" language
    Then the form should have a label "Email"
    And the form should have a label "Password"

  @language @dropdown
  Scenario: Current language is disabled in dropdown
    When I open the language dropdown
    Then the "Français" option should be disabled in the language dropdown
    And the "English" option should be enabled in the language dropdown
