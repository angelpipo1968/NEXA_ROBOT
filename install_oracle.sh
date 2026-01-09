#!/bin/bash

echo "🚀 INICIANDO DESPLIEGUE DE NEXA OS EN ORACLE CLOUD..."

# 1. Actualizar Sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias del sistema (Audio, Video, Build tools)
sudo apt install -y python3-pip python3-venv git libgl1-mesa-glx libglib2.0-0 portaudio19-dev python3-dev build-essential

# 3. Configurar Firewall (Abrir puerto 5000)
echo "🛡️ Configurando Firewall..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 5000 -j ACCEPT
sudo netfilter-persistent save

# 4. Preparar entorno Python
if [ ! -d "venv" ]; then
    echo "🐍 Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate

# 5. Instalar librerías Python
echo "📦 Instalando dependencias de NEXA..."
pip install --upgrade pip
pip install -r requirements.txt

# 6. Crear servicio Systemd (para que arranque solo)
echo "⚙️ Creando servicio de auto-arranque..."
SERVICE_FILE=/etc/systemd/system/nexa.service

sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=NEXA OS Backend
After=network.target

[Service]
User=$USER
WorkingDirectory=$PWD
ExecStart=$PWD/venv/bin/gunicorn --worker-class eventlet -w 1 -b 0.0.0.0:5000 NEXA_OS.server:app
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# 7. Iniciar NEXA
sudo systemctl daemon-reload
sudo systemctl start nexa
sudo systemctl enable nexa

echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE!"
echo "-----------------------------------------------------"
echo "🌐 Tu servidor está activo en: http://$(curl -s ifconfig.me):5000"
echo "-----------------------------------------------------"
