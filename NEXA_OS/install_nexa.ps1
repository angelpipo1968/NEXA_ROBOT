# NEXA OS Installer Script
# Fecha: 2026-01-08

# --- 1. Verificación de permisos de administrador ---
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "⚠️  Permisos de administrador requeridos. Reiniciando con elevación..." -ForegroundColor Yellow
    Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`"" -Verb RunAs
    exit
}

Write-Host "╔════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       NEXA OS - SETUP WIZARD       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════╝" -ForegroundColor Cyan

# --- 2. Configuración de entorno ---
$installDir = Get-Location
Write-Host "📂 Directorio de instalación: $installDir" -ForegroundColor Gray

# --- 3. Lanzar NEXA OS ---
Write-Host "🚀 Iniciando interfaz gráfica..." -ForegroundColor Green
Start-Process "index.html"

Write-Host "✅ Instalación completada." -ForegroundColor Green
Read-Host "Presiona Enter para salir..."
