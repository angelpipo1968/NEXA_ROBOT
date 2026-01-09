# ============================================================================= 
# NEXA AGENT — Configuración automática de GPG para Windows 
# Autor: Ángel (NEXA Ai.Dev) 
# Soberanía: Clave GPG 4096-bit, sin vencimiento 
# ============================================================================= 
 
# Verificar si se ejecuta como administrador 
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) 
if (-not $isAdmin) { 
    Write-Host "⚠️  Este script requiere permisos de administrador." -ForegroundColor Yellow 
    Start-Sleep -Seconds 3 
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs 
    exit 
} 
 
Write-Host "🌌 Configurando GPG para NEXA AGENT..." -ForegroundColor Cyan 
 
# === Paso 1: Instalar Gpg4win si no está instalado === 
if (!(Get-Command gpg -ErrorAction SilentlyContinue)) { 
    Write-Host "📦 Instalando Gpg4win..." -ForegroundColor Green 
     
    # Descargar Gpg4win 
    $gpgUrl = "https://files.gpg4win.org/gpg4win-4.1.0.exe" 
    $installerPath = "$env:TEMP\gpg4win-installer.exe" 
    Invoke-WebRequest -Uri $gpgUrl -OutFile $installerPath 
     
    # Instalar silenciosamente 
    Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait 
    Remove-Item $installerPath 
     
    # Añadir al PATH 
    $gpgPath = "${env:ProgramFiles(x86)}\GnuPG\bin" 
    if (Test-Path $gpgPath) { 
        $env:Path += ";$gpgPath" 
        [System.Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine) 
    } 
     
    Write-Host "✅ Gpg4win instalado." -ForegroundColor Green 
} else { 
    Write-Host "✅ Gpg4win ya está instalado." -ForegroundColor Green 
} 
 
# === Paso 2: Crear clave GPG === 
Write-Host "🔐 Creando clave GPG para NEXA Ai.Dev..." -ForegroundColor Green 
 
# Parámetros de la clave 
$keyParams = @" 
%echo Generating a basic OpenPGP key 
Key-Type: RSA 
Key-Length: 4096 
Subkey-Type: RSA 
Subkey-Length: 4096 
Name-Real: NEXA Ai.Dev 
Name-Email: admin@nexa-ai.dev 
Expire-Date: 0 
Passphrase: TuClaveSegura123!  # ← ¡CÁMBIALA DESPUÉS! 
%commit 
%echo done 
"@ 
 
# Guardar parámetros en archivo temporal 
$paramsFile = "$env:TEMP\nexa-gpg-params.txt" 
$keyParams | Out-File -FilePath $paramsFile -Encoding ASCII 
 
# Generar clave 
gpg --batch --gen-key $paramsFile 
Remove-Item $paramsFile 
 
# Obtener Key ID 
$keyId = (gpg --list-secret-keys --keyid-format LONG | Select-String -Pattern "sec.*rsa4096/([A-F0-9]{16})" | ForEach-Object { $_.Matches[0].Groups[1].Value })[0] 
 
if ($keyId) { 
    Write-Host "✅ Clave GPG creada. Key ID: $keyId" -ForegroundColor Green 
} else { 
    Write-Host "❌ Error al crear la clave GPG." -ForegroundColor Red 
    exit 1 
} 
 
# === Paso 3: Exportar clave pública === 
$publicKeyFile = "$env:USERPROFILE\Desktop\nexa-public-key.asc" 
gpg --export -a "NEXA Ai.Dev" > $publicKeyFile 
Write-Host "✅ Clave pública exportada a: $publicKeyFile" -ForegroundColor Green 
 
# === Paso 4: Crear script de despliegue === 
$deployScript = @" 
import os 
import hashlib 
import json 
import subprocess 
import shutil 
from pathlib import Path 
 
SOURCE_DIR = Path("NEXA_ROBOT_V2") 
OUTPUT_DIR = Path("deploy") 
GPG_KEY_ID = "$keyId"  # ← TU KEY ID AUTOMÁTICO 
VERSION = "3.1.0" 
 
def sha256_file(filepath): 
    hasher = hashlib.sha256() 
    with open(filepath, 'rb') as f: 
        for chunk in iter(lambda: f.read(4096), b""): 
            hasher.update(chunk) 
    return hasher.hexdigest() 
 
def sign_file(filepath, key_id): 
    try: 
        subprocess.run([ 
            "gpg", "--detach-sign", "--armor",  
            "--local-user", key_id, 
            str(filepath) 
        ], check=True) 
        print(f"✅ Firmado: {filepath}.asc") 
        return True 
    except subprocess.CalledProcessError as e: 
        print(f"❌ Error al firmar: {e}") 
        return False 
 
def deploy(): 
    print(f"🚀 Desplegando NEXA AGENT v{VERSION} con firma GPG...") 
    OUTPUT_DIR.mkdir(exist_ok=True) 
     
    files_to_deploy = ["nexa_ai_agent.py", "config.json", "requirements.txt"] 
    file_hashes = {} 
     
    for filename in files_to_deploy: 
        src = SOURCE_DIR / filename 
        if src.exists(): 
            dst = OUTPUT_DIR / filename 
            shutil.copy2(src, dst) 
            file_hash = sha256_file(dst) 
            file_hashes[filename] = f"sha256:{file_hash}" 
            print(f"📄 {filename} → {file_hash[:8]}...") 
     
    manifest = { 
        "version": VERSION, 
        "files": file_hashes, 
        "signature_required": True 
    } 
     
    manifest_path = OUTPUT_DIR / "manifest.json" 
    with open(manifest_path, "w", encoding="utf-8") as f: 
        json.dump(manifest, f, indent=2, ensure_ascii=False) 
     
    if sign_file(manifest_path, GPG_KEY_ID): 
        print(f"\n🔐 ¡Despliegue seguro listo en {OUTPUT_DIR.absolute()}!") 
    else: 
        print("\n⚠️  Despliegue incompleto: sin firma GPG.") 
 
if __name__ == "__main__": 
    deploy() 
"@ 
 
$deployScriptPath = "$env:USERPROFILE\Desktop\deploy-nexa-agent.py" 
$deployScript | Out-File -FilePath $deployScriptPath -Encoding UTF8 
Write-Host "✅ Script de despliegue creado: $deployScriptPath" -ForegroundColor Green 
 
# === Paso 5: Instrucciones finales === 
Write-Host "" 
Write-Host "🎉 ¡CONFIGURACIÓN COMPLETA!" -ForegroundColor Magenta 
Write-Host "" 
Write-Host "🔑 Pasos siguientes:" -ForegroundColor Yellow 
Write-Host "  1. CAMBIA la contraseña de tu clave GPG en Kleopatra" -ForegroundColor White 
Write-Host "  2. Abre Kleopatra → Haz clic derecho en tu clave → 'Change Passphrase'" -ForegroundColor White 
Write-Host "  3. Usa 'deploy-nexa-agent.py' para firmar actualizaciones" -ForegroundColor White 
Write-Host "" 
Write-Host "📁 Archivos generados:" -ForegroundColor Cyan 
Write-Host "   • Clave pública: $publicKeyFile" -ForegroundColor White 
Write-Host "   • Script de despliegue: $deployScriptPath" -ForegroundColor White 
Write-Host "" 
Write-Host "🔒 Soberanía: Tu clave privada NUNCA sale de tu PC." -ForegroundColor Green 
 
Pause