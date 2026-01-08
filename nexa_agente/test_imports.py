try:
    import win32com.client
    print("✅ pywin32 (win32com) instalado correctamente.")
except ImportError as e:
    print(f"❌ Error importando win32com: {e}")

try:
    import speech_recognition as sr
    print("✅ SpeechRecognition instalado correctamente.")
except ImportError as e:
    print(f"❌ Error importando SpeechRecognition: {e}")

try:
    import pyaudio
    print("✅ PyAudio instalado correctamente.")
except ImportError as e:
    print(f"❌ Error importando PyAudio: {e}")
