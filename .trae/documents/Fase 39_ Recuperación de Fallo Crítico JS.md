# Fase 39: Depuración Extrema (WhatsApp & Permisos) 🐞🚨

El usuario reporta múltiples fallos críticos:
1.  **"sen no funciona"**: Probablemente se refiere al botón "Send" (Enviar) o quizás a "Sensor". Asumiré que es el botón de enviar texto.
2.  **"whhasat elance mal"**: El enlace de WhatsApp sigue fallando.
3.  **"bloque de notificasione no funciona"**: Probablemente intentó recibir notificaciones y no funcionó.
4.  **"microfono y sen no funcionan"**: El micrófono sigue muerto.

## Análisis de Causa Raíz
Parece que la integración de plugins nativos **NO se cargó correctamente** en el último build o hay un conflicto grave en `core.js` que rompe todo el script (si `core.js` tiene un error de sintaxis, NADA funciona, ni los botones "sen" ni el micro).

Si el usuario dice "sen no funciona", significa que el botón de enviar no hace nada -> **JavaScript Crash**.

## Sospecha Principal
El código que añadí para importar plugins:
```javascript
const NativeSpeech = (window.Capacitor && Capacitor.Plugins.SpeechRecognition) ...
```
Si `window.Capacitor` no está definido al momento de carga (race condition) o si la sintaxis es incorrecta, todo el script muere.

## Plan de Rescate
1.  **Validar `core.js`**: Envolver todo en un bloque `try-catch` global o asegurar que `Capacitor` se carga antes de usarlo.
2.  **Simplificar WhatsApp**: Volver al método `https://wa.me/` PERO abrirlo con `window.open(url, '_system')` que es el método estándar de Capacitor para salir del WebView.
3.  **Reparar Botón Send**: Verificar si el listener del botón tiene errores.

Voy a reescribir `core.js` para que sea **a prueba de fallos**. Si el plugin falla, debe funcionar el modo web.

¿Reanimamos al paciente? 🚑