# Script para generar APK de NEXA ROBOT V2 automáticamente
# Requiere: Node.js, Java JDK 17+, Android SDK

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🤖 NEXA ROBOT V2 - GENERADOR DE APK" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Verificar dependencias básicas
$nodeVersion = node -v
if ($?) {
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Node.js no está instalado." -ForegroundColor Red
    exit
}

# 2. Sincronizar proyecto web con móvil
Write-Host "`n📦 Sincronizando archivos web..." -ForegroundColor Yellow
Copy-Item -Path "deploy\*" -Destination "neuronex-mobile\www" -Recurse -Force
Write-Host "✅ Archivos sincronizados." -ForegroundColor Green

# 3. Entrar en carpeta móvil
Set-Location neuronex-mobile

# 4. Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "`n📥 Instalando dependencias de Capacitor..." -ForegroundColor Yellow
    npm install
}

# 5. Sincronizar con Android
Write-Host "`n🔄 Actualizando proyecto Android..." -ForegroundColor Yellow
npx cap sync android

# 6. Compilar APK (Debug)
Write-Host "`n🔨 Compilando APK (esto puede tardar unos minutos)..." -ForegroundColor Yellow
cd android
./gradlew assembleDebug

if ($?) {
    Write-Host "`n✅ ¡ÉXITO! APK GENERADA" -ForegroundColor Green
    Write-Host "📂 Ubicación: neuronex-mobile\android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan
    
    # Intentar abrir la carpeta
    explorer "app\build\outputs\apk\debug"
} else {
    Write-Host "`n❌ Error en la compilación. Verifica que tienes Android SDK y Java instalados." -ForegroundColor Red
}

# Volver a raíz
cd ..\..
Pause
