# Build stage
FROM node:20-slim as builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Installation des dépendances système pour Playwright
RUN npx playwright install-deps

# Installer les navigateurs Playwright
RUN npx playwright install

# Production stage
FROM node:20-slim

WORKDIR /app

# Installer les dépendances système nécessaires pour Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copier les dépendances du stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /root/.cache /root/.cache

# Copier le code source
COPY . .

# Créer les répertoires de rapports
RUN mkdir -p reports/cucumber reports/newman screenshots videos

# Variable d'environnement pour Playwright
ENV HEADLESS=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false

# Commande par défaut : exécuter les tests
CMD ["npm", "run", "test:headless"]
