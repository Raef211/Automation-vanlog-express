# language: fr
Fonctionnalité: Dashboard Admin - Gestion des Commandes

  Contexte:
    Étant donné je suis sur la page de connexion
    Quand je me connecte avec le compte admin
    Et je clique sur le menu item "Liste des commandes"
    Alors l'URL devrait contenir "/admin/orders"

  @orders @add-order
  Scénario: Vérifier le bouton Ajouter une commande
    Alors je devrais voir le bouton "Ajouter une commande"

  @orders @add-order @modal
  Scénario: Ouvrir le modal de sélection d'action
    Quand je clique sur le bouton "Ajouter une commande"
    Alors je devrais voir le modal "Sélection d'action de commande"
    Et je devrais voir le bouton "Livrer une commande"
    Et je devrais voir le bouton "Apportez une commande"

  @orders @search
  Scénario: Vérifier le champ de recherche
    Alors je devrais voir le champ de recherche avec placeholder "Chercher avec numéro de suivi"

  @orders @status
  Scénario: Vérifier le dropdown de statut
    Alors je devrais voir au moins un dropdown de statut

  @orders @status
  Scénario: Vérifier les options de statut
    Quand je clique sur le premier dropdown de statut
    Alors je devrais voir l'option "Non suivi"
    Et je devrais voir l'option "En attente"
    Et je devrais voir l'option "En transit"
    Et je devrais voir l'option "Livré"
    Et je devrais voir l'option "Annulé"

  @orders @table
  Scénario: Vérifier les colonnes du tableau
    Alors le tableau devrait avoir les colonnes "Numéro de suivi, Date de création, Nom du destinataire, Statut"

  @orders @pagination
  Scénario: Vérifier la pagination
    Alors la pagination devrait être visible
    Et la pagination devrait afficher le nombre total de commandes

  @orders @count
  Scénario: Vérifier le compteur de commandes
    Alors je devrais voir le texte "Nombre total des commandes"
    Et le compteur devrait afficher le nombre de commandes

