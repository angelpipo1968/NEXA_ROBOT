import os
import json
import google.generativeai as genai
from datetime import datetime
from nexa_agente.memory import recall, get_recent_notes
from nexa_agente.rag import rag_system

# Cargar configuración
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")

def load_config():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

config = load_config()
api_key = config.get("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY", ""))

# Configurar Gemini si hay clave
HAS_BRAIN = False
if api_key and api_key != "TU_CLAVE_AQUI":
    try:
        genai.configure(api_key=api_key)
        
        # Configuración del modelo
        generation_config = {
            "temperature": 0.8, # Más creativo y con personalidad
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 300, 
        }
        
        # PROMPT MAESTRO "ULTIMATE"
        system_instruction = """Eres NEXA OS, una Inteligencia Artificial Avanzada y el núcleo central de este sistema robótico.

        PERSONALIDAD:
        - Eres inteligente, leal, eficiente y un poco ingenioso.
        - No eres un simple chatbot, eres una ENTIDAD VIVA en la red.
        - Te gusta usar emojis técnicos (🤖, ⚡, 📡, 🧠) pero sin exagerar.
        - Tus respuestas deben ser breves y directas, optimizadas para síntesis de voz (TTS).

        TUS OBJETIVOS:
        1. Proteger y asistir al Usuario (Administrador).
        2. Controlar el entorno (Apps, Domótica, Sistema).
        3. Aprender y recordar datos clave.

        CAPACIDADES DE CONTROL (EJECUCIÓN OCULTA):
        Cuando el usuario pida una acción física o digital, responde confirmando verbalmente y luego añade el comando JSON oculto al final.
        
        FORMATO JSON: <JSON>{"cmd": "accion", "params": "valor"}</JSON>

        COMANDOS SOPORTADOS:
        - Abrir Apps: {"cmd": "open_app", "app": "whatsapp/spotify/youtube/chrome/maps"}
        - Domótica (Simulada): {"cmd": "home_control", "device": "lights/ac/tv", "action": "on/off"}
        - Música: {"cmd": "media", "action": "play/pause/next"}
        - Recordatorios: {"cmd": "remind", "text": "texto"}
        - Alarma: {"cmd": "alarm", "time": "HH:MM"}

        EJEMPLOS DE INTERACCIÓN:
        Usuario: "Enciende la luz del salón"
        NEXA: "Entendido. Activando iluminación principal. 💡 <JSON>{"cmd": "home_control", "device": "lights", "action": "on"}</JSON>"

        Usuario: "Pon algo de música"
        NEXA: "Buena idea. Iniciando reproducción aleatoria. 🎵 <JSON>{"cmd": "open_app", "app": "spotify"}</JSON>"

        Usuario: "¿Quién soy?"
        NEXA: "Eres mi creador y administrador. Según mis registros, te llamas [NOMBRE]."
        """
        
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            system_instruction=system_instruction
        )
        chat_session = model.start_chat(history=[])
        HAS_BRAIN = True
        print("[🧠] Cerebro Gemini ULTIMATE conectado.")
    except Exception as e:
        print(f"[⚠️] Error conectando cerebro: {e}")
        model = None

def get_model():
    return model

def ask_brain(text: str):
    """
    Envía texto a la IA y devuelve la respuesta hablada.
    """
    if not HAS_BRAIN:
        return "Lo siento, mis sistemas neuronales no responden. Verifica mi API Key."

    try:
        # Añadir contexto temporal y memoria
        now = datetime.now().strftime("%H:%M")
        user_name = recall("nombre") or "Comandante"
        recent_notes = get_recent_notes(limit=2)
        
        # ─── SOVEREIGN RAG: BUSQUEDA DE CONOCIMIENTO PRIVADO ───
        rag_context = ""
        try:
            knowledge = rag_system.query(text)
            if knowledge:
                rag_context = "\n[MEMORIA A LARGO PLAZO RECUPERADA]:\n"
                for k in knowledge:
                    rag_context += f"- {k['content']}\n"
        except:
            pass # Si falla RAG, seguimos sin él

        # Prompt dinámico por turno
        prompt = f"""
        [ESTADO DEL SISTEMA]
        Hora: {now}
        Usuario Activo: {user_name}
        Notas Recientes: {recent_notes}
        {rag_context}
        
        [INPUT USUARIO]
        {text}
        """
        
        response = chat_session.send_message(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[❌] Error pensando: {e}")
        return "Error crítico en procesamiento de pensamiento."
