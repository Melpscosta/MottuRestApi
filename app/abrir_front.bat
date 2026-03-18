@echo off
cd /d "%~dp0"

echo Iniciando Front (Expo)...
echo.

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  echo.
)

call npm run dev

echo.
pause

