@echo off
setlocal EnableDelayedExpansion
title LilyLuz Spa - Peluqueria Canina
cd /d "%~dp0"

echo.
echo   ========================================
echo     LilyLuz Spa - Peluqueria Canina
echo   ========================================
echo.

:: -----------------------------------------------------------
:: 1. Verificar Java
:: -----------------------------------------------------------
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo   [X] No se encontro Java instalado en este equipo.
    echo.
    echo   Solucion: descarga e instala Java 21 ^(gratis^) desde:
    echo     https://adoptium.net/temurin/releases/?version=21
    echo   Elige: Windows - x64 - JRE - .msi
    echo   Cuando lo instales, vuelve a abrir este archivo.
    echo.
    pause
    exit /b 1
)
echo   [OK] Java detectado.

:: -----------------------------------------------------------
:: 2. Verificar si el servidor YA esta corriendo
:: -----------------------------------------------------------
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul 2>nul
if %errorlevel% equ 0 (
    echo   [!] El servidor ya esta corriendo en este equipo.
    echo       No es necesario abrirlo dos veces.
    echo.
    echo   Si quieres reiniciarlo, ejecuta primero: detener.bat
    echo   De lo contrario, usa la aplicacion directamente.
    echo.
    start "" http://localhost:8080
    pause
    exit /b 0
)

:: -----------------------------------------------------------
:: 3. Obtener la direccion IP de este PC (para el celular)
:: -----------------------------------------------------------
set LOCAL_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    if not defined LOCAL_IP (
        set RAWIP=%%a
        for /f "tokens=1" %%b in ("!RAWIP!") do set LOCAL_IP=%%b
    )
)

echo.
echo   ========================================
echo     ACCESO A LILYLUZ SPA
echo   ========================================
echo.
echo   Desde este computador:
echo       http://localhost:8080
echo.
if defined LOCAL_IP (
    echo   Desde tu celular ^(iPhone, misma WiFi^):
    echo       http://!LOCAL_IP!:8080
) else (
    echo   Desde tu celular: ejecuta ipconfig y copia la IPv4
)
echo.
echo   =========================================
echo.
echo   Manten esta ventana abierta mientras trabajas.
echo   Para cerrar el servidor: ejecuta detener.bat
echo   o cierra esta ventana.
echo.
echo   NOTA: Si Windows pregunta por el Firewall, marca
echo   AMBAS casillas ^(privada y publica^) y Aceptar,
echo   si no el celular no podra conectarse.
echo.
echo   =========================================
echo.
echo   Iniciando servidor...
echo.

:: -----------------------------------------------------------
:: 4. Abrir el navegador automaticamente
:: -----------------------------------------------------------
start "" timeout /t 4 /nobreak >nul & start http://localhost:8080

:: -----------------------------------------------------------
:: 5. Ejecutar el servidor (esta ventana queda abierta)
:: -----------------------------------------------------------
java -jar lilyluz-spa.jar

echo.
echo   Servidor detenido. Puedes cerrar esta ventana.
pause
