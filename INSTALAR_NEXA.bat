@echo off
title INSTALADOR DE NEXA ROBOT V2.0
color 0A

echo ===================================================
echo      ROBOT NEXA - SISTEMA DE INSTALACION
echo ===================================================
echo.
echo [1/3] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python no detectado.
    echo [!] Por favor, instala Python 3.10 o superior desde python.org
    echo [!] Asegurate de marcar la casilla "Add Python to PATH" al instalar.
    pause
    exit
) else (
    echo [OK] Python detectado.
)

echo.
echo [2/3] Instalando cerebro y dependencias...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [X] Error instalando librerias. Revisa tu conexion a internet.
    pause
    exit
)

echo.
echo [3/3] Configurando sistema...
echo [OK] Todo listo.

echo.
echo ===================================================
echo      INSTALACION COMPLETADA CON EXITO
echo ===================================================
echo.
echo Para iniciar el robot, ejecuta el archivo 'INICIAR_NEXA.bat'
echo.
pause
