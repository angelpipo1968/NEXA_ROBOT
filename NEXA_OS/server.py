from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import threading
import time
import os
import webbrowser

# Configuración del servidor
app = Flask(__name__, template_folder="templates", static_folder="static")
app.config['SECRET_KEY'] = 'nexa_secret_os_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# --- RUTAS ---
@app.route('/')
def index():
    return render_template('index.html')

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
