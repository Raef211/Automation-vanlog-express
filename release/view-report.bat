@echo off
echo =============================================
echo  Allure Report - Visualisation locale
echo =============================================
echo Ouvrez : http://localhost:8080
echo Ctrl+C pour arreter.
where python >nul 2>&1 && (python -m http.server 8080) || (npx http-server -p 8080 --cors)
