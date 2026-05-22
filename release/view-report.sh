#!/bin/bash
echo "Ouvrez : http://localhost:8080  |  Ctrl+C pour arreter"
python3 -m http.server 8080 2>/dev/null || python -m http.server 8080 2>/dev/null || npx http-server -p 8080 --cors
