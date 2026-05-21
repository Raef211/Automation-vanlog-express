# language: fr
@client @profile @orders
Fonctionnalité: Client - Profil et commandes

  Contexte:
    Étant donné je suis sur la page de connexion

  @client-profile-orders
  Scénario: Modifier les coordonnées du client sans modifier le mot de passe puis tester les commandes
    Quand je me connecte avec le compte client valide
    Et je vais vers la page profil du client
    Et je modifie les coordonnées client sans modifier le mot de passe
    Alors le compte client doit rester actif
    Quand je vais vers la liste des commandes du client
    Alors la liste des commandes client doit être visible
    Quand je crée une nouvelle commande client
    Alors la création de commande client doit se terminer sans erreur bloquante
