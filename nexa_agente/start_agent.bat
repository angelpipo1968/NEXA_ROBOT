@echo off
TITLE NEXA AGENT
echo Iniciando NEXA Agent...
cd /d "%~dp0"
python main.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] El agente se cerro inesperadamente.
    pause
)
