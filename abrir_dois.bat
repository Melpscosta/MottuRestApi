@echo off
REM Abre API (.NET) e App (Expo) em janelas separadas
REM Execute na raiz do repositorio (pasta que contem api/ e app/)

set "ROOT=%~dp0"
set "API_DIR=%ROOT%api"
set "APP_DIR=%ROOT%app"

set API_URL=http://localhost:5055

start "API Mottu" cmd /c "cd /d ""%API_DIR%"" && abrir_api.bat"

start "App Expo" powershell -NoProfile -Command ^
  "cd '%APP_DIR%' ; if (-not (Test-Path 'node_modules')) { npm install } ; npm run dev"

echo Iniciando API e App...
echo Coloque o projeto Expo na pasta app/ se ainda nao estiver.
pause
