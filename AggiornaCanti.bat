
@echo off
setlocal
title Aggiorna catalogo Canti

cd /d "%~dp0"

echo.
echo ========================================
echo       AGGIORNAMENTO CATALOGO CANTI
echo ========================================
echo.
echo Cartella progetto:
echo %~dp0
echo.

if not exist "%~dp0genera-catalogo.ps1" (
    echo ERRORE: genera-catalogo.ps1 non trovato.
    echo Controlla che sia nella stessa cartella di questo file BAT.
    echo.
    pause
    exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0genera-catalogo.ps1"

if errorlevel 1 (
    echo.
    echo ERRORE: il catalogo NON e' stato aggiornato.
    echo Leggi il messaggio di errore qui sopra.
    echo.
    pause
    exit /b 1
)

echo.
echo Operazione completata.
echo Controlla la cartella js per songs-generated.js.
echo.
pause
