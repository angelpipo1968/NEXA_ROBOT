import os
import pyautogui
import time
from nexa_agente.voice_engine import speak

def control_volume(command):
    """Controla el volumen del sistema."""
    if "sube" in command or "aumenta" in command:
        pyautogui.press("volumeup", presses=5)
        speak("Subiendo volumen.")
    elif "baja" in command or "disminuye" in command:
        pyautogui.press("volumedown", presses=5)
        speak("Bajando volumen.")
    elif "silencio" in command or "mute" in command:
        pyautogui.press("volumemute")
        speak("Audio silenciado.")

def open_app(command):
    """Abre aplicaciones comunes de Windows."""
    command = command.lower()
    
    if "calculadora" in command:
        os.system("start calc")
        speak("Abriendo calculadora.")
    elif "bloc de notas" in command or "notepad" in command:
        os.system("start notepad")
        speak("Abriendo bloc de notas.")
    elif "navegador" in command or "chrome" in command or "edge" in command:
        os.system("start https://www.google.com")
        speak("Abriendo navegador.")
    elif "explorador" in command or "archivos" in command:
        os.system("start explorer")
        speak("Abriendo mis documentos.")
    elif "configuración" in command or "panel" in command:
        os.system("start ms-settings:")
        speak("Abriendo configuración.")
    else:
        speak("No estoy segura de qué programa quieres abrir.")

def system_power(command):
    """Apaga o reinicia el sistema (con seguridad)."""
    if "apagar" in command:
        speak("¿Estás seguro que quieres apagar la computadora? Di 'confirmar apagar' para hacerlo.")
    elif "reiniciar" in command:
        speak("¿Seguro que quieres reiniciar? Di 'confirmar reiniciar'.")
    
    # Comandos de confirmación (requiere lógica en el agente principal, 
    # pero aquí dejamos las acciones directas por si el usuario es muy específico)
    elif "confirmar apagar" in command:
        speak("Iniciando secuencia de apagado. Hasta luego.")
        time.sleep(2)
        os.system("shutdown /s /t 5")
    elif "confirmar reiniciar" in command:
        speak("Reiniciando sistemas.")
        time.sleep(2)
        os.system("shutdown /r /t 5")
    elif "cancelar" in command:
        os.system("shutdown /a")
        speak("Operación cancelada.")
