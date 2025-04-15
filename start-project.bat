@echo off
echo Iniciando o projeto Indique e Ganhe...

echo.
echo 1. Iniciando o servidor backend...
start cmd /k "npm run dev"

echo.
echo 2. Iniciando o frontend...
cd frontend
start cmd /k "npm run dev"

echo.
echo 3. Iniciando Ngrok...
start cmd /k "ngrok http 3000"

echo.
echo Projeto iniciado! 
echo.
echo URLs importantes:
echo - Frontend: http://localhost:5173
echo - Admin: http://localhost:5173/admin
echo - Backend: http://localhost:3000
echo - Aguarde o Ngrok iniciar para ver a URL pública
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul 