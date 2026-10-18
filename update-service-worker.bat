
@echo off
title Compendio - Update Service Worker
cd /d "%~dp0"

echo.
echo ==========================================
echo   COMPENDIO - SERVICE WORKER UPDATE
echo ==========================================
echo.
echo Working folder:
echo %CD%
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-service-worker.ps1"

echo.
echo ==========================================
echo BAT finished.
echo ==========================================
pause
