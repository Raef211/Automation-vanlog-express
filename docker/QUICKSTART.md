# Docker Quickstart - Playwright Tests

Guide rapide pour démarrer avec Docker.

## Installation préalable

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac)
- ou [Docker Engine](https://docs.docker.com/engine/install/) (Linux)

## Démarrage rapide (30 secondes)

### Sur Windows (PowerShell)

```powershell
# 1. Construire l'image
docker build -f docker/Dockerfile -t playwright-tests .

# 2. Exécuter les tests
docker run --rm -v ${PWD}:/app playwright-tests npm run test:headless

# OU avec le script helper
.\docker\scripts\docker-helper.ps1 build
.\docker\scripts\docker-helper.ps1 run
```

### Sur macOS/Linux (Terminal)

```bash
# 1. Construire l'image
docker build -f docker/Dockerfile -t playwright-tests .

# 2. Exécuter les tests
docker run --rm -v $(pwd):/app playwright-tests npm run test:headless

# OU avec le script helper
./docker/scripts/docker-helper.sh build
./docker/scripts/docker-helper.sh run
```

## Cas d'usage courants

### Exécuter un scénario spécifique

```bash
# Windows (PowerShell)
.\docker\scripts\docker-helper.ps1 run-scenario "Nom du scénario"

# macOS/Linux
./docker/scripts/docker-helper.sh run-scenario "Nom du scénario"
```

### Mode headed (avec interface)

```bash
# Windows
.\docker\scripts\docker-helper.ps1 run-headed

# macOS/Linux
./docker/scripts/docker-helper.sh run-headed
```

### Développement local

```bash
# Avec docker-compose et hot-reload
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up dev
```

### Tests Postman/Newman

```bash
# Windows
.\docker\scripts\docker-helper.ps1 run-newman

# macOS/Linux
./docker/scripts/docker-helper.sh run-newman

# Ou avec docker-compose
docker-compose -f docker/docker-compose.yml --profile postman up newman
```

### Shell interactif

```bash
# Windows
.\docker\scripts\docker-helper.ps1 shell

# macOS/Linux
./docker/scripts/docker-helper.sh shell
```

## Variables d'environnement

Créer un fichier `docker/.env` :

```env
# Mode d'exécution
HEADLESS=true

# URL de l'application
BASE_URL=http://localhost:3000

# Timeout (ms)
TIMEOUT=30000

# Nombre de workers
PARALLEL_WORKERS=4
```

## Rapports

Après exécution, consultez :
- `reports/cucumber-report.html` - Rapport Cucumber
- `reports/newman/` - Rapports Newman/Postman
- `screenshots/` - Screenshots des échecs
- `videos/` - Vidéos des exécutions

## Dépannage rapide

| Problème | Solution |
|----------|----------|
| "Permission denied" | `chmod +x docker/scripts/docker-helper.sh` |
| "Cannot find module" | `docker build -f docker/Dockerfile --no-cache -t playwright-tests .` |
| "Port already in use" | `docker ps -q \| xargs -r docker kill` |
| Playwright not found | Reconstruire: `docker build --no-cache -f docker/Dockerfile -t playwright-tests .` |

## Prochaines étapes

- [Documentation complète](README.md)
- [CI/CD Configuration](../DOCKER_CI_CD_EXAMPLES.md)
- [Commandes Docker avancées](../DOCKER_COMMANDS.md)
- [Meilleures pratiques](../DOCKER_BEST_PRACTICES.md)
