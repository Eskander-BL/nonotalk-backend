#!/bin/bash

echo "========================================"
echo "    LANCEMENT NONOTALK - MAC/LINUX"
echo "========================================"
echo

echo "[1/3] Démarrage du Backend..."
cd nonotalk-backend
source venv/bin/activate
python src/main.py &
BACKEND_PID=$!

echo "[2/3] Attente de 5 secondes..."
sleep 5

echo "[3/3] Démarrage du Frontend..."
cd ../nonotalk-frontend
pnpm run dev --host &
FRONTEND_PID=$!

echo
echo "========================================"
echo "   NONOTALK DÉMARRÉ !"
echo "========================================"
echo
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5174"
echo
echo "Ouvrez votre navigateur et allez sur:"
echo "http://localhost:5174"
echo
echo "Appuyez sur Ctrl+C pour arrêter..."

# Attendre l'interruption
trap "echo 'Arrêt des serveurs...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

