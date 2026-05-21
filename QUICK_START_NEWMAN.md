# 🚀 DÉMARRAGE RAPIDE - Newman + Cucumber Reports

## ✅ Configuration Complète

Votre système est maintenant configuré pour générer **rapports Newman et Cucumber** automatiquement!

---

## 📋 Commandes Essentielles

### 1️⃣ **Tests Complets avec Rapports**
```bash
npm run test:all
```
Exécute:
- ✅ Tests Cucumber (BDD/Scénarios)
- ✅ Tests Newman (API/Postman)
- ✅ Génère résumé récapitulatif
- 📂 Tous les rapports dans `reports/`

**Durée**: ~5-10 minutes selon le nombre de tests

---

### 2️⃣ **Tests + Ouvrir les Rapports**
```bash
npm run test:all && npm run test:reports:open
```
Après test, ouvre automatiquement:
- 📊 Rapport Cucumber (BDD)
- 📊 Rapport Newman (API)
- 📋 Résumé des tests

---

### 3️⃣ **Tests Séparés**

#### Tests Cucumber uniquement:
```bash
npm run test:headless           # Mode sans interface
npm run test:headed            # Mode avec navigateur visible
```

#### Tests Newman uniquement:
```bash
npm run test:postman:newman        # Standard
npm run test:postman:newman:verbose  # Avec détails
```

---

## 📁 Rapports Générés

Après `npm run test:all`, vous obtenez:

```
reports/
├── 📊 cucumber-report.html          ← Ouvrir dans navigateur
│   └── Scénarios BDD avec captures d'écran
├── 📊 postman/newman-report.html    ← Ouvrir dans navigateur
│   └── Tests API avec détails des requêtes
├── 📋 TEST_SUMMARY.txt
│   └── Résumé en texte (stats globales)
└── 📄 cucumber-report.json
    └── Données brutes (pour CI/CD)

screenshots/
├── 📸 Scenario_name_2026-05-21...png  (✅ Succès)
└── 📸 Scenario_name_failed...png      (❌ Échec avec horodatage)
```

---

## 🎯 Guide Rapide par Cas d'Usage

### 📌 Je teste avant un déploiement
```bash
npm run test:all
npm run test:reports:open
```
Puis ouvrir les rapports HTML dans le navigateur.

### 📌 Je débogue un scénario
```bash
npm run test:headed            # Voir le navigateur
```
Regarder les étapes en direct.

### 📌 Je veux juste les rapports API
```bash
npm run test:postman:newman
# Rapport généré: reports/postman/newman-report.html
```

### 📌 Je veux un mode verbeux (debug)
```bash
npm run test:all:verbose
npm run test:postman:newman:verbose
```

### 📌 Je veux ouvrir les résultats précédents
```bash
npm run test:reports:open
```

---

## 🔍 Que Trouve-t-on dans les Rapports?

### Rapport Cucumber (`cucumber-report.html`)
- ✅ **Scénarios**: Status PASS/FAIL
- 📸 **Captures d'écran**: Automatiques sur les erreurs
- ⏱️ **Timing**: Durée de chaque étape
- 📝 **Erreurs**: Messages détaillés
- 🏷️ **Tags**: @admin, @client, etc.

### Rapport Newman (`reports/postman/newman-report.html`)
- 🔌 **Requêtes API**: GET, POST, PUT, DELETE
- ✔️ **Assertions**: Validations réussies/échouées
- ⏱️ **Performance**: Temps de réponse
- 📊 **Status**: Codes HTTP (200, 400, 500, etc.)
- 📋 **Données**: Contenu des requêtes et réponses

---

## ⚙️ Configuration personnalisée

### Personnaliser la base URL
Éditer `postman/local.postman_environment.json`:
```json
{
  "base_url": "http://localhost:3000",
  "username": "admin@test.com",
  "password": "your_password"
}
```

### Ajouter/Modifier des tests Cucumber
Éditer les fichiers `.feature` dans `features/`:
```gherkin
Fonctionnalité: Mon Test API
  Scénario: Appel API valide
    Quand j'appelle l'endpoint GET /api/users
    Alors la réponse devrait être 200
```

---

## 📞 Aide & Dépannage

### ❓ Newman ne génère pas de rapport
```bash
# Vérifier l'installation
npm list newman
npm list newman-reporter-htmlextra

# Recréer le dossier
mkdir -p reports/postman
```

### ❓ Rapport Cucumber vide
```bash
# Vérifier les features
ls features/

# Relancer avec verbose
npm run test:headless
```

### ❓ Voir les détails des erreurs
```bash
npm run test:postman:newman:verbose  # Newman verbose
npm run test:headed                  # Voir navigateur
```

---

## 📚 Documentation Complète

Pour plus de détails, voir: `NEWMAN_REPORTS_GUIDE.md`

```bash
cat NEWMAN_REPORTS_GUIDE.md
```

---

## 🎓 Prochaines Étapes

1. **Exécutez vos premiers tests**:
   ```bash
   npm run test:all
   ```

2. **Consultez les rapports**:
   ```bash
   npm run test:reports:open
   ```

3. **Personnalisez pour votre besoin**:
   - Ajouter des scénarios Cucumber
   - Modifier les tests Postman
   - Ajuster la configuration Newman

4. **Intégrez au CI/CD** (GitLab, GitHub, Jenkins):
   - Voir `NEWMAN_REPORTS_GUIDE.md` → "Intégration Continue"

---

## 🚀 Vous êtes Prêt!

Votre système de test est maintenant complet:

✅ Tests Cucumber BDD avec captures d'écran  
✅ Tests Newman API avec rapports HTML  
✅ Rapports récapitulatifs automatiques  
✅ Scripts pour CI/CD  

**Commençons!** 🎯

```bash
npm run test:all
```

Bonne chance! 🍀
