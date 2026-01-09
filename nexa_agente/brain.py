import os
import json
import google.generativeai as genai
from datetime import datetime
from nexa_agente.memory import recall
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
api_key = config.get("GEMINI_API_KEY", "")

# Configurar Gemini si hay clave
HAS_BRAIN = False
if api_key and api_key != "TU_CLAVE_AQUI":
    try:
        genai.configure(api_key=api_key)
        
        # Configuración del modelo
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 200, # Respuestas cortas para voz
        }
        
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
            system_instruction="Eres NEXA, un asistente robot avanzado y leal. Tus respuestas son breves, precisas y útiles, diseñadas para ser leídas en voz alta. No uses formato markdown complejo (como negritas o listas largas) porque hablas. Responde siempre en español de forma natural pero robótica."
        )
        chat_session = model.start_chat(history=[])
        HAS_BRAIN = True
        print("[🧠] Cerebro Gemini conectado.")
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
        return "Lo siento, mi cerebro de IA no está configurado. Necesito una clave de API."

    try:
        # Añadir contexto temporal y memoria
        now = datetime.now().strftime("%H:%M")
        user_name = recall("nombre") or "Usuario"
        
        # ─── SOVEREIGN RAG: BUSQUEDA DE CONOCIMIENTO PRIVADO ───
        rag_context = ""
        knowledge = rag_system.query(text)
        if knowledge:
            rag_context = "\n[INFORMACIÓN CONFIDENCIAL RECUPERADA]:\n"
            for k in knowledge:
                rag_context += f"- {k['content']} (Fuente: {k['source']})\n"
            rag_context += "\nUsa esta información SOLO si es relevante. Es SECRETA.\n"

        # Prompt enriquecido con memoria
        prompt = f"""
        [Contexto del Sistema]
        Hora: {now}
        Usuario: {user_name}
        {rag_context}
        
        [Instrucción]
        Eres NEXA. Responde al usuario de forma breve y útil.
        
        Usuario dice: {text}
        """
        
        response = chat_session.send_message(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[❌] Error pensando: {e}")
        return "Tuve un error procesando eso."
