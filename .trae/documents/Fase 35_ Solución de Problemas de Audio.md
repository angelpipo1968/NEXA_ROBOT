# Fase 35: Reparación de Voz (TTS) 🗣️🔧

El usuario reporta: "no habla todavía".
Esto significa que aunque recibe el texto, **no se escucha el audio**.

## Posibles Causas
1.  **Navegador Móvil (Chrome/WebView)**: A menudo bloquean el audio automático (`autoplay`) si no hay interacción previa del usuario (un "tap").
2.  **Configuración de Idioma**: `SpeechSynthesisUtterance` puede fallar si no encuentra una voz en español (`es-ES` o `es-419`).
3.  **Volumen**: Podría ser obvio, pero a veces es el volumen multimedia.

## Solución Técnica
1.  **Forzar Voz**: En `core.js`, añadiré una función para listar las voces disponibles y seleccionar la primera que sea en español.
2.  **Activar Audio**: Asegurarme de que el botón de "Enviar" o el micrófono activen el contexto de audio.
3.  **Librería Externa (Opcional)**: Si la nativa falla, podríamos usar una API de TTS, pero intentemos arreglar la nativa primero.

## Plan de Acción
- Modificar `core.js` para mejorar la función `speak()`.
- Añadir un botón de "Activar Voz" explícito o asegurar que el primer toque habilite el audio.
- Reconstruir APK.

¿Arreglamos esas cuerdas vocales digitales? 🎤