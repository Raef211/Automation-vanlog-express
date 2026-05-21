# language: en
Feature: VanLog Express Home Page Navigation
  Test the navigation buttons and links on the home page

  Background:
    Given I am on VanLog Express home page

  @smoke @homepage
  Scenario: Verify home page navigation elements
    Then I should see the VanLog logo on homepage
    And I should see the signup link on homepage
    And I should see the tracking link on homepage
    And I should see the download APK button

  @homepage @navigation
  Scenario: Navigate to signup page from home
    When I click on the signup link
    Then I should be redirected to the signup page

  @homepage @navigation
  Scenario: Navigate to tracking page from home
    When I click on the tracking link
    Then I should be redirected to the tracking page

  @homepage @navigation
  Scenario: Click on forgot password link
    When I click on forgot password link
    Then I should see the password recovery form

  @homepage @download
  Scenario: Download APK button is functional
    When I click on the download APK button
    Then the APK download should be initiated

  @homepage @logo
  Scenario: Logo is clickable and redirects to home
    When I navigate to the signup page from home
    And I click on the VanLog logo
    Then I should be back on the home page
