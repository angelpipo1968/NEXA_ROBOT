@echo off
echo ==========================================
echo      🤖 NEXA ROBOT V2 - LAUNCHER
echo ==========================================

echo [1/3] Iniciando Servidor de IA (Mock/Proxy)...
start "NEXA AI SERVER" cmd /k "cd deploy && python mock_ai_server.py"

echo [2/3] Iniciando Simulador de Hardware...
start "NEXA HARDWARE SIM" cmd /k "cd deploy && python mock_hardware.py"

echo [3/3] Iniciando Servidor Web...
start "NEXA WEB UI" cmd /k "cd deploy && python cors_server.py 8081"

echo.
echo ==========================================
echo      ✅ SISTEMAS INICIADOS
echo ==========================================
echo.
echo  👉 App Principal:    http://localhost:8081
echo  👉 Hardware Sim:     http://localhost
echo.
echo  (No cierres las ventanas negras que se han abierto)
echo.
pause
