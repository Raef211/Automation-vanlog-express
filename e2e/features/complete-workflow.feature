# language: fr
@e2e @complete-workflow
Fonctionnalité: Processus E2E Complet - Création et Suivi de Commande VanLog Express

  Ce scénario couvre le flux métier complet de bout en bout :
  1. Le client se connecte et crée une commande
  2. Le système génère un numéro de suivi
  3. L'admin change le statut de la commande
  4. La page de suivi public reflète le nouveau statut

  @complete-workflow
  Scénario: Flux complet création commande → admin traitement → suivi public
    # ── ÉTAPE 1 : Connexion client ──────────────────────────────────────────────
    Étant donné le client ouvre VanLog Express
    Quand le client se connecte avec ses identifiants valides
    Alors le client est redirigé vers son tableau de bord

    # ── ÉTAPE 2 : Création de commande ──────────────────────────────────────────
    Quand le client navigue vers la liste de ses commandes
    Et le client crée une nouvelle commande de livraison
    Alors la commande est créée sans erreur bloquante

    # ── ÉTAPE 3 : Admin se connecte et récupère le numéro de suivi ──────────────
    Quand l'admin se connecte sur VanLog Express
    Et l'admin navigue vers la liste des commandes
    Et l'admin récupère le numéro de suivi de la première commande

    # ── ÉTAPE 4 : L'admin change le statut ──────────────────────────────────────
    Et l'admin change le statut de la commande à "Livré"
    Alors la commande affiche le statut "Livré" dans la liste admin

    # ── ÉTAPE 5 : Vérification du suivi public ───────────────────────────────────
    Quand l'utilisateur accède à la page de suivi public
    Et l'utilisateur saisit le numéro de suivi et lance la recherche
    Alors le suivi public affiche le statut "Livré"
