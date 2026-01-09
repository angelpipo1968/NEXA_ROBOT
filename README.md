# 🤖 NEXA ROBOT V2.0 - CLOUD EDITION

**Sistema Operativo Neural con Cerebro en la Nube y Command Center Futurista.**

Bienvenido a la evolución de NEXA. Ahora más potente, más rápido y disponible en cualquier lugar gracias a su arquitectura Cloud.

---

## 🌟 Novedades V2.0

### ☁️ Arquitectura Cloud (Render + Google Gemini)
- **Sin Servidor Local**: Ya no necesitas tener tu PC encendida para que el robot piense.
- **Cerebro Gemini**: Usa la IA de Google (Gemini 1.5 Flash) para respuestas inteligentes y rápidas.
- **Base de Datos Mongo**: Recuerda usuarios y conversaciones en la nube.

### 📱 Command Center (Dashboard UI)
- **Interfaz Futurista**: Nuevo diseño tipo HUD/Reactor.
- **Control Total**: Botones directos para abrir WhatsApp, YouTube, Cámara y más.
- **Voz y Texto**: Habla o escribe tus comandos.

### 💳 Sistema PRO (Stripe)
- Integración con pasarela de pagos para funciones premium (preparado).

---

## 🚀 Guía de Instalación

### 1. Servidor (Backend)
El cerebro vive en **Render**.
- Repositorio: `NEXA_ROBOT`
- URL: `https://nexa-app.onrender.com`
- Variables de Entorno:
    - `GEMINI_API_KEY`: Tu clave de Google AI.
    - `STRIPE_SECRET_KEY`: Tu clave de Stripe.
    - `SECRET_KEY`: Tu clave de seguridad Flask.

### 2. Aplicación Móvil (APK)
El cuerpo vive en tu Android.
- **Generar APK**: Ejecuta el script `build_apk.ps1` en Windows.
- **Instalar**: Copia el archivo `NEXA_ROBOT_V2.apk` a tu móvil.

---

## 🎮 Manual de Comandos

### Acciones Directas (Botones)
- **WhatsApp**: Abre la app de mensajería.
- **YouTube**: Abre la app de videos.
- **Cámara**: Abre la cámara nativa o web.
- **Visión**: Activa el análisis de entorno con IA.

### Comandos de Voz
- *"Abrir WhatsApp"*
- *"Cuéntame un chiste"*
- *"¿Qué es la computación cuántica?"*

---

## 🛠️ Tecnologías
- **Frontend**: HTML5, CSS3 (Futuristic UI), JS (Capacitor).
- **Backend**: Python (Flask), Socket.IO.
- **IA**: Google Gemini 1.5.
- **Nube**: Render.com.

---

**Desarrollado con ❤️ y ⚡ por NEXA Ai.Dev**
