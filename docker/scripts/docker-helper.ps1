# Script PowerShell de gestion Docker pour Playwright
# Usage: .\docker\scripts\docker-helper.ps1 -Command "build"

param(
    [Parameter(Position = 0)]
    [string]$Command = "help",
    
    [Parameter(Position = 1)]
    [string]$Argument = ""
)

$DOCKER_COMPOSE_FILE = "docker/docker-compose.yml"
$IMAGE_NAME = "playwright-tests"

function Print-Usage {
    Write-Host "Docker Helper - Playwright Tests" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker\scripts\docker-helper.ps1 [command] [argument]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  build                 Build the Docker image"
    Write-Host "  run                   Run Cucumber tests in Docker"
    Write-Host "  run-headed            Run tests in headed mode"
    Write-Host "  run-scenario <name>   Run specific scenario by name"
    Write-Host "  run-newman            Run Newman/Postman tests"
    Write-Host "  shell                 Open a shell in the container"
    Write-Host "  logs                  Show container logs"
    Write-Host "  clean                 Clean up containers and images"
    Write-Host "  prune                 Remove unused Docker resources"
    Write-Host ""
}

function Invoke-Build {
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    & docker build -f docker/Dockerfile -t $IMAGE_NAME .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed!" -ForegroundColor Green
    }
    else {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
}

function Invoke-RunTests {
    Write-Host "Running tests in headless mode..." -ForegroundColor Yellow
    $pwd = Get-Location
    & docker run --rm -v "$($pwd)`:C:/app" $IMAGE_NAME npm run test:headless
}

function Invoke-RunHeaded {
    Write-Host "Running tests in headed mode..." -ForegroundColor Yellow
    $pwd = Get-Location
    & docker run --rm -v "$($pwd)`:C:/app" -e HEADLESS=false $IMAGE_NAME npm run test:headed
}

function Invoke-RunScenario {
    param(
        [string]$Scenario
    )
    if ([string]::IsNullOrEmpty($Scenario)) {
        Write-Host "Error: scenario name required" -ForegroundColor Red
        exit 1
    }
    Write-Host "Running scenario: $Scenario" -ForegroundColor Yellow
    $pwd = Get-Location
    & docker run --rm -v "$($pwd)`:C:/app" $IMAGE_NAME npm run test:headless -- --name "$Scenario"
}

function Invoke-RunNewman {
    Write-Host "Running Newman tests..." -ForegroundColor Yellow
    $pwd = Get-Location
    & docker run --rm -v "$($pwd)`:C:/app" $IMAGE_NAME npm run test:newman:e2e
}

function Invoke-Shell {
    Write-Host "Opening shell in container..." -ForegroundColor Yellow
    $pwd = Get-Location
    & docker run --rm -it -v "$($pwd)`:C:/app" $IMAGE_NAME powershell
}

function Show-Logs {
    Write-Host "Showing Docker logs..." -ForegroundColor Yellow
    & docker logs -f playwright-tests 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "No running containers" -ForegroundColor Gray
    }
}

function Invoke-Cleanup {
    Write-Host "Cleaning up Docker resources..." -ForegroundColor Yellow
    & docker-compose -f $DOCKER_COMPOSE_FILE down -v --remove-orphans 2>$null | Out-Null
    & docker rmi $IMAGE_NAME 2>$null | Out-Null
    Write-Host "Cleanup completed!" -ForegroundColor Green
}

function Invoke-Prune {
    Write-Host "Pruning Docker resources..." -ForegroundColor Yellow
    & docker system prune -f
    Write-Host "Prune completed!" -ForegroundColor Green
}

# Main
switch ($Command.ToLower()) {
    "build" {
        Invoke-Build
    }
    "run" {
        Invoke-RunTests
    }
    "run-headed" {
        Invoke-RunHeaded
    }
    "run-scenario" {
        Invoke-RunScenario $Argument
    }
    "run-newman" {
        Invoke-RunNewman
    }
    "shell" {
        Invoke-Shell
    }
    "logs" {
        Show-Logs
    }
    "clean" {
        Invoke-Cleanup
    }
    "prune" {
        Invoke-Prune
    }
    default {
        Print-Usage
    }
}
