@echo off
title NEXA AGENT 3.0 - SISTEMA AUTONOMO
color 0b
echo ==================================================
echo      INICIANDO NEXA AGENT 3.0 (MODO SOBERANO)
echo ==================================================
echo.
echo [INFO] Cargando entorno neuronal...
cd /d "%~dp0\NEXA_GENESIS"

:: Ejecutar agente usando el entorno virtual configurado
"..\.venv\Scripts\python.exe" nexa_ai_agent.py

echo.
echo [SISTEMA] NEXA se ha detenido.
pause