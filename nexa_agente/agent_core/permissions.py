# agent_core/permissions.py
import ctypes
import sys
import os
import subprocess

def is_admin():
    """Verifica si el script se ejecuta como administrador."""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def request_admin():
    """Reinicia el script con privilegios de administrador."""
    if not is_admin():
        print("[⚠️] Se requieren permisos de administrador. Elevando...")
        script = os.path.abspath(sys.argv[0])
        params = ' '.join([script] + sys.argv[1:])
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, params, None, 1
        )
        sys.exit(0)
