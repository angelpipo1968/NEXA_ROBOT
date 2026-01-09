from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time
import os
import webbrowser
from werkzeug.utils import secure_filename
from nexa_agente.rag import rag_system

# Configuración del servidor
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app) # Permitir CORS para la app móvil
app.config['SECRET_KEY'] = 'nexa_secret_os_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Configurar carpeta de conocimiento
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KNOWLEDGE_FOLDER = os.path.join(BASE_DIR, 'knowledge')
os.makedirs(KNOWLEDGE_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = KNOWLEDGE_FOLDER

# --- RUTAS ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload_knowledge', methods=['POST'])
def upload_knowledge():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Ingestar en RAG inmediatamente
        success = rag_system.ingest_file(filepath)
        
        if success:
            return jsonify({"message": f"Archivo {filename} aprendido exitosamente."}), 200
        else:
            return jsonify({"error": "Error al procesar en RAG"}), 500

# --- WEBSOCKETS ---
@socketio.on('connect')
def handle_connect():
    print('[WEB] Cliente conectado: NEXA OS UI')
    emit('system_log', {'text': 'Conexión establecida con el Núcleo.'})

@socketio.on('user_command')
def handle_command(data):
    command = data.get('text', '')
    print(f'[WEB] Comando recibido: {command}')
    
    # Aquí procesaremos los comandos más adelante
    # Por ahora, solo respondemos como eco
    emit('system_log', {'text': f'Procesando: {command}'})
    emit('nexa_response', {'text': f'He recibido tu comando: {command}'})

def start_server():
    """Inicia el servidor Flask."""
    print("------------------------------------------")
    print("🚀 NEXA OS - SERVIDOR WEB INICIADO")
    print("🌐 Entra a: http://localhost:5000")
    print("------------------------------------------")
    webbrowser.open("http://localhost:5000") # Abrir automáticamente
    socketio.run(app, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    start_server()
