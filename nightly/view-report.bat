@echo off
echo =============================================
echo  Allure Report - Visualisation locale
echo =============================================
echo.
echo Ce rapport necessite un serveur HTTP.
echo Demarrage en cours...
echo.
echo Ouvrez votre navigateur sur : http://localhost:8080
echo Appuyez sur Ctrl+C pour arreter.
echo.
where python >nul 2>&1 && (python -m http.server 8080) || (npx http-server -p 8080 --cors)
