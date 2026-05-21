# language: fr
Fonctionnalité: Tests de scénarios négatifs et positifs pour l'ajout de commande

  Contexte:
    Étant donné je suis sur la page de connexion
    Quand je me connecte avec le compte admin
    Et je clique sur le menu item "Liste des commandes"
    Et je clique sur le bouton "Ajouter une commande"

  @negative @empty-form
  Scénario: Soumettre un formulaire vide sans saisir les champs obligatoires
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je clique sur le bouton soumettre du formulaire actif
    Alors je devrais voir au moins une erreur de validation active
    Et les erreurs de validation doivent contenir les champs obligatoires

  @negative @partial-form
  Scénario: Remplir partiellement le formulaire et soumettre
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire avec des données partielles
    Et je clique sur le bouton soumettre du formulaire actif
    Alors je devrais voir au moins une erreur de validation active

  @negative @invalid-phone
  Scénario: Soumettre avec un numéro de téléphone invalide
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis les champs texte avec "TestUser"
    Et je remplis les champs numérique avec des données invalides
    Et je clique sur le bouton soumettre du formulaire actif
    Alors je devrais voir au moins une erreur de validation

  @negative @special-characters
  Scénario: Soumettre avec des caractères spéciaux non autorisés
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire avec des caractères spéciaux
    Et je clique sur le bouton soumettre du formulaire actif
    Alors je devrais voir une erreur de validation ou de paramètre invalide

  @negative @form-browser-close
  Scénario: Fermer le navigateur pendant la saisie du formulaire
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Alors le formulaire ne doit pas avoir d'erreur de connexion navigateur
    Et je devrais pouvoir continuer à interagir avec le formulaire

  @negative @long-input
  Scénario: Soumettre avec des chaînes de caractères très longues
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis les champs avec des chaînes très longues
    Et je clique sur le bouton soumettre du formulaire actif
    Alors le formulaire devrait gérer les longues chaînes correctement

  @positive @complete-flow
  Scénario: Flux complet de création d'une commande "Livrer"
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire livraison complet
    Et je clique sur le bouton soumettre du formulaire actif
    Alors la soumission devrait se terminer sans erreur bloquante

  @positive @complete-flow-apport
  Scénario: Flux complet de création d'une commande "Apportez"
    Quand je clique sur le bouton "Apportez une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire apport complet
    Et je clique sur le bouton soumettre du formulaire actif
    Alors la soumission devrait se terminer sans erreur bloquante
