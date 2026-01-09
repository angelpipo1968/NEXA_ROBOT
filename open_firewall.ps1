# Script para abrir el puerto 5000 (Ejecutar como Administrador)
Write-Host "🔥 Intentando abrir puerto 5000 para NEXA ROBOT..." -ForegroundColor Yellow

if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ ERROR: Necesitas ejecutar este script como ADMINISTRADOR." -ForegroundColor Red
    Write-Host "👉 Haz clic derecho en el archivo y selecciona 'Ejecutar con PowerShell como administrador'"
    Pause
    Exit
}

try {
    New-NetFirewallRule -DisplayName "NEXA Robot Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
    Write-Host "✅ ¡ÉXITO! Puerto 5000 abierto." -ForegroundColor Green
    Write-Host "Ahora tu móvil debería poder conectar."
} catch {
    Write-Host "❌ Error al abrir firewall: $_" -ForegroundColor Red
}

Pause