<#
📜 NEXA OS – Instalador Automático para Windows (PowerShell) 
 Dominio oficial: http://nexa-ai.dev  
 Última actualización: 2026-01-08 
 Fecha de creación: 2026-01-08
#>

Clear-Host
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              NEXA OS - INSTALADOR AUTOMÁTICO               ║" -ForegroundColor Cyan
Write-Host "║              v2.0 - Build 2026-01-08                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dominio oficial: http://nexa-ai.dev" -ForegroundColor DarkGray
Write-Host ""

# 1. Verificar Python
Write-Host "[1/4] 🐍 Verificando entorno Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python") {
        Write-Host "      ✅ $pythonVersion detectado." -ForegroundColor Green
    } else {
        throw "No se detectó Python."
    }
} catch {
    Write-Host "      ❌ ERROR CRÍTICO: Python no está instalado o no está en el PATH." -ForegroundColor Red
    Write-Host "      Por favor, instala Python 3.10+ desde python.org y marca 'Add to PATH'."
    Read-Host "Presiona Enter para salir..."
    exit
}

# 2. Instalar Dependencias
Write-Host "`n[2/4] 📦 Instalando librerías del sistema..." -ForegroundColor Yellow
try {
    python -m pip install --upgrade pip | Out-Null
    if (Test-Path "requirements.txt") {
        Write-Host "      Instalando dependencias desde requirements.txt (esto puede tardar)..." -ForegroundColor Gray
        pip install -r requirements.txt
        Write-Host "      ✅ Librerías instaladas correctamente." -ForegroundColor Green
    } else {
        Write-Host "      ⚠️ No se encontró requirements.txt. Saltando instalación." -ForegroundColor Red
    }
} catch {
    Write-Host "      ❌ Error instalando librerías." -ForegroundColor Red
}

# 3. Verificar Estructura de Archivos
Write-Host "`n[3/4] 📂 Verificando integridad del sistema..." -ForegroundColor Yellow

$checks = @(
    @{Path="NEXA_OS"; Name="Núcleo Web (NEXA OS)"},
    @{Path="nexa_agente"; Name="Agente IA (Cerebro)"},
    @{Path="nexa_ai_agent.py"; Name="Ejecutable Principal"},
    @{Path="face.png"; Name="Recursos Gráficos"}
)

foreach ($item in $checks) {
    if (Test-Path $item.Path) {
        Write-Host "      ✅ $($item.Name) OK" -ForegroundColor Green
    } else {
        Write-Host "      ⚠️ Falta: $($item.Name)" -ForegroundColor Red
    }
}

# 4. Finalizar
Write-Host "`n[4/4] 🚀 Finalizando configuración..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

Write-Host "`n✨ INSTALACIÓN COMPLETA ✨" -ForegroundColor Cyan
Write-Host "------------------------------------------------"
Write-Host "Para iniciar la WEB:   Ejecuta INICIAR_NEXA_OS.bat" -ForegroundColor White
Write-Host "Para iniciar la VOZ:   Ejecuta INICIAR_NEXA_OFICIAL.bat" -ForegroundColor White
Write-Host "------------------------------------------------"
Write-Host "`nPresiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
