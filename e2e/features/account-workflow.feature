# language: fr
@e2e @account-workflow
Fonctionnalité: E2E - Création Compte Client, Approbation Admin, Connexion

  Ce scénario couvre le flux complet de gestion de compte :
  1. Un nouveau client s'inscrit sur VanLog Express
  2. L'admin approuve le compte depuis le panneau d'administration
  3. Le nouveau client se reconnecte et accède à son tableau de bord

  @account-workflow
  Scénario: Créer un compte client, l'approuver en admin, puis se connecter

    # ── ÉTAPE 1 : Inscription du nouveau client ──────────────────────────────────
    Étant donné le nouvel utilisateur accède à la page d'inscription
    Quand le nouvel utilisateur sélectionne le type "Client"
    Et le nouvel utilisateur remplit tous les champs d'inscription
    Et le nouvel utilisateur soumet le formulaire d'inscription
    Alors le compte est créé sans erreur de validation

    # ── ÉTAPE 2 : Admin approuve le compte ───────────────────────────────────────
    Quand l'admin se connecte pour gérer les comptes
    Et l'admin navigue vers la liste des comptes en attente d'approbation
    Et l'admin recherche le nouveau compte par email
    Et l'admin accepte le compte en attente
    Alors le compte est approuvé avec succès

    # ── ÉTAPE 3 : Connexion avec le nouveau compte ───────────────────────────────
    Quand le nouvel utilisateur retourne sur la page de connexion
    Et le nouvel utilisateur se connecte avec ses identifiants créés
    Alors le nouvel utilisateur accède à son tableau de bord
