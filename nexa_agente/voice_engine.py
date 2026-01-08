import os
import asyncio
import pygame
import tempfile
import edge_tts
import win32com.client

# Inicializar pygame mixer para reproducción de audio
try:
    pygame.mixer.init()
except Exception as e:
    print(f"[⚠️] Error al iniciar audio mixer: {e}")

# Mapa de voces neurales preferidas
# Puedes ver todas con `edge-tts --list-voices`
VOICE_MAP = {
    "es": "es-ES-ElviraNeural",  # Voz femenina española natural
    "en": "en-US-JennyNeural",   # Voz femenina inglés estándar
    "zh": "zh-CN-XiaoxiaoNeural",
    "fr": "fr-FR-DeniseNeural",
    "de": "de-DE-KatjaNeural",
}

async def _generate_neural_speech(text: str, voice: str, output_file: str) -> bool:
    """Genera el archivo de audio usando Edge TTS."""
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_file)
        return True
    except Exception as e:
        print(f"[⚠️] Error generando voz neural: {e}")
        return False

def speak_sapi(text: str):
    """Fallback: Usa la voz nativa de Windows (SAPI) si no hay internet."""
    try:
        speaker = win32com.client.Dispatch("SAPI.SpVoice")
        speaker.Speak(text)
    except Exception as e:
        print(f"[❌] Error crítico en voz SAPI: {e}")
        # Último recurso: imprimir
        print(f"[🗣️ MUDO]: {text}")

def play_audio(file_path: str):
    """Reproduce un archivo de audio bloqueando la ejecución hasta terminar."""
    try:
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()
        
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
            
        pygame.mixer.music.unload()
    except Exception as e:
        print(f"[⚠️] Error reproduciendo audio: {e}")

def speak(text: str, lang: str = "es"):
    """
    Función principal para hablar.
    Intenta voz neural online primero, luego cae a SAPI offline.
    """
    print(f"[🗣️ NEXA]: {text}")
    
    # Seleccionar voz neural
    voice = VOICE_MAP.get(lang, "es-ES-ElviraNeural")
    
    # Crear archivo temporal
    # Usamos delete=False para que pygame pueda abrirlo, luego lo borramos manual
    fd, temp_path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    
    try:
        # Intentar generar voz neural (requiere asyncio runner)
        success = False
        try:
            asyncio.run(_generate_neural_speech(text, voice, temp_path))
            success = True
        except Exception as e:
            print(f"[⚠️] Fallo en Edge TTS (¿Sin internet?): {e}")
        
        # Reproducir o Fallback
        if success and os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
            play_audio(temp_path)
        else:
            print("[ℹ️] Usando modo offline (SAPI)...")
            speak_sapi(text)
            
    finally:
        # Limpieza
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except:
            pass

if __name__ == "__main__":
    print("Probando voz neural...")
    speak("Hola, soy Nexa con mi nueva voz neural mejorada.", "es")
    speak("Hello, I am testing my new voice.", "en")
