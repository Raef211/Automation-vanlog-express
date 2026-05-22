FROM node:24-slim

LABEL maintainer="raeffatnasi@gmail.com"

WORKDIR /app

# Copy package files first to leverage layer caching
COPY package.json package-lock.json ./

# Install Node dependencies (--legacy-peer-deps matches CI behaviour)
RUN npm install --legacy-peer-deps

# Install Chromium and all required OS-level dependencies
RUN npx playwright install --with-deps chromium

# Copy project source
COPY . .

# Pre-create output directories so volume mounts work without root
RUN mkdir -p reports screenshots videos allure-results allure-report playwright-report test-results

# Defaults — override at runtime with -e BASE_URL=... etc.
ENV HEADLESS=true
ENV BASE_URL=https://vanlog-express.com
ENV CI=true

# Declare mount points for generated test artefacts
VOLUME ["/app/reports", "/app/screenshots", "/app/videos", \
        "/app/allure-results", "/app/allure-report", \
        "/app/playwright-report", "/app/test-results"]

# Run headless Cucumber tests by default
CMD ["npm", "test"]
