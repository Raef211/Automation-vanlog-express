@e2e
Feature: Inscription client VANLOG

  @e2e
  Scenario: Création d'un compte utilisateur
    Given utilisateur ouvre la plateforme VANLOG
    When utilisateur clique sur "S'inscrire"
    And saisit le prénom "Raef"
    And saisit le nom "Fatnasi"
    And saisit le nom de l'entreprise "TEST"
    And saisit l'email "raeffatnasi@gmail.com"
    And saisit le mot de passe
    And confirme le mot de passe
    And sélectionne le code région "Tunisia (+216)"
    And saisit le numéro de téléphone
    And clique sur le bouton d'inscription
    Then message "Approbation du compte en attente" s'affiche
    And utilisateur voit le message de validation du compte
    And bouton "Quitter / Login" est affiché
