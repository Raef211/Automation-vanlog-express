# Docker Configuration - Playwright Test Automation

Cette configuration Docker permet de containeriser et exécuter vos tests Playwright/Cucumber.

## Fichiers Docker

- **Dockerfile** : Image Docker multi-stage pour exécuter les tests
- **docker-compose.yml** : Orchestration des services (tests Playwright, Newman, application)
- **.dockerignore** : Fichiers/dossiers à exclure de l'image Docker
- **.env.example** : Variables d'environnement pour la configuration

## Prérequis

- Docker Desktop (Windows) ou Docker Engine (Linux/Mac)
- docker-compose v3.8+

## Construction de l'image

```bash
# Depuis la racine du projet
docker build -f docker/Dockerfile -t playwright-tests .

# Avec docker-compose
docker-compose -f docker/docker-compose.yml build
```

## Exécution des tests

### Option 1 : Exécution directe avec Docker

```bash
# Tests Cucumber en mode headless
docker run --rm -v %cd%:/app playwright-tests npm run test:headless

# Tests Cucumber mode headed (avec interface)
docker run --rm -v %cd%:/app -e HEADLESS=false playwright-tests npm run test:headed

# Tests spécifiques (par nom de scénario)
docker run --rm -v %cd%:/app playwright-tests npm run test:headless -- --name "Nom du scénario"
```

### Option 2 : Exécution avec docker-compose

```bash
# Exécuter tous les services
docker-compose -f docker/docker-compose.yml up --build

# Exécuter uniquement les tests Playwright
docker-compose -f docker/docker-compose.yml up --build playwright

# Exécuter uniquement les tests Newman/Postman
docker-compose -f docker/docker-compose.yml --profile postman up newman

# Arrêter les services
docker-compose -f docker/docker-compose.yml down
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` basé sur `.env.example` :

```bash
cp docker/.env.example .env
```

Configurez les variables :
- `HEADLESS` : Mode headless (true/false)
- `BASE_URL` : URL de base (http://localhost:3000)
- `TIMEOUT` : Timeout des tests
- `PARALLEL_WORKERS` : Nombre de workers Cucumber

### Volumes

Les volumes montés permettent :
- Accès au code source depuis le conteneur
- Récupération des rapports et screenshots
- Vidéos d'exécution en cas d'échec

```yaml
volumes:
  - ..:/app                           # Code source
  - ./reports:/app/reports            # Rapports JSON/HTML
  - ./screenshots:/app/screenshots    # Screenshots
  - ./videos:/app/videos              # Vidéos
```

## Commandes utiles

```bash
# Voir les logs
docker-compose -f docker/docker-compose.yml logs -f playwright

# Exécuter une commande personnalisée
docker-compose -f docker/docker-compose.yml run playwright npm run test:ui

# Arrêter les services proprement
docker-compose -f docker/docker-compose.yml down -v

# Nettoyer les images
docker image prune -a

# Lister les conteneurs
docker ps -a
```

## Rapports

Après l'exécution, les rapports sont disponibles :
- **Cucumber HTML** : `reports/cucumber-report.html`
- **Cucumber JSON** : `reports/cucumber-report.json`
- **Newman HTML** : `reports/newman/e2e-processus-livraison.html`
- **Screenshots** : `screenshots/`
- **Vidéos** : `videos/`

## Troubleshooting

### Erreur : "Cannot find module"
```bash
# Reconstruire l'image
docker-compose -f docker/docker-compose.yml build --no-cache
```

### Erreur : "Port already in use"
```bash
# Vérifier les conteneurs
docker ps

# Tuer le conteneur
docker kill <container_id>
```

### Erreur : Playwright browser not found
```bash
# Regénérer l'image avec installation des navigateurs
docker-compose -f docker/docker-compose.yml build --no-cache --progress=plain
```

### Accès à l'application non disponible
Vérifier que le service `app` est correctement configuré dans `docker-compose.yml` avec la bonne URL et port.

## Production

Pour une utilisation en CI/CD :

```bash
# GitLab CI
docker build -f docker/Dockerfile -t playwright:latest .
docker run --rm playwright:latest npm run test:headless

# GitHub Actions
# Voir les exemples dans DOCKER_CI_CD_EXAMPLES.md
```

## Ressources supplémentaires

- [Dockerfile Documentation](DOCKER_FILES.md)
- [docker-compose Guide](../DOCKER_GUIDE.md)
- [CI/CD Examples](../DOCKER_CI_CD_EXAMPLES.md)
- [Playwright Docs](https://playwright.dev)
- [Cucumber Docs](https://cucumber.io)
