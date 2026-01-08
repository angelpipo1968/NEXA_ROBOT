# ───────────────────────────────────────────────
# 🤖 NEXA AI Agent - Robot Soberano v2.0
# ✅ GUI Moderno, Voz, IA, Memoria, Web
# ───────────────────────────────────────────────

import ctypes
import sys
import os
import subprocess
import datetime
import time
import threading

# ───── GESTIÓN DE DEPENDENCIAS ─────
try:
    import speech_recognition as sr
    import psutil
    from nexa_agente.voice_engine import speak as engine_speak
    from nexa_agente.brain import ask_brain, get_model
    from nexa_agente.web_skills import play_youtube, search_google, search_wikipedia
    from nexa_agente.memory import remember, add_note, get_recent_notes
    from nexa_agente.interface import launch_gui
    from nexa_agente.vision import vision_system
except ImportError as e:
    print(f"\n[❌] ERROR FATAL: Falta una dependencia crítica: {e}")
    print("[ℹ️] Ejecuta 'install_requirements.bat' para corregirlo.")
    time.sleep(5)
    sys.exit(1)

# ───── CONFIGURACIÓN ─────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "logs", "audit.log")
os.makedirs(os.path.join(BASE_DIR, "logs"), exist_ok=True)

AGENT_NAME = "NEXA"
WAKE_WORDS = ["nexa", "robot", "computadora", "oye nexa"]

# ───── WRAPPERS DE GUI ─────
# Variables globales para acceso desde hilos
GUI_INSTANCE = None

def speak(text: str):
    """Habla y loguea en la GUI."""
    if GUI_INSTANCE:
        GUI_INSTANCE.log_message("NEXA", text)
        GUI_INSTANCE.update_status("🗣️ Hablando...", "#00FFFF")
    
    # Llamada al motor real
    engine_speak(text)
    
    if GUI_INSTANCE:
        GUI_INSTANCE.update_status("🟢 En Línea", "#00FF00")

def log_action(message: str):
    """Loguea acciones del sistema."""
    print(f"[LOG] {message}")
    if GUI_INSTANCE:
        GUI_INSTANCE.log_message("SISTEMA", message)

# ───── RECONOCIMIENTO DE VOZ (ESCUCHAR) ─────
def listen():
    """ Escucha el micrófono y devuelve texto. """
    r = sr.Recognizer()
    with sr.Microphone() as source:
        if GUI_INSTANCE:
            GUI_INSTANCE.update_status("👂 Escuchando...", "#FF00FF")
        
        print(f"[{AGENT_NAME}] Escuchando...")
        try:
            r.adjust_for_ambient_noise(source, duration=0.5)
            audio = r.listen(source, timeout=5, phrase_time_limit=5)
            
            if GUI_INSTANCE:
                GUI_INSTANCE.update_status("🧠 Procesando...", "#FFFF00")
            
            try:
                command = r.recognize_google(audio, language="es-ES")
            except sr.RequestError:
                print("[⚠️] Sin conexión. Intentando modo offline...")
                command = r.recognize_sphinx(audio, language="es-ES")
            
            if GUI_INSTANCE:
                GUI_INSTANCE.log_message("USER", command)
                GUI_INSTANCE.update_status("🟢 En Línea", "#00FF00")
            
            return command.lower()

        except sr.WaitTimeoutError:
            if GUI_INSTANCE: GUI_INSTANCE.update_status("🟢 En Línea", "#00FF00")
            return None
        except sr.UnknownValueError:
            if GUI_INSTANCE: GUI_INSTANCE.update_status("🟢 En Línea", "#00FF00")
            return None
        except Exception as e:
            print(f"[❌] Error al escuchar: {e}")
            if GUI_INSTANCE: GUI_INSTANCE.update_status("❌ Error Mic", "red")
            return None

# ───── PROCESAMIENTO DE COMANDOS (PENSAR) ─────
def process_command(text: str):
    """ Núcleo cognitivo básico: Mapea texto a acciones """
    
    log_action(f"Comando recibido: {text}")

    # --- RESPUESTA AL NOMBRE (WAKE WORD) ---
    if text in WAKE_WORDS:
        speak("Aquí estoy. ¿Qué necesitas?")
        return

    # --- COMANDOS DEL SISTEMA ---
    if "hora" in text:
        hora = datetime.datetime.now().strftime("%H:%M")
        speak(f"Son las {hora}")
        return

    if "fecha" in text or "dia" in text:
        fecha = datetime.datetime.now().strftime("%A %d de %B")
        speak(f"Hoy es {fecha}")
        return

    if "sistema" in text or "estado" in text:
        speak("Sistemas operativos funcionando correctamente. Memoria estable.")
        return

    if "salir" in text or "apagar" in text or "descansar" in text:
        speak("Cerrando protocolos. Hasta luego.")
        log_action("Apagado por usuario")
        os._exit(0) # Forzar cierre de hilos

    # --- COMANDOS DE APERTURA (AUTOMATIZACIÓN) ---
    if "abrir" in text or "iniciar" in text:
        if "navegador" in text or "chrome" in text or "internet" in text:
            speak("Abriendo navegador")
            os.system("start chrome")
        elif "bloc de notas" in text or "notas" in text:
            speak("Abriendo notas")
            os.system("start notepad")
        elif "calculadora" in text:
            speak("Abriendo calculadora")
            os.system("calc")
        elif "código" in text or "vscode" in text:
            speak("Abriendo Visual Studio Code")
            try:
                subprocess.Popen(["code", "."] if os.path.exists(".vscode") else ["code"], shell=True)
            except:
                os.system("code")
        elif "terminal" in text or "cmd" in text:
            speak("Abriendo terminal")
            os.system("start cmd")
        else:
            speak("No estoy seguro de qué aplicación abrir.")
        return

    # --- COMANDOS WEB Y MEMORIA ---
    if "reproduce" in text or "pon " in text and ("música" in text or "video" in text or "canción" in text):
        topic = text.replace("reproduce", "").replace("pon", "").replace("música", "").replace("video", "").strip()
        speak(f"Buscando {topic} en YouTube.")
        play_youtube(topic)
        return

    if "busca" in text or "investiga" in text:
        query = text.replace("busca", "").replace("investiga", "").strip()
        msg = search_google(query)
        speak(msg)
        return

    if "quién es" in text or "qué es" in text and "hora" not in text:
        try:
            res = search_wikipedia(text)
            speak(res)
            return
        except:
            pass

    if "recuerda que" in text or "guarda que" in text:
        content = text.replace("recuerda que", "").replace("guarda que", "").strip()
        if "mi nombre es" in content:
            name = content.replace("mi nombre es", "").strip()
            remember("nombre", name)
            speak(f"Entendido. Guardaré que te llamas {name}.")
        else:
            add_note(content)
            speak("He guardado esa nota en mi memoria.")
        return

    if "notas" in text or "recuerdas" in text:
        notes = get_recent_notes()
        speak(notes)
        return

    # --- VISION (OJOS) ---
    # Palabras clave: cámara, camara, verte, ojos, visión, vision, activar
    text_clean = text.lower().replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
    
    if "camara" in text_clean or "verte" in text_clean or "ojos" in text_clean or "vision" in text_clean:
        if "cierra" in text_clean or "apaga" in text_clean or "quita" in text_clean or "desactiva" in text_clean:
            msg = vision_system.close_camera()
            speak(msg)
        else:
            msg = vision_system.open_camera()
            speak(msg)
        return

    if "que ves" in text_clean or "analiza" in text_clean or "mira esto" in text_clean:
        model = get_model()
        if model:
            desc = vision_system.analyze_scene(model)
            speak(desc)
        else:
            speak("No puedo ver porque mi cerebro no está conectado.")
        return

    # --- CONTROL DE SISTEMA (VOLUMEN / APPS) ---
    if "volumen" in text_clean or "sonido" in text_clean or "silencio" in text_clean:
        control_volume(text_clean)
        return

    if "abre" in text_clean or "abrir" in text_clean:
        if "camara" not in text_clean and "ojos" not in text_clean: # Evitar conflicto con visión
            open_app(text_clean)
            return

    if "apagar computadora" in text_clean or "reiniciar computadora" in text_clean or "confirmar apagar" in text_clean or "confirmar reiniciar" in text_clean:
        system_power(text_clean)
        return

    # --- IA GENERATIVA (CEREBRO) ---
    print("[🧠] Consultando a Gemini...")
    if GUI_INSTANCE: GUI_INSTANCE.update_status("🧠 Pensando...", "#FFA500")
    respuesta = ask_brain(text)
    speak(respuesta)

# ───── BUCLE PRINCIPAL (VIVIR) ─────
def agent_loop(gui_ref):
    global GUI_INSTANCE
    GUI_INSTANCE = gui_ref
    
    speak(f"Sistema {AGENT_NAME} en línea. Interfaz gráfica cargada.")
    
    while True:
        try:
            text = listen()
            if text:
                process_command(text)
            time.sleep(0.5)
        except Exception as e:
            print(f"[❌] Error en bucle principal: {e}")

# ───── PUNTO DE ENTRADA ─────
if __name__ == "__main__":
    print("╔════════════════════════════════════╗")
    print(f"║  🤖 {AGENT_NAME} Agent - GUI Mode         ║")
    print("╚════════════════════════════════════╝")
    
    # Lanzar la GUI (que a su vez lanza el agent_loop en un hilo)
    launch_gui(agent_loop)
