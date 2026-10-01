@echo off
chcp 65001 >nul
title LilyLuz Spa - Peluqueria Canina
color 0B

echo.
echo   🐾  LilyLuz Spa — Peluquería Canina
echo   ════════════════════════════════════
echo.

cd /d "%~dp0"

:: Buscar Java en el sistema
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   ❌ No se encontró Java instalado en este equipo.
    echo.
    echo   Por favor descarga e instala Java 21 desde:
    echo   https://adoptium.net/temurin/releases/?version=21
    echo.
    pause
    exit /b 1
)

:: Obtener la IP local de Windows
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set LOCAL_IP=%%a
    goto :ip_found
)
:ip_found

echo   💾 Base de datos: .\data\lilyluzdb.mv.db
echo.
echo   ┌─────────────────────────────────────────┐
echo   │  🌐 Abre en tu navegador:               │
echo   │                                         │
echo   │  Desde este PC:   http://localhost:8080 │
if defined LOCAL_IP (
echo   │  Desde tu iPhone: http://%LOCAL_IP%:8080 │
)
echo   │                                         │
echo   │  Para detener: Cierra esta ventana.     │
echo   └─────────────────────────────────────────┘
echo.
echo   ⚠️  IMPORTANTE PARA CELULARES:
echo   Si Windows pregunta por el Firewall, marca
echo   AMBAS casillas (privada y publica) y Aceptar.
echo   Sin eso, el iPhone no podra conectarse.
echo.

:: Abrir navegador después de 3 segundos
start "" timeout /t 3 /nobreak >nul & start http://localhost:8080

:: Iniciar el servidor
java -jar lilyluz-spa.jar

pause
