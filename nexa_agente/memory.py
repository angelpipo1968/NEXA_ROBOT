import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "nexa_memory.db")

def init_memory():
    """Inicializa la base de datos si no existe."""
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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    cursor.execute('''
        INSERT OR REPLACE INTO user_data (key, value, updated_at)
        VALUES (?, ?, ?)
    ''', (key, value, now))
    
    conn.commit()
    conn.close()
    return f"He guardado que {key} es {value}."

def recall(key: str):
    """Recupera un dato específico."""
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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    cursor.execute('INSERT INTO notes (content, created_at) VALUES (?, ?)', (content, now))
    conn.commit()
    conn.close()
    return "Nota guardada en mi memoria."

def get_recent_notes(limit=3):
    """Recupera las últimas notas."""
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
