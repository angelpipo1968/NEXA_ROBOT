# Fase 41: Depuración de Intentos Android (WhatsApp y Micrófono) 🐞📱

El usuario reporta:
1.  **"whasapt enlace invalido del chat"**: Esto confirma que `window.open('https://wa.me/', '_system')` **sí** intentó abrir algo, pero WhatsApp (o el navegador) lo rechazó como "inválido".
    *   **Causa**: `https://wa.me/` vacío a veces falla si no tiene número. O el WebView está bloqueando el "intent" de redirección.
    *   **Solución**: Usar `intent://send?text=Hola#Intent;scheme=whatsapp;package=com.whatsapp;end` (Formato Intent Android nativo) O probar `whatsapp://send?text=Hola`.

2.  **"microfono no funciona"**: El método web `webkitSpeechRecognition` no está soportado en su WebView específico (probablemente un Android Webview antiguo o restringido).
    *   **Solución**: Si los plugins nativos fallaban y la web falla... necesitamos un **Polyfill** o aceptar que sin plugin nativo (que crasheaba antes) no habrá voz en este dispositivo específico.
    *   **Estrategia**: Intentar reactivar el plugin nativo PERO con una configuración mínima y manejo de errores extremo para que no crashee la app entera.

## Plan de Acción (Estrategia Híbrida)
1.  **WhatsApp**: Cambiar el enlace a un Intent explícito de Android. `intent://` es mucho más poderoso que `https://`.
2.  **Micrófono**: No podemos rendirnos. Voy a re-instalar SOLAMENTE el plugin de Speech Recognition (el más estable) y aislarlo completamente en un `try-catch` para que si falla, no rompa el resto de la app.

¿Intentamos la inyección directa de Intents? 💉🤖