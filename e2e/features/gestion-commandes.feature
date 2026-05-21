@e2e
Feature: Gestion des commandes VANLOG

  @e2e
  Scenario: Création et gestion complète d'une commande
    Given utilisateur ouvre l'application VANLOG
    When utilisateur saisit email et mot de passe
    And clique sur le bouton "Se connecter"
    Then tableau de bord s'affiche

    When utilisateur clique sur menu "Commande"
    And clique sur bouton "Ajouter commande"
    Then formulaire de création commande s'affiche

    When utilisateur sélectionne client
    And saisit lieu de chargement
    And saisit lieu de livraison
    And sélectionne type de véhicule
    And saisit date de chargement
    And saisit date de livraison
    And saisit poids et volume
    And clique sur bouton "Enregistrer"
    Then commande est créée avec succès

    When utilisateur ouvre liste des commandes
    Then nouvelle commande apparaît dans tableau

    When utilisateur clique sur détail commande
    Then informations complètes de la commande s'affichent

    When utilisateur modifie statut commande
    And clique sur bouton "Mettre à jour"
    Then statut commande est mis à jour

    When utilisateur clique sur bouton "Supprimer"
    And confirme suppression
    Then commande est supprimée de la liste
