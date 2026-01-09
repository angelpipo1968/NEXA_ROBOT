# Expansión de NEXA ROBOT V2: Fase de Inteligencia Real y Sensores 🧠🔌

Para llevar a NEXA al siguiente nivel, propongo una integración real de sus capacidades. Ya tenemos la interfaz y la simulación, ahora conectemos el "cerebro" y los "sentidos" de verdad.

## 1. Integración de Visión Real con IA (Ollama LLaVA) 👁️
En lugar de simular que ve una "taza de café", haremos que el robot *realmente* vea.
- **Acción:** Modificar `core.js` para enviar la imagen capturada por la cámara (base64) al endpoint de Ollama.
- **Modelo:** Usaremos `llava` (o `moondream` si tienes poca VRAM), que son modelos multimodales capaces de describir imágenes.
- **Flujo:** Captura frame -> Envía a API local -> IA describe lo que ve -> Lo muestra en pantalla y lo habla.

## 2. Panel de Diagnóstico del Sistema 📊
Un robot necesita saber cómo está funcionando.
- **Acción:** Crear un panel en la UI que muestre métricas "reales" (o simuladas con más detalle por ahora):
    - Uso de CPU/RAM (del servidor Python).
    - Latencia de la IA.
    - Estado de la conexión.
- **Implementación:** Un pequeño endpoint en Python que devuelva `psutil` data y el frontend lo consuma.

## 3. Comando de Voz "Despierta" (Keyword Spotting) 🎤
Que el robot no necesite que presiones el botón, sino que reaccione a "NEXA".
- **Acción:** Implementar una detección simple de palabra clave en el navegador (usando Web Speech API en modo continuo, aunque es experimental, o una librería ligera como `Annyang` si decidimos añadirla, pero intentaremos nativo primero).

---

### Recomendación Inmediata: **Visión Real con LLaVA** 🚀
Es lo más impresionante. Transformará tu robot de un "juguete" a una herramienta de reconocimiento visual real.

### Plan de Ejecución

1.  **Backend (Python):** Verificar/Crear un endpoint proxy en `cors_server.py` o asegurar que Ollama acepte imágenes en base64 desde el frontend.
2.  **Frontend (JS):** Actualizar `analyzeFrame()` en `core.js` para capturar el canvas, convertir a base64 y enviarlo a la API de Ollama especificando el modelo `llava`.
3.  **UI:** Mejorar el feedback visual durante el análisis (spinner, efectos).
4.  **Despliegue:** Actualizar todo y generar nueva versión firmada.
