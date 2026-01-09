@echo off
title CONFIGURAR CLAVES SECRETAS - NEXA OS
color 0E

echo ==========================================
echo    GESTOR DE SECRETOS NEXA
echo ==========================================
echo.
echo Este script te ayudara a configurar las claves de la IA y la Nube.
echo Si no tienes una clave, puedes dejarla en blanco (Enter).
echo.

set /p gemini=">> Pega tu GEMINI API KEY aqui: "
set /p mongo=">> Pega tu MONGO URI aqui: "
set /p stripe=">> Pega tu STRIPE SECRET KEY aqui: "

echo.
echo Guardando configuracion...

(
echo GEMINI_API_KEY=%gemini%
echo MONGO_URI=%mongo%
echo STRIPE_SECRET_KEY=%stripe%
) > .env

echo.
echo ==========================================
echo    CLAVES GUARDADAS EN .env
echo ==========================================
echo.
pause
