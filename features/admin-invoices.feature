# language: fr
Fonctionnalité: Gestion des factures admin (client et livreur)

  Contexte:
    Étant donné que je suis sur la page de connexion
    Quand je me connecte avec le compte admin
    Et je clique sur le menu item "Factures"
    Alors l'URL devrait contenir "/admin/invoices"

  @admin-invoices @client
  Scénario: Gérer une facture pour un client
    Quand je sélectionne le type utilisateur "client" dans Factures
    Et je renseigne la période facture du "2026-03-01" au "2026-03-24"
    Et je génère la facture admin
    Alors l'action facture devrait se terminer sans erreur bloquante

