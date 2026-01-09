import sys
import os

# Agregar directorio raíz al path para poder importar nexa_agente
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, render_template, request, jsonify, redirect
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time
import os
import json
import jwt
import stripe
import datetime
import webbrowser
from dotenv import load_dotenv

# Cargar variables de entorno (.env)
load_dotenv()

from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from nexa_agente.rag import rag_system
from nexa_agente.brain import ask_brain
import google.generativeai as genai

# Configuración del servidor
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app) # Permitir CORS para la app móvil

# Clave secreta para sesiones (Importante en producción)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'nexa_secret_os_key_dev')

socketio = SocketIO(app, cors_allowed_origins="*")

# --- CONFIGURACIÓN DE IA (GEMINI) ---
GEMINI_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
else:
    print("⚠️ [ADVERTENCIA] No se detectó GEMINI_API_KEY. La IA no funcionará.")

# --- CONFIGURACIÓN DE STRIPE ---
# ⚠️ REEMPLAZA CON TU CLAVE SECRETA DE STRIPE
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_51P...') 
DOMAIN = os.getenv('DOMAIN', 'http://localhost:5000')

# --- SISTEMA DE USUARIOS (MVP: JSON) ---
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')

def load_users():
    if not os.path.exists(USERS_FILE): return {}
    with open(USERS_FILE, 'r') as f: return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f: json.dump(users, f, indent=4)

# Configurar carpeta de conocimiento
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KNOWLEDGE_FOLDER = os.path.join(BASE_DIR, 'knowledge')
os.makedirs(KNOWLEDGE_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = KNOWLEDGE_FOLDER

# --- RUTAS ---
@app.route('/')
def index():
    return render_template('index.html')

# --- AUTENTICACIÓN ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    users = load_users()
    email = data.get('email')
    password = data.get('password')
    
    if email in users:
        return jsonify({"error": "Usuario ya existe"}), 400
        
    users[email] = {
        "password": generate_password_hash(password),
        "plan": "free", # free, pro
        "created_at": str(datetime.datetime.now())
    }
    save_users(users)
    return jsonify({"message": "Usuario registrado"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    users = load_users()
    email = data.get('email')
    password = data.get('password')
    
    if email not in users or not check_password_hash(users[email]['password'], password):
        return jsonify({"error": "Credenciales inválidas"}), 401
        
    token = jwt.encode({
        'user': email,
        'plan': users[email]['plan'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({"token": token, "plan": users[email]['plan']})

# --- PROXY DE INTELIGENCIA ARTIFICIAL (NUBE) ---
@app.route('/api/chat', methods=['POST'])
def chat_proxy():
    """Procesa el chat usando Gemini (Nube) en lugar de Ollama local."""
    data = request.json
    messages = data.get('messages', [])
    
    if not messages:
        return jsonify({"error": "No messages provided"}), 400
        
    last_msg = messages[-1]['content']
    
    # Usar el cerebro central (que ya tiene RAG y Memoria)
    try:
        response_text = ask_brain(last_msg)
        return jsonify({
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": response_text
                }
            }]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/vision', methods=['POST'])
def vision_proxy():
    """Procesa imágenes con Gemini Vision."""
    data = request.json
    image_b64 = data.get('image') # Base64 string
    prompt = data.get('prompt', 'Describe esta imagen.')
    
    if not image_b64:
        return jsonify({"error": "No image provided"}), 400
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Crear objeto de imagen para Gemini (requiere decodificación o estructura específica)
        # Simplificación: Asumimos que Gemini SDK acepta partes de imagen
        # En producción, se debe convertir b64 a bytes o usar PIL
        
        response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_b64}])
        
        return jsonify({
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": response.text
                }
            }]
        })
    except Exception as e:
        print(f"Error Vision: {e}")
        return jsonify({"choices": [{"message": {"role": "assistant", "content": f"[Error Visual]: {str(e)}"}} ]})


# --- PAGOS STRIPE ---
@app.route('/api/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': 'NEXA OS Pro'},
                    'unit_amount': 2000, # $20.00
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=DOMAIN + '/success',
            cancel_url=DOMAIN + '/cancel',
        )
        return jsonify({'id': checkout_session.id})
    except Exception as e:
        return jsonify(error=str(e)), 403

@app.route('/upload_knowledge', methods=['POST'])
def upload_knowledge():
    # Verificar Token (Simplificado)
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "No autorizado"}), 401
    
    # ... (Resto de la lógica de subida) ...
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
    
    # Verificar certificados reales
    cert_file = os.path.join(BASE_DIR, "cert.pem")
    key_file = os.path.join(BASE_DIR, "key.pem")
    ssl_context = None
    
    if os.path.exists(cert_file) and os.path.exists(key_file):
        print("🔒 Certificados SSL detectados (cert.pem, key.pem)")
        ssl_context = (cert_file, key_file)
        print("🌐 Entra a: https://localhost:5000")
    else:
        print("⚠️ No hay certificados reales. Usando modo Adhoc (Auto-firmado).")
        print("🌐 Entra a: https://localhost:5000 (Acepta la advertencia de seguridad)")
        ssl_context = 'adhoc'

    print("------------------------------------------")
    
    # Iniciar servidor (FORZADO HTTP para evitar errores de SSL/Eventlet)
    print("⚠️ Modo HTTP Forzado para Debugging Local")
    print("🌐 Entra a: http://localhost:5000")
    
    # Abrir navegador automáticamente
    threading.Timer(1.5, lambda: webbrowser.open("http://localhost:5000")).start()

    socketio.run(app, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    start_server()
