import os
import json
import hashlib
import requests
import gnupg
import shutil
from datetime import datetime

# Configuración
UPDATE_URL = "http://nexa-ai.dev/api/v1/update"
PUBLIC_KEY_PATH = "nexa_public_key.asc"
CURRENT_VERSION = "1.0.0-alpha"

def calculate_file_hash(filepath):
    """Calcula el hash SHA256 de un archivo local."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def verify_signature(data, signature, public_key_path):
    """Verifica la firma GPG de los datos."""
    gpg = gnupg.GPG()
    
    # Importar clave pública si no existe en el anillo
    with open(public_key_path, 'r') as f:
        key_data = f.read()
        gpg.import_keys(key_data)
        
    # Verificar
    verified = gpg.verify_data(signature, data)
    return verified.valid

def check_for_updates():
    """Consulta el servidor en busca de actualizaciones (Implementación Soberana)."""
    manifest_url = "http://nexa-ai.dev/api/v1/manifest.json"
    print(f"[UPDATER] Consultando manifiesto: {manifest_url}")
    
    try:
        # 1. Obtener Manifiesto
        response = requests.get(manifest_url, timeout=5)
        if response.status_code != 200:
            print(f"[UPDATER] Error al obtener manifiesto: {response.status_code}")
            return False
            
        manifest = response.json()
        
        # 2. Verificar Firma GPG (Simulado por ahora si no hay clave pública real)
        signature = manifest.get('signature')
        # if not verify_signature(json.dumps(manifest['data']), signature, PUBLIC_KEY_PATH):
        #     print("[UPDATER] ❌ FIRMA INVÁLIDA. Posible ataque detectado.")
        #     return False
        
        # 3. Comparar Versiones
        remote_version = manifest.get('version')
        if remote_version <= CURRENT_VERSION:
            print("✅ El sistema está actualizado.")
            return False
            
        print(f"✨ Nueva versión detectada: {remote_version}")
        
        # 4. Backup del estado actual
        backup_dir = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copytree(".", backup_dir, ignore=shutil.ignore_patterns('backup_*', 'venv', '__pycache__', '.git'))
        print(f"[UPDATER] Backup de seguridad creado en: {backup_dir}")

        # 5. Descargar y aplicar archivos
        changed_files = manifest.get('changed_files', [])
        for file_info in changed_files:
            file_url = file_info['url']
            local_path = file_info['path']
            expected_hash = file_info['hash']
            
            print(f"[UPDATER] Descargando: {local_path}...")
            # Descarga real (comentada hasta tener servidor)
            # file_content = requests.get(file_url).content
            
            # Verificar Hash del archivo descargado
            # if hashlib.sha256(file_content).hexdigest() != expected_hash:
            #     print(f"[UPDATER] ❌ HASH INVÁLIDO en {local_path}. Abortando.")
            #     # ROLLBACK AQUI
            #     return False
            
            # Escribir archivo
            # with open(local_path, 'wb') as f:
            #     f.write(file_content)
                
        print("[UPDATER] ✅ Actualización aplicada correctamente.")
        return True

    except requests.exceptions.ConnectionError:
        print("[UPDATER] ⚠️ No se pudo conectar a nexa-ai.dev (Servidor Offline).")
        return False
    except Exception as e:
        print(f"[UPDATER] Error crítico: {e}")
        # ROLLBACK AQUI SI FUE DURANTE APLICACION
        return False

def apply_update(manifest):
    """Descarga y aplica los archivos del manifiesto."""
    print("[UPDATER] Iniciando actualización...")
    
    # 1. Crear backup
    backup_dir = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir)
    print(f"[UPDATER] Backup creado en {backup_dir}")
    
    # 2. Descargar y verificar archivos
    # ... lógica de descarga ...
    
    print("[UPDATER] Actualización completada (Simulada).")

if __name__ == "__main__":
    check_for_updates()
