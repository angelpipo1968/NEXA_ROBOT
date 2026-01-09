#!/usr/bin/env python3 
# ============================================================================= 
# NEURONEX PULSE - Sistema de Despliegue Automático 
# Dominio: http://nexa-ai.dev  
# Autor: Ángel (NEXA Ai.Dev) 
# Última actualización: 2026-01-08 
# ============================================================================= 
 
import os 
import hashlib 
import json 
import subprocess 
import shutil 
from pathlib import Path 
from datetime import datetime, timezone

# === CONFIGURACIÓN === 
SOURCE_DIR = Path("neuronex-pulse")       # Carpeta con tus archivos HTML/CSS/JS 
OUTPUT_DIR = Path("deploy")               # Carpeta de salida (para subir a servidor) 
MANIFEST_PATH = OUTPUT_DIR / "manifest.json" 
GPG_KEY_ID = "9CD7FEF8DA34008F"          # Clave GPG Real
DOMAIN = "http://nexa-ai.dev/neuronex" 
 
# === FUNCIONES === 
def sha256_file(filepath): 
    """Calcula el hash SHA256 de un archivo.""" 
    hasher = hashlib.sha256() 
    with open(filepath, 'rb') as f: 
        for chunk in iter(lambda: f.read(4096), b""): 
            hasher.update(chunk) 
    return hasher.hexdigest() 
 
def sign_manifest(manifest_path): 
    """Firma el manifest.json con GPG.""" 
    try: 
        # Check if GPG key is set
        if "TU_CLAVE" in GPG_KEY_ID:
            print("⚠️ Clave GPG no configurada. Saltando firma.")
            return False

        print(f"🔐 Firmando manifest con Key ID: {GPG_KEY_ID}...")
        result = subprocess.run([ 
            "gpg", "--detach-sign", "--armor", "--local-user", GPG_KEY_ID,  
            str(manifest_path) 
        ], check=True, capture_output=True, text=True) 
        print(f"✅ Manifest firmado: {manifest_path}.asc") 
        return True 
    except subprocess.CalledProcessError as e: 
        print(f"❌ Error al firmar: {e.stderr}") 
        return False 
    except FileNotFoundError:
        print("❌ GPG no encontrado en el sistema. Asegúrate de tener Gpg4win instalado y en el PATH.")
        return False
 
def deploy(): 
    print("🚀 Iniciando despliegue de NEURONEX PULSE...") 
     
    # 1. Crear carpeta de salida 
    # if OUTPUT_DIR.exists():
    #    shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(exist_ok=True) 
     
    # 2. Copiar archivos y calcular hashes 
    files_hash = {} 
    
    if not SOURCE_DIR.exists():
        print(f"❌ Error: No se encuentra el directorio fuente {SOURCE_DIR}")
        return

    print(f"� Escaneando {SOURCE_DIR}...")
    for file_path in SOURCE_DIR.rglob("*"): 
        if file_path.is_file() and file_path.suffix in [".html", ".js", ".css", ".svg"]: 
            # Skip old manifest/updater if present in source
            if file_path.name == "manifest.json":
                continue

            rel_path = file_path.relative_to(SOURCE_DIR) 
            dest_path = OUTPUT_DIR / rel_path 
            dest_path.parent.mkdir(parents=True, exist_ok=True) 
            shutil.copy2(file_path, dest_path) 
             
            # Calcular hash 
            file_hash = sha256_file(dest_path) 
            files_hash[str(rel_path).replace("\\", "/")] = f"sha256:{file_hash}" 
            print(f"📄 {rel_path} → {file_hash[:8]}...") 
 
    # 3. Leer versión actual del HTML (opcional: puedes pedirla) 
    # current_version = input("ByVersion (ej: 2.1.0): ").strip() or "2.1.0" 
    current_version = "2.1.0" # Hardcoded for automation/demo
     
    # 4. Crear manifest.json 
    manifest = { 
        "version": current_version, 
        "last_update": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"), 
        "domain": DOMAIN, 
        "files": files_hash 
    } 
     
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f: 
        json.dump(manifest, f, indent=2, ensure_ascii=False) 
     
    print(f"\n📄 Manifest generado: {MANIFEST_PATH}") 
     
    # 5. Firmar el manifest 
    if sign_manifest(MANIFEST_PATH): 
        print("\n🔐 Firma GPG creada. ¡Despliegue seguro!") 
        print(f"\n📥 Archivos listos en: {OUTPUT_DIR.absolute()}") 
        print("\n➡️  Sube TODO el contenido de la carpeta 'deploy' a:") 
        print(f"   {DOMAIN}/") 
    else: 
        print("\n⚠️  Despliegue incompleto: sin firma GPG (pero archivos generados en 'deploy').") 
 
if __name__ == "__main__": 
    deploy()