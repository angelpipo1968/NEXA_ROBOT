@echo off
title SINCRONIZAR NEXA CON LA NUBE
color 0A

echo ==========================================
echo    SUBIR CAMBIOS A GITHUB (NUBE)
echo ==========================================
echo.

echo [1/3] Preparando archivos...
git add .

echo.
echo [2/3] Guardando version...
git commit -m "Actualizacion Automatica NEXA PRO %date% %time%"

echo.
echo [3/3] Subiendo...
git push origin main

echo.
echo ==========================================
echo    SINCRONIZACION COMPLETADA!
echo ==========================================
echo.
pause
