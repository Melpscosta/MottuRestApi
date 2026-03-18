@echo off
cd /d "%~dp0"

set "PORT=5055"

REM Encerra a API se já estiver rodando (evita erro "arquivo bloqueado")
taskkill /IM MottuApi.exe /F >nul 2>&1
if %errorlevel% equ 0 (
  echo API anterior encerrada. Reiniciando...
  timeout /t 2 /nobreak >nul
)

echo Iniciando API em http://localhost:%PORT% ...
echo.

dotnet run --urls http://localhost:%PORT%

echo.
pause

