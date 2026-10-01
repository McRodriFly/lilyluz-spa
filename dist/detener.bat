@echo off
setlocal EnableDelayedExpansion
title LilyLuz Spa - Detener Servidor

echo.
echo   ========================================
echo     LilyLuz Spa - Detener Servidor
echo   ========================================
echo.

:: Buscar el proceso que escucha en el puerto 8080 y cerrarlo
set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    set FOUND=1
    echo   Cerrando servidor LilyLuz Spa ^(PID %%a^)...
    taskkill /F /PID %%a >nul 2>nul
)

if %FOUND% equ 1 (
    echo.
    echo   [OK] El servidor fue detenido correctamente.
    echo   Tus datos quedaron guardados en la carpeta data.
) else (
    echo   [i] No habia ningun servidor LilyLuz corriendo.
    echo       Nada que cerrar.
)

echo.
echo   Puedes cerrar esta ventana.
pause
