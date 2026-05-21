# language: fr
Fonctionnalité: Dashboard Admin - Navigation et Sections

  Contexte:
    Étant donné que je suis sur la page de connexion
    Quand je me connecte avec le compte admin
    Alors je devrais être redirigé vers le dashboard

  @dashboard @menu
  Scénario: Vérifier la présence de tous les menu items
    Alors je devrais voir le menu item "Tableau de bord"
    Et je devrais voir le menu item "Liste des commandes"
    Et je devrais voir le menu item "Liste des transporteurs"
    Et je devrais voir le menu item "Liste des clients"
    Et je devrais voir le menu item "Factures"
    Et je devrais voir le menu item "Réclamations"
    Et je devrais voir le menu item "Suivi des commandes"

  @dashboard @menu
  Scénario: Vérifier que Tableau de bord est sélectionné par défaut
    Alors le menu item "Tableau de bord" devrait être sélectionné

  @dashboard @navigation
  Scénario: Naviguer vers Liste des commandes
    Quand je clique sur le menu item "Liste des commandes"
    Alors l'URL devrait contenir "/admin/orders"
    Et le titre de la page devrait être "Page - Liste des commandes"
    Et le menu item "Liste des commandes" devrait être sélectionné

  @dashboard @navigation
  Scénario: Naviguer vers Liste des transporteurs
    Quand je clique sur le menu item "Liste des transporteurs"
    Alors l'URL devrait contenir "/admin/transporters"
    Et le titre de la page devrait être "Page - Liste des transporteurs"
    Et le menu item "Liste des transporteurs" devrait être sélectionné

  @dashboard @navigation
  Scénario: Naviguer vers Liste des clients
    Quand je clique sur le menu item "Liste des clients"
    Alors l'URL devrait contenir "/admin/providers"
    Et le titre de la page devrait être "Page - Liste des clients"
    Et le menu item "Liste des clients" devrait être sélectionné

  @dashboard @navigation
  Scénario: Naviguer vers Factures
    Quand je clique sur le menu item "Factures"
    Alors l'URL devrait contenir "/admin/invoices"
    Et le titre de la page devrait être "Page - Factures"
    Et le menu item "Factures" devrait être sélectionné

  @dashboard @navigation
  Scénario: Naviguer vers Réclamations
    Quand je clique sur le menu item "Réclamations"
    Alors l'URL devrait contenir "/admin/complaints"
    Et le titre de la page devrait être "Page - Réclamations"
    Et le menu item "Réclamations" devrait être sélectionné

  @dashboard @navigation
  Scénario: Naviguer vers Suivi des commandes
    Quand je clique sur le menu item "Suivi des commandes"
    Alors l'URL devrait contenir "/admin/track-orders"
    Et le titre de la page devrait être "Page - Suivi des commandes"
    Et le menu item "Suivi des commandes" devrait être sélectionné

  @dashboard @home
  Scénario: Vérifier les éléments du Tableau de bord
    Alors je devrais voir le titre "Page - Tableau de bord"
    Et je devrais voir la carte "Statistiques des commandes"
    Et je devrais voir la carte "Statistiques des utilisateurs"
    Et je devrais voir le profil utilisateur "Vanlog Express"

  @dashboard @orders
  Scénario: Vérifier les éléments de Liste des commandes
    Quand je clique sur le menu item "Liste des commandes"
    Alors je devrais voir le bouton "Ajouter une commande"
    Et je devrais voir le champ de recherche avec placeholder "Chercher avec numéro de suivi"
    Et je devrais voir un tableau avec les colonnes "Numéro de suivi, Date de création, Statut"

  @dashboard @transporters
  Scénario: Vérifier les éléments de Liste des transporteurs
    Quand je clique sur le menu item "Liste des transporteurs"
    Alors je devrais voir le champ de recherche avec placeholder "Chercher avec email"
    Et je devrais voir un tableau avec les colonnes "Nom de livreur, Date d'inscription, Action"

  @dashboard @clients
  Scénario: Vérifier les éléments de Liste des clients
    Quand je clique sur le menu item "Liste des clients"
    Alors je devrais voir le champ de recherche avec placeholder "Chercher avec email"
    Et je devrais voir un tableau avec les colonnes "Nom du client, Date d'inscription, Actions"

  @dashboard @invoices
  Scénario: Vérifier les éléments de Factures
    Quand je clique sur le menu item "Factures"
    Alors je devrais voir le titre "Générer des factures de  l'entreprise"
    Et je devrais voir le bouton "Générer la Facture"
    Et je devrais voir le champ "Date de début"
    Et je devrais voir le champ "Date de fin"

  @dashboard @complaints
  Scénario: Vérifier les éléments de Réclamations
    Quand je clique sur le menu item "Réclamations"
    Alors je devrais voir le champ de recherche avec placeholder "Rechercher par sujet"

  @dashboard @tracking
  Scénario: Vérifier les éléments de Suivi des commandes
    Quand je clique sur le menu item "Suivi des commandes"
    Alors je devrais voir le titre "Suivez votre commande"
    Et je devrais voir le champ avec id "trackingNumber"
    Et je devrais voir le bouton "Confirmer"

  @dashboard @logout
  Scénario: Vérifier le bouton de déconnexion
    Alors je devrais voir le bouton "Déconnexion"
