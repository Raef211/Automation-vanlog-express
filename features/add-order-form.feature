# language: fr
@add-order-form
Fonctionnalité: Formulaire Ajouter une commande - Remplissage complet

  Contexte:
    Étant donné je suis sur la page de connexion
    Quand je me connecte avec le compte admin
    Et je clique sur le menu item "Liste des commandes"
    Et je clique sur le bouton "Ajouter une commande"

  @deliver @form-open
  Scénario: Ouvrir le formulaire Livrer une commande
    Quand je clique sur le bouton "Livrer une commande"
    Alors je devrais voir le formulaire de commande actif

  @deliver @required
  Scénario: Vérifier les validations obligatoires du formulaire livraison
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je clique sur le bouton soumettre du formulaire actif
    Alors je devrais voir au moins une erreur de validation active

  @deliver @fill-form
  Scénario: Remplir complètement le formulaire livraison
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire livraison complet
    Alors le formulaire actif ne doit pas afficher d'erreur bloquante

  @deliver @submit-success
  Scénario: Soumettre une commande livraison
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire livraison complet
    Et je clique sur le bouton soumettre du formulaire actif
    Alors la soumission devrait se terminer sans erreur bloquante

  @bring @form-open
  Scénario: Ouvrir le formulaire Apportez une commande
    Quand je clique sur le bouton "Apportez une commande"
    Alors je devrais voir le formulaire de commande actif

  @bring @required
  Scénario: Vérifier les validations obligatoires du formulaire apport
    Quand je clique sur le bouton "Apportez une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je clique sur le bouton soumettre du formulaire actif
    Alors je devrais voir au moins une erreur de validation active

  @bring @fill-form
  Scénario: Remplir complètement le formulaire apport
    Quand je clique sur le bouton "Apportez une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire apport complet
    Alors le formulaire actif ne doit pas afficher d'erreur bloquante

  @bring @submit-success
  Scénario: Soumettre une commande apport
    Quand je clique sur le bouton "Apportez une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis le formulaire apport complet
    Et je clique sur le bouton soumettre du formulaire actif
    Alors la soumission devrait se terminer sans erreur bloquante

  @form-cancel
  Scénario: Fermer le formulaire sans soumission
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Quand je ferme le formulaire actif
    Alors le formulaire actif devrait être fermé

  @dropdown
  Scénario: Afficher les options de gouvernorat dans le formulaire
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Alors je devrais voir la liste des gouvernorats du formulaire actif
    Et la liste des gouvernorats devrait contenir au moins une option

  @deliver @negative
  Scénario: Soumettre avec des caractères spéciaux non autorisés
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis les champs avec des caractères spéciaux non autorisés
    Et je clique sur le bouton soumettre du formulaire actif
    Alors je devrais voir au moins une erreur de validation active

  @deliver @edgecase
  Scénario: Soumettre avec des chaînes de caractères très longues
    Quand je clique sur le bouton "Livrer une commande"
    Et j'attends que le formulaire de commande actif soit prêt
    Et je remplis les champs avec des chaînes très longues du formulaire actif
    Et je clique sur le bouton soumettre du formulaire actif
    Alors le formulaire actif ne doit pas afficher d'erreur bloquante
