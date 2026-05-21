@echo off
REM Script batch de gestion Docker pour Playwright
REM Usage: docker\scripts\docker-helper.bat [command] [argument]

setlocal enabledelayedexpansion

set DOCKER_COMPOSE_FILE=docker\docker-compose.yml
set IMAGE_NAME=playwright-tests
set CURRENT_DIR=%cd%

if "%1"=="" goto :help
if /i "%1"=="help" goto :help
if /i "%1"=="build" goto :build
if /i "%1"=="run" goto :run_tests
if /i "%1"=="run-headed" goto :run_headed
if /i "%1"=="run-scenario" goto :run_scenario
if /i "%1"=="run-newman" goto :run_newman
if /i "%1"=="shell" goto :shell
if /i "%1"=="logs" goto :logs
if /i "%1"=="clean" goto :clean
if /i "%1"=="prune" goto :prune
goto :help

:help
echo Docker Helper - Playwright Tests
echo.
echo Usage: docker\scripts\docker-helper.bat [command] [argument]
echo.
echo Commands:
echo   build                 Build the Docker image
echo   run                   Run Cucumber tests in Docker
echo   run-headed            Run tests in headed mode
echo   run-scenario ^<name^>   Run specific scenario by name
echo   run-newman            Run Newman/Postman tests
echo   shell                 Open a shell in the container
echo   logs                  Show container logs
echo   clean                 Clean up containers and images
echo   prune                 Remove unused Docker resources
echo.
exit /b 0

:build
echo Building Docker image...
docker build -f docker\Dockerfile -t %IMAGE_NAME% .
if errorlevel 1 goto :build_error
echo Build completed!
exit /b 0
:build_error
echo Build failed!
exit /b 1

:run_tests
echo Running tests in headless mode...
docker run --rm -v %CURRENT_DIR%:C:\app %IMAGE_NAME% npm run test:headless
exit /b %errorlevel%

:run_headed
echo Running tests in headed mode...
docker run --rm -v %CURRENT_DIR%:C:\app -e HEADLESS=false %IMAGE_NAME% npm run test:headed
exit /b %errorlevel%

:run_scenario
if "%2"=="" (
    echo Error: scenario name required
    exit /b 1
)
echo Running scenario: %2
docker run --rm -v %CURRENT_DIR%:C:\app %IMAGE_NAME% npm run test:headless -- --name "%2"
exit /b %errorlevel%

:run_newman
echo Running Newman tests...
docker run --rm -v %CURRENT_DIR%:C:\app %IMAGE_NAME% npm run test:newman:e2e
exit /b %errorlevel%

:shell
echo Opening shell in container...
docker run --rm -it -v %CURRENT_DIR%:C:\app %IMAGE_NAME% powershell
exit /b %errorlevel%

:logs
echo Showing Docker logs...
docker logs -f playwright-tests
exit /b 0

:clean
echo Cleaning up Docker resources...
docker-compose -f %DOCKER_COMPOSE_FILE% down -v --remove-orphans 2>nul
docker rmi %IMAGE_NAME% 2>nul
echo Cleanup completed!
exit /b 0

:prune
echo Pruning Docker resources...
docker system prune -f
echo Prune completed!
exit /b 0
