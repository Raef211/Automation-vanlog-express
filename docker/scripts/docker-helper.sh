#!/bin/bash

# Script de gestion Docker pour Playwright
# Usage: ./docker/scripts/docker-helper.sh [command]

set -e

DOCKER_COMPOSE_FILE="docker/docker-compose.yml"
IMAGE_NAME="playwright-tests"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions
print_usage() {
    echo "Docker Helper - Playwright Tests"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build                Build the Docker image"
    echo "  run                  Run Cucumber tests in Docker"
    echo "  run-headed           Run tests in headed mode"
    echo "  run-scenario <name>  Run specific scenario by name"
    echo "  run-newman           Run Newman/Postman tests"
    echo "  shell                Open a shell in the container"
    echo "  logs                 Show container logs"
    echo "  clean                Clean up containers and images"
    echo "  prune                Remove unused Docker resources"
    echo ""
}

build() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker build -f docker/Dockerfile -t $IMAGE_NAME .
    echo -e "${GREEN}Build completed!${NC}"
}

run_tests() {
    echo -e "${YELLOW}Running tests in headless mode...${NC}"
    docker run --rm -v $(pwd):/app $IMAGE_NAME npm run test:headless
}

run_headed() {
    echo -e "${YELLOW}Running tests in headed mode...${NC}"
    docker run --rm -v $(pwd):/app -e HEADLESS=false $IMAGE_NAME npm run test:headed
}

run_scenario() {
    local scenario=$1
    if [ -z "$scenario" ]; then
        echo -e "${RED}Error: scenario name required${NC}"
        exit 1
    fi
    echo -e "${YELLOW}Running scenario: $scenario${NC}"
    docker run --rm -v $(pwd):/app $IMAGE_NAME npm run test:headless -- --name "$scenario"
}

run_newman() {
    echo -e "${YELLOW}Running Newman tests...${NC}"
    docker run --rm -v $(pwd):/app $IMAGE_NAME npm run test:newman:e2e
}

open_shell() {
    echo -e "${YELLOW}Opening shell in container...${NC}"
    docker run --rm -it -v $(pwd):/app $IMAGE_NAME /bin/bash
}

show_logs() {
    echo -e "${YELLOW}Showing Docker logs...${NC}"
    docker logs -f playwright-tests 2>/dev/null || echo "No running containers"
}

clean_up() {
    echo -e "${YELLOW}Cleaning up Docker resources...${NC}"
    docker-compose -f $DOCKER_COMPOSE_FILE down -v --remove-orphans 2>/dev/null || true
    docker rmi $IMAGE_NAME 2>/dev/null || true
    echo -e "${GREEN}Cleanup completed!${NC}"
}

prune_resources() {
    echo -e "${YELLOW}Pruning Docker resources...${NC}"
    docker system prune -f
    echo -e "${GREEN}Prune completed!${NC}"
}

# Main
case "${1:-help}" in
    build)
        build
        ;;
    run)
        run_tests
        ;;
    run-headed)
        run_headed
        ;;
    run-scenario)
        run_scenario "$2"
        ;;
    run-newman)
        run_newman
        ;;
    shell)
        open_shell
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    prune)
        prune_resources
        ;;
    *)
        print_usage
        exit 0
        ;;
esac
