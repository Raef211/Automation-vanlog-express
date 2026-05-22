#!/bin/bash
echo "============================================="
echo " Allure Report - Visualisation locale"
echo "============================================="
echo ""
echo "Ouvrez votre navigateur sur : http://localhost:8080"
echo "Appuyez sur Ctrl+C pour arreter."
echo ""
if command -v python3 &>/dev/null; then
  python3 -m http.server 8080
elif command -v python &>/dev/null; then
  python -m http.server 8080
else
  npx http-server -p 8080 --cors
fi
