@echo off
title SUBIR NEXA A GITHUB
color 0F

echo ==========================================
echo    ASISTENTE DE SUBIDA A GITHUB
echo ==========================================
echo.

echo [1/4] Inicializando repositorio Git...
git init
if %errorlevel% neq 0 (
    echo [X] Git no esta instalado. Descargalo de https://git-scm.com/
    pause
    exit
)

echo.
echo [2/4] Guardando archivos...
git add .
git commit -m "Respaldo automatico NEXA V2.0"

echo.
echo [3/4] Configuracion Remota
echo -------------------------------------------------------
echo Ve a https://github.com/new y crea un repositorio vacio.
echo Copia el link que termina en .git (ej: https://github.com/usuario/nexa.git)
echo -------------------------------------------------------
echo.
set /p repo_url="Pega el link del repositorio aqui: "

git remote add origin %repo_url%
git branch -M main

echo.
echo [4/4] Subiendo a la nube...
git push -u origin main

echo.
echo ==========================================
echo    SUBIDA COMPLETADA!
echo ==========================================
pause
