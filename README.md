# 🤖 NEXA ROBOT V2 - Sistema Operativo Neural

Bienvenido a **NEXA ROBOT V2**, un asistente robótico avanzado diseñado para ejecutarse en navegadores y dispositivos móviles, conectándose a una IA local (Ollama) y hardware físico (ESP32).

---

## 🌟 Características Principales

### 🧠 Inteligencia Artificial
- **IA Local**: Se conecta a Ollama (`qwen2.5-7b`) para conversaciones privadas y sin límites.
- **Personalidad**: Tiene emociones (Feliz, Alerta, Pensativo) que cambian el color de su núcleo 3D.
- **Memoria**: Recuerda tu nombre y conversaciones anteriores.

### 👁️ Visión Artificial (Face ID)
- **Detección Facial**: Detecta rostros en tiempo real usando `face-api.js`.
- **Reconocimiento**: Aprende tu cara y te saluda por tu nombre.
- **Análisis de Entorno**: Puede describir lo que ve usando el modelo `llava`.

### 🗣️ Voz y Oído
- **Comandos de Voz**: "Enciende la luz", "Escanear", "Mi nombre es...".
- **Respuesta de Voz**: Te habla usando la síntesis de voz del navegador.

### 📚 Base de Conocimiento (RAG)
- **Aprendizaje**: Puedes enseñarle datos (ej. claves WiFi, notas) que guardará en su memoria.
- **Recuperación**: Usa esa información para responder tus preguntas.

### ⚙️ Control Total
- **Panel de Hardware**: Botones para controlar LEDs y sensores.
- **Configuración Dinámica**: Cambia la IP de la IA y el Hardware desde la app sin tocar código.

---

## 🚀 Instalación Rápida

### 1. Requisitos Previos
- **Ollama**: Instalado en tu PC con los modelos `qwen2.5-7b-instruct` y `llava`.
- **Servidor Web**: Python o cualquier servidor estático para alojar los archivos.

### 2. Despliegue
#### Opción A: Automática (Recomendada)
Haz doble clic en el archivo `start_nexa.bat`. Se abrirán 3 ventanas de terminal automáticamente con todo lo necesario.

#### Opción B: Manual
1.  Ejecuta el servidor en la carpeta `deploy`:
    ```bash
    cd deploy
    python cors_server.py 8081
    ```
2.  (Opcional) Ejecuta el simulador de hardware:
    ```bash
    cd deploy
    python mock_hardware.py
    ```
3.  Accede desde tu navegador: `http://localhost:8081`

### 3. Configuración en Móvil
1.  Asegúrate de que tu móvil y PC estén en la misma red Wi-Fi.
2.  Abre la app o la web en tu móvil.
3.  Ve al botón **⚙️ (Ajustes)**.
4.  Cambia la URL de IA a la IP de tu PC:
    *   `http://192.168.1.X:11434/v1/chat/completions`
5.  ¡Listo!

---

## 🎮 Guía de Uso

### Botonera Inferior
- �️ **Visión**: Activa la cámara. Si ve una cara desconocida, pulsa "Aprender Rostro".
- 🎤 **Micrófono**: Habla con NEXA.
- 🤖 **Hardware**: Control manual de luces y sensores.
- 📚 **Conocimiento**: Escribe notas para que NEXA las recuerde.
- ⚙️ **Ajustes**: Configura IPs y nombre del robot.

### Comandos de Voz Útiles
- *"Enciende la luz"* / *"Apaga la luz"*
- *"Escanear sistema"*
- *"Mi nombre es [Nombre]"*
- *"¿Qué ves?"* (Con cámara activa)

---

## 🛠️ Estructura del Proyecto
- `core.js`: Cerebro lógico (IA, Visión, Voz).
- `index.html`: Interfaz de usuario.
- `styles.css`: Estilos Cyberpunk.
- `deploy/`: Carpeta lista para producción.
- `models/`: Modelos de IA para reconocimiento facial.

---

**Desarrollado con ❤️ y ⚡ por NEXA Ai.Dev**
