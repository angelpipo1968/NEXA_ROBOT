# agent_core/executor.py
import subprocess
import os
import sys
from .logger import log_action

def confirm_and_run(command: str, description: str = "") -> bool:
    """
    Solicita confirmación antes de ejecutar un comando potencialmente peligroso.
    """
    print(f"\n[🤖 NEXA AI] {description or 'Acción solicitada'}")
    print(f"Comando: {command}")
    confirm = input("¿Permites esta acción? (s/n): ").strip().lower()
    
    if confirm in ("s", "si", "yes", "y"):
        try:
            log_action(f"EJECUTADO: {command}")
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            print(f"[✅] Salida:\n{result.stdout}")
            if result.stderr:
                print(f"[⚠️] Errores:\n{result.stderr}")
            return True
        except Exception as e:
            log_action(f"ERROR: {str(e)}")
            print(f"[❌] Falló la ejecución: {e}")
            return False
    else:
        log_action(f"RECHAZADO por usuario: {command}")
        print("[🛑] Acción cancelada por el usuario.")
        return False

def launch_server(command: str, working_dir: str = None, needs_admin: bool = False):
    """
    Lanza un servidor en una nueva ventana de CMD/PowerShell.
    Pide confirmación al usuario antes de ejecutar.
    """
    description = f"Iniciar servidor con: {command}"
    print(f"\n[🤖 NEXA AI] {description}")
    confirm = input("¿Permites iniciar este servidor? (s/n): ").strip().lower()
    
    if confirm not in ("s", "si", "y", "yes"):
        log_action(f"INICIO DE SERVIDOR RECHAZADO: {command}")
        print("[🛑] Acción cancelada.")
        return False

    # Registrar acción
    log_action(f"INICIANDO SERVIDOR: {command} | Directorio: {working_dir or os.getcwd()}")
    
    working_dir = working_dir or os.getcwd()

    try:
        if needs_admin or "admin_required" in command.lower():
            # Ejecutar como administrador usando PowerShell
            ps_script = f"Start-Process cmd -ArgumentList '/k cd /d \"{working_dir}\" && {command}' -Verb RunAs"
            subprocess.run(["powershell", "-Command", ps_script], check=True)
        else:
            # Abrir en nueva ventana de CMD sin admin
            full_cmd = f'cd /d "{working_dir}" && {command} && pause'
            subprocess.Popen(f'start cmd /k "{full_cmd}"', shell=True)

        print("[🟢] Servidor iniciado en nueva ventana de CMD.")
        return True

    except Exception as e:
        log_action(f"ERROR al iniciar servidor: {str(e)}")
        print(f"[❌] Falló al iniciar el servidor: {e}")
        return False
