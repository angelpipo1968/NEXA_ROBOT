# ☁️ Guía de Despliegue en Oracle Cloud (NEXA OS Pro)

Esta guía te permite montar el backend de NEXA en un servidor "Always Free" de Oracle Cloud.

## 1. Crear Instancia (VPS)
1.  Regístrate en [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/).
2.  Ve a **Compute** -> **Instances** -> **Create Instance**.
3.  **Image**: Ubuntu 22.04 Minimal (ARM o AMD).
    *   *Recomendado*: **Ampere (ARM)** con 4 OCPUs y 24GB RAM (¡Es gratis y muy potente!).
4.  **Networking**: Crea una VCN pública y asegúrate de abrir los puertos **80, 443 y 5000** en la "Security List".
5.  Descarga tu clave SSH (`ssh-key.key`).

## 2. Conectarse al Servidor
Usa tu terminal (o Putty):
```bash
ssh -i ssh-key.key ubuntu@TU_IP_PUBLICA
```

## 3. Instalar NEXA Backend
Ejecuta estos comandos en el servidor:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Python y Git
sudo apt install python3-pip python3-venv git -y

# Clonar Repo
git clone https://github.com/angelpipo1968/NEXA_ROBOT.git
cd NEXA_ROBOT

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
pip install gunicorn

# Probar servidor
gunicorn --worker-class eventlet -w 1 -b 0.0.0.0:5000 NEXA_OS.server:app
```

## 4. Mantenerlo Activo (Systemd)
Crea un servicio para que no se apague:

`sudo nano /etc/systemd/system/nexa.service`

Pega esto:
```ini
[Unit]
Description=NEXA OS Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/NEXA_ROBOT
ExecStart=/home/ubuntu/NEXA_ROBOT/venv/bin/gunicorn --worker-class eventlet -w 1 -b 0.0.0.0:5000 NEXA_OS.server:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Guardar (`Ctrl+O`, `Enter`, `Ctrl+X`) y activar:
```bash
sudo systemctl start nexa
sudo systemctl enable nexa
```

## 5. Dominio Personal (DNS)
Si tienes un dominio (ej: `nexa-ai.dev`):
1.  Ve a tu proveedor de dominios (GoDaddy, Namecheap).
2.  Crea un registro **A**.
    *   **Host**: `api` (para `api.nexa-ai.dev`) o `@`.
    *   **Value**: Tu IP de Oracle Cloud.
3.  En la App de NEXA, usa `http://api.nexa-ai.dev:5000` (o configura HTTPS con Caddy/Nginx).
