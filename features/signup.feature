# language: en
Feature: VanLog Express User Registration
  Test the signup and registration features of VanLog Express

  Background:
    Given I navigate to the signup page

  @smoke @signup
  Scenario: Verify signup page elements
    Then I should see the first name field
    And I should see the last name field
    And I should see the email field on signup
    And I should see the phone field
    And I should see the password field on signup
    And I should see the confirm password field
    And I should see the terms checkbox
    And I should see the signup button

  @signup @negative
  Scenario: Signup with mismatched passwords
    When I fill the first name with "Marie"
    And I fill the last name with "Martin"
    And I fill the signup email with "marie.martin@test.com"
    And I fill the phone with "0623456789"
    And I fill the signup password with "Password123!"
    And I fill the confirm password with "DifferentPassword!"
    And I accept the terms and conditions
    And I click the signup button
    Then I should see a password mismatch error

  @signup @negative
  Scenario: Signup with existing email
    When I fill the first name with "Pierre"
    And I fill the last name with "Durand"
    And I fill the signup email with "support@vanlog-express.com"
    And I fill the phone with "0634567890"
    And I fill the signup password with "Password123!"
    And I fill the confirm password with "Password123!"
    And I accept the terms and conditions
    And I click the signup button
    Then I should see an email exists error

  @signup @validation
  Scenario: Password strength validation - weak password
    When I fill the signup password with "123"
    Then I should see a weak password indicator

  @signup @validation
  Scenario: Password strength validation - strong password
    When I fill the signup password with "SecurePass123!@#"
    Then I should see a strong password indicator
