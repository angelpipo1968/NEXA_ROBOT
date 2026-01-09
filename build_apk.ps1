# Script para generar APK de NEXA ROBOT V2
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   🤖 CONSTRUCTOR DE APK NEXA V2.0" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Sincronizar Frontend
Write-Host "`n[1/4] Sincronizando código web..." -ForegroundColor Yellow
$deployPath = Join-Path $PSScriptRoot "deploy"
$mobileWwwPath = Join-Path $PSScriptRoot "neuronex-mobile\www"

if (Test-Path $deployPath) {
    Copy-Item -Path "$deployPath\*" -Destination $mobileWwwPath -Recurse -Force
    Write-Host "✅ Archivos web actualizados." -ForegroundColor Green
} else {
    Write-Error "❌ No se encuentra la carpeta deploy!"
    exit 1
}

# 2. Preparar Entorno Móvil
Write-Host "`n[2/4] Configurando Capacitor..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\neuronex-mobile"

if (-not (Test-Path "node_modules")) {
    Write-Host "� Instalando dependencias..."
    npm install
}

npx cap sync
Write-Host "✅ Capacitor sincronizado." -ForegroundColor Green

# 3. Compilar APK (Gradle)
Write-Host "`n[3/4] Compilando APK (esto puede tardar)..." -ForegroundColor Yellow
Set-Location "android"

if ($IsWindows) {
    .\gradlew.bat assembleDebug
} else {
    ./gradlew assembleDebug
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa." -ForegroundColor Green
} else {
    Write-Error "❌ Error al compilar APK. Verifica tener Java/Android SDK instalados."
    exit 1
}

# 4. Mover APK
Write-Host "`n[4/4] Entregando producto..." -ForegroundColor Yellow
$apkSource = "app\build\outputs\apk\debug\app-debug.apk"
$apkDest = "$PSScriptRoot\NEXA_ROBOT_V2.apk"

if (Test-Path $apkSource) {
    Copy-Item -Path $apkSource -Destination $apkDest -Force
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "🚀 APK GENERADO: $apkDest" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
} else {
    Write-Error "❌ No se encuentra el APK generado."
}

Set-Location $PSScriptRoot
Pause
