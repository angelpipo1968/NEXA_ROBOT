import pywhatkit
import wikipedia
import webbrowser
from datetime import datetime

# Configurar wikipedia en español
try:
    wikipedia.set_lang("es")
except:
    pass

def play_youtube(topic: str):
    """Reproduce el primer video que encuentre en YouTube."""
    try:
        print(f"[🌐] Buscando en YouTube: {topic}")
        pywhatkit.playonyt(topic)
        return f"Reproduciendo {topic} en YouTube."
    except Exception as e:
        print(f"[❌] Error YouTube: {e}")
        return "No pude abrir YouTube."

def search_google(query: str):
    """Realiza una búsqueda en Google."""
    try:
        print(f"[🌐] Buscando en Google: {query}")
        pywhatkit.search(query)
        return f"He buscado {query} en Google para ti."
    except Exception as e:
        return "Hubo un error al buscar."

def search_wikipedia(query: str):
    """Busca un resumen en Wikipedia."""
    try:
        print(f"[🌐] Consultando Wikipedia: {query}")
        summary = wikipedia.summary(query, sentences=2)
        return summary
    except wikipedia.exceptions.DisambiguationError:
        return "Hay demasiados resultados para eso, sé más específico."
    except wikipedia.exceptions.PageError:
        return "No encontré nada en Wikipedia sobre eso."
    except Exception as e:
        return "Error consultando la enciclopedia."
