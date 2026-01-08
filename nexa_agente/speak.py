# speak.py – Síntesis de voz multilingüe en Windows
try:
    import win32com.client
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False
    print("⚠️  pywin32 no disponible. La voz no funcionará en modo local.")

import subprocess

def get_voices():
    """Lista todas las voces disponibles en el sistema."""
    if not HAS_WIN32:
        return []
    speaker = win32com.client.Dispatch("SAPI.SpVoice")
    return [v.GetAttribute("Name") for v in speaker.GetVoices()]

def speak(text: str, lang: str = "es", rate: int = 0):
    """
    Habla un texto en el idioma especificado.
    lang: 'es', 'en', 'zh', etc.
    """
    if not HAS_WIN32:
        print(f"[Texto] {text}")
        return

    speaker = win32com.client.Dispatch("SAPI.SpVoice")
    voices = speaker.GetVoices()

    # Mapeo de idiomas a nombres de voces comunes
    lang_voice_map = {
        "es": ["Helena", "Sabina", "es-ES"],
        "en": ["Zira", "Jenny", "en-US", "en-GB"],
        "zh": ["Huihui", "Yaoyao", "zh-CN"],
        "fr": ["Hortense", "fr-FR"],
        "de": ["Katja", "de-DE"],
    }

    target_voices = lang_voice_map.get(lang.lower()[:2], [""])
    selected_voice = None

    for voice in voices:
        name = voice.GetAttribute("Name")
        if any(v in name for v in target_voices):
            selected_voice = voice
            break

    if selected_voice:
        speaker.Voice = selected_voice
        speaker.Rate = rate  # -10 a +10 (0 normal)
        print(f"[🗣️] Hablando en {lang.upper()} con voz: {selected_voice.GetAttribute('Name')}")
        speaker.Speak(text)
    else:
        print(f"[⚠️] Voz para '{lang}' no encontrada. Usando predeterminada.")
        speaker.Speak(text)

# Ejemplo de uso
if __name__ == "__main__":
    speak("¡Hola! Soy tu asistente NEXA.", lang="es")
    speak("Starting server.", lang="en")
