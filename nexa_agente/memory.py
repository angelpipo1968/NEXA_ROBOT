import sqlite3
import os
import pymongo
from datetime import datetime

# --- CONFIGURACIÓN MONGODB (NUBE) ---
MONGO_URI = os.getenv('MONGO_URI')
mongo_client = None
mongo_db = None

if MONGO_URI:
    try:
        mongo_client = pymongo.MongoClient(MONGO_URI)
        mongo_db = mongo_client.get_database()
        print("[☁️] Conectado a MongoDB Atlas (Nube)")
    except Exception as e:
        print(f"[❌] Error conectando a MongoDB: {e}")

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "nexa_memory.db")

def init_memory():
    """Inicializa la base de datos (Local o Nube)."""
    if mongo_db is not None:
        return # MongoDB no necesita init

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabla de preferencias de usuario
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_data (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TEXT
        )
    ''')
    
    # Tabla de recordatorios/notas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT,
            created_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def remember(key: str, value: str):
    """Guarda un dato clave-valor sobre el usuario."""
    now = datetime.now().isoformat()
    
    if mongo_db is not None:
        mongo_db.user_data.update_one(
            {"key": key},
            {"$set": {"value": value, "updated_at": now}},
            upsert=True
        )
        return f"He guardado en la nube que {key} es {value}."

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO user_data (key, value, updated_at)
        VALUES (?, ?, ?)
    ''', (key, value, now))
    conn.commit()
    conn.close()
    return f"He guardado que {key} es {value}."

def recall(key: str):
    """Recupera un dato específico."""
    if mongo_db is not None:
        result = mongo_db.user_data.find_one({"key": key})
        return result['value'] if result else None

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT value FROM user_data WHERE key = ?', (key,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return result[0]
    return None

def add_note(content: str):
    """Guarda una nota general."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    if mongo_db is not None:
        mongo_db.notes.insert_one({"content": content, "created_at": now})
        return "Nota guardada en la nube."

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO notes (content, created_at) VALUES (?, ?)', (content, now))
    conn.commit()
    conn.close()
    return "Nota guardada en mi memoria."

def get_recent_notes(limit=3):
    """Recupera las últimas notas."""
    if mongo_db is not None:
        notes = list(mongo_db.notes.find().sort("_id", -1).limit(limit))
        if not notes: return "No tengo notas recientes en la nube."
        return "Tus últimas notas son: " + ". ".join([f"{n['created_at']}: {n['content']}" for n in notes])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT content, created_at FROM notes ORDER BY id DESC LIMIT ?', (limit,))
    notes = cursor.fetchall()
    conn.close()
    
    if not notes:
        return "No tengo notas recientes."
    
    return "Tus últimas notas son: " + ". ".join([f"{n[1]}: {n[0]}" for n in notes])

# Inicializar al importar
init_memory()
