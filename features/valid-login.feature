# language: en
Feature: VanLog Express Authentication with Valid Accounts
  Test authentication with real valid accounts

  Background:
    Given I navigate to VanLog Express site

  @login @valid @admin
  Scenario: Login with Admin account
    When I fill the email field with "support@vanlog-express.com"
    And I fill the password field with "y8JzyLZ5Utcw7Q+n(CnQ"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see my user profile

  @login @valid @client
  Scenario: Login with Client account
    When I fill the email field with "raeffatnasi@gmail.com"
    And I fill the password field with "raef1234"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see my user profile


  @login @negative
  Scenario: Login with wrong password for admin
    When I fill the email field with "support@vanlog-express.com"
    And I fill the password field with "WrongPassword123"
    And I click the login button
    Then I should see an error message

  