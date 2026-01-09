@echo off
title GENERAR CERTIFICADO SSL LOCAL
color 0B

echo ==========================================
echo    GENERADOR DE CERTIFICADOS NEXA
echo ==========================================
echo.
echo Este script creara cert.pem y key.pem para usar HTTPS en Localhost.
echo Requisito: Python instalado.
echo.

python generar_cert.py

echo.
pause
