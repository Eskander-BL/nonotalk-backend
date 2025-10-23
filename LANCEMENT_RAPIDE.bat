@echo off
echo ========================================
echo    LANCEMENT NONOTALK - WINDOWS
echo ========================================
echo.

echo [1/3] Demarrage du Backend...
cd nonotalk-backend
start "NonoTalk Backend" cmd /k "venv\Scripts\activate && python src/main.py"

echo [2/3] Attente de 5 secondes...
timeout /t 5 /nobreak > nul

echo [3/3] Demarrage du Frontend...
cd ..\nonotalk-frontend
start "NonoTalk Frontend" cmd /k "pnpm run dev --host"

echo.
echo ========================================
echo   NONOTALK DEMARRE !
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5174
echo.
echo Ouvrez votre navigateur et allez sur:
echo http://localhost:5174
echo.
echo Appuyez sur une touche pour fermer...
pause > nul

