# Expansión Total de NEXA ROBOT V2 🚀

Implementaremos todas las mejoras sugeridas para convertir a Neuronex en un asistente robótico completo, capaz de ver, recordar y controlar el mundo físico.

## 1. Módulo de Visión (Ojos del Robot) 👁️
Habilitaremos la cámara del dispositivo para que la IA pueda "ver" y analizar lo que tiene enfrente.
- **Técnica:** Usar `navigator.mediaDevices.getUserMedia` para capturar video.
- **Análisis:** Enviar frames capturados a un modelo multimodal (como LLaVA o GPT-4o-mini si está disponible, o simular análisis por ahora) o usar la API de detección de objetos del navegador.
- **Integración:** Añadir un botón de "Analizar Entorno" en la UI.

## 2. Memoria Persistente (Cerebro a Largo Plazo) 🧠
El robot recordará conversaciones pasadas incluso si cierras la app.
- **Técnica:** Usar `localStorage` o `IndexedDB` para guardar el historial de chat.
- **Funcionalidad:** Cargar los últimos mensajes al iniciar.
- **Gestión:** Añadir comando de voz/botón para "Olvidar memoria" (borrar datos).

## 3. Integración de Hardware (Manos y Sentidos) 🤖
Preparar la comunicación con microcontroladores (Arduino/ESP32) vía Bluetooth o WiFi.
- **Simulación Inicial:** Como no tenemos el hardware físico conectado ahora, crearemos una interfaz de control en la UI (botones para "Mover Brazo", "Encender LED") que envíen comandos simulados o peticiones HTTP a un endpoint local (ej. `http://esp32-robot.local/command`).
- **Protocolo:** Definir un protocolo JSON simple para comandos: `{ "action": "move_arm", "value": 90 }`.

## 4. Personalidad de IA (Alma del Robot) 🎭
Refinar el "System Prompt" para que la IA tenga una identidad única, coherente y atractiva.
- **Identidad:** "Neuronex", un asistente avanzado, servicial, con un toque de humor sci-fi.
- **Contexto:** Inyectar información del estado del robot (batería, sensores simulados) en el prompt para que la IA sea consciente de su "cuerpo".

---

### Plan de Ejecución

1.  **Refinar Personalidad & Memoria:** Actualizar `core.js` para gestionar historial y mejorar el prompt del sistema.
2.  **Implementar Visión:** Añadir vista de cámara en `index.html` y lógica de captura en `core.js`.
3.  **Interfaz de Hardware:** Añadir panel de control en `index.html` y lógica de envío de comandos.
4.  **Actualizar Despliegue:** Generar nueva versión firmada y actualizar la app híbrida.
