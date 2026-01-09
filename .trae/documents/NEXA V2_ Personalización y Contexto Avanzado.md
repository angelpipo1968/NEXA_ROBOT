# Expansión Final de NEXA ROBOT V2: Personalización y Contexto Avanzado 🎨🧠

Para completar esta fase y darle el toque final de sofisticación, propongo implementar:

## 1. Módulo de Personalización de Usuario 👤
Permitir que el usuario configure su nombre y preferencias para que NEXA sea más personal.
- **Acción:** Añadir un pequeño modal o comando de configuración en la UI.
- **Persistencia:** Guardar el nombre del usuario en `localStorage` y usarlo en el `SYSTEM_PROMPT`.

## 2. Detección de Contexto Ambiental (Simulado) 🌦️
Hacer que NEXA reaccione al "clima" o la "hora del día".
- **Acción:** En `core.js`, leer la hora local y ajustar el saludo o el estado emocional inicial (ej. "Buenas noches, [Usuario]. Mis sensores nocturnos están activos").
- **Visual:** Cambiar sutilmente el fondo o la iluminación de las partículas según sea de día o de noche.

## 3. Comandos de Voz Avanzados ("Habilidades") 🗣️⚡
Añadir palabras clave específicas que desencadenen acciones directas sin pasar por la IA (para mayor rapidez).
- **Acción:** Detectar frases como "Enciende la luz", "Reporte de estado", "Silencio" directamente en el reconocimiento de voz.

---

### Plan de Ejecución

1.  **Actualizar `core.js`:**
    *   Implementar lógica de saludo basado en la hora.
    *   Añadir manejo de nombre de usuario (prompt inicial si no existe).
    *   Implementar parser de comandos de voz locales.
2.  **Actualizar UI:**
    *   Asegurar que el saludo inicial refleje el contexto.
3.  **Despliegue Final:** Actualizar los archivos para la versión definitiva.
