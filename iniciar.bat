@echo off
title Lily Luz Spa - Launcher
echo ==========================================
echo    Iniciando Lily Luz Spa (Full-Stack)
echo ==========================================

:: Obtener la ruta base del proyecto
set BASE_DIR=%~dp0

:: 1. Iniciar Backend (Spring Boot)
echo [*] Levantando Backend (Spring Boot)...
start "LilyLuz - Backend" cmd /k "cd /d %BASE_DIR%lilyluz-api && mvnw.cmd spring-boot:run"

:: Esperar 5 segundos para darle ventaja al backend
timeout /t 5 /nobreak >nul

:: 2. Iniciar Frontend (Vite con acceso para celular)
echo [*] Levantando Frontend (Vite con red local)...
start "LilyLuz - Frontend" cmd /k "cd /d %BASE_DIR%lilyluz-app && npm run dev -- --host 0.0.0.0"

:: 3. Abrir automáticamente en el navegador del PC
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo ==========================================
echo    Listo! Aplicacion en ejecucion.
echo    Puedes minimizar esta ventana.
echo ==========================================
pause