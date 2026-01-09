@echo off
title DESPLEGAR FRONTEND EN VERCEL
color 0B

echo ==========================================
echo    DESPLIEGUE AUTOMATICO DE NEXA WEB
echo ==========================================
echo.
echo Este script requiere Vercel CLI.
echo Si no lo tienes, se intentara instalar con npm.
echo.

call npm install -g vercel

echo.
echo Iniciando despliegue...
echo Sigue las instrucciones en pantalla (Login, Confirmar proyecto, etc.)
echo.

cd deploy
vercel --prod

echo.
echo ==========================================
echo    DESPLIEGUE COMPLETADO!
echo ==========================================
pause
