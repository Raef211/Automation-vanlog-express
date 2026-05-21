# 📊 Guide des Rapports Newman & Cucumber

## 🎯 Commandes de Test

### Tests Cucumber (BDD/UI)
```bash
npm run test                    # Tests standards
npm run test:headless         # Mode headless (sans navigateur visuel)
npm run test:headed           # Mode avec navigateur visible
npm run test:ui               # Tests UI uniquement
```

### Tests Newman (API/Postman)
```bash
npm run test:postman:newman          # Rapports JSON + HTML
npm run test:postman:newman:verbose  # Avec détails verbeux
```

### Tests Combinés (Cucumber + Newman)
```bash
npm run test:all              # Tests Cucumber + Newman + Rapport récapitulatif
npm run test:all:verbose      # Même chose avec mode verbeux
```

### Ouvrir les Rapports
```bash
npm run test:reports:open     # Ouvre les rapports dans le navigateur
```

---

## 📁 Structure des Rapports

Après exécution des tests, les rapports sont générés dans:

```
reports/
├── cucumber-report.html           ✅ Rapport Cucumber (BDD)
├── cucumber-report.json           📊 Données Cucumber
├── TEST_SUMMARY.txt               📋 Résumé récapitulatif
└── postman/
    ├── newman-report.html         ✅ Rapport Newman (API)
    ├── newman-results.json        📊 Données Newman
    └── (autres rapports)

screenshots/
├── Scenario_name_2026-05-21T14-36-13-408Z.png        ✅ Succès
├── Scenario_name_failed_assertion_2026-05-21...png   ❌ Échec (avec raison)
└── (horodatage automatique)
```

---

## 🔍 Contenu des Rapports

### 1️⃣ Rapport Cucumber (cucumber-report.html)
- **Scénarios**: Liste complète des scénarios BDD
- **Étapes**: Chaque étape avec statut (✅ Pass / ❌ Fail)
- **Captures d'écran**: Images des scénarios échoués
- **Temps d'exécution**: Durée de chaque étape
- **Détails**: Messages d'erreur détaillés

**Ouvrir directement:**
```bash
start reports\cucumber-report.html  # Windows
open reports/cucumber-report.html   # macOS
xdg-open reports/cucumber-report.html  # Linux
```

### 2️⃣ Rapport Newman (reports/postman/newman-report.html)
- **Requêtes API**: État de chaque appel API
- **Assertions**: Tests de validation des réponses
- **Temps de réponse**: Performances API
- **Données de réponse**: Contenu brut des réponses
- **Erreurs**: Messages d'erreur des requêtes

**Ouvrir directement:**
```bash
start reports\postman\newman-report.html
```

### 3️⃣ Résumé Récapitulatif (TEST_SUMMARY.txt)
Affiche:
- ✅ Scénarios Cucumber réussis/échoués
- ✅ Requêtes Newman réussies/échouées  
- 📊 Taux de réussite en pourcentage
- 🔗 Liens vers tous les rapports

---

## 💡 Cas d'Usage

### ✅ Avant un déploiement
```bash
npm run test:all
npm run test:reports:open
```
Génère un rapport complet Cucumber + Newman, puis ouvre les résultats.

### ✅ Tests rapides en développement
```bash
npm run test:headless
npm run test:postman:newman
```
Tests rapides sans interface graphique.

### ✅ Tests interactifs (debug)
```bash
npm run test:headed
```
Voir le navigateur en action pour investiguer les problèmes.

### ✅ CI/CD Pipeline
```bash
npm run test:all
# Exporte JSON pour traitement externe
cat reports/TEST_SUMMARY.txt
```

---

## 📊 Fichiers de Données

### Données Cucumber (cucumber-report.json)
```json
[
  {
    "name": "Feature Name",
    "elements": [
      {
        "name": "Scenario Name",
        "steps": [
          {
            "name": "Step description",
            "result": { "status": "passed" }
          }
        ]
      }
    ]
  }
]
```

### Données Newman (newman-results.json)
```json
{
  "run": {
    "stats": {
      "tests": { "total": 50, "failed": 2 },
      "requests": { "total": 50 },
      "assertions": { "total": 120, "failed": 3 }
    },
    "failures": [ /* détails des erreurs */ ]
  }
}
```

---

## 🐛 Débogage

### Si Newman ne génère pas de rapports
1. Vérifier que `newman` est installé:
   ```bash
   npm list newman
   npm list newman-reporter-htmlextra
   ```

2. Vérifier la collection Postman:
   ```bash
   ls postman/TUNLOG_full_postman_collection.json
   ```

3. Vérifier le dossier reports existe:
   ```bash
   mkdir -p reports/postman
   ```

### Si les captures d'écran ne s'affichent pas
1. Vérifier que le dossier `screenshots/` existe
2. Vérifier que les fichiers `.png` sont présents
3. Les captures sont automatiquement attachées au rapport Cucumber

### Résoudre les erreurs Newman
```bash
npm run test:postman:newman:verbose  # Mode verbeux pour voir les détails
```

---

## 🚀 Intégration Continue

Pour GitLab CI/GitHub Actions, ajouter:

```yaml
# .gitlab-ci.yml ou .github/workflows/test.yml
test:
  script:
    - npm install
    - npm run test:all
  artifacts:
    paths:
      - reports/
      - screenshots/
    reports:
      junit: reports/cucumber-report.json
```

---

## 📞 Support

- **Problèmes Cucumber**: Voir `reports/cucumber-report.html`
- **Problèmes API**: Voir `reports/postman/newman-report.html`
- **Résumé rapide**: Voir `reports/TEST_SUMMARY.txt`
- **Captures d'écran**: Voir `screenshots/` (noms avec horodatage)
