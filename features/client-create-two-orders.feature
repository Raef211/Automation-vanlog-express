# language: fr
@client @orders-create
Fonctionnalité: Client - Création de 2 Commandes

  Contexte:
    Étant donné je suis sur la page de connexion

  @order-creation
  Scénario: Créer deux commandes client
    Quand je me connecte avec le compte client valide
    Et je vais vers la liste des commandes du client
    Quand je crée une nouvelle commande client
    Alors la création de commande client doit se terminer sans erreur bloquante
    Quand je crée une nouvelle commande client
    Alors la création de commande client doit se terminer sans erreur bloquante
