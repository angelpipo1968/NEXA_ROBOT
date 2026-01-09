# Fase 42: "Nuclear Option" (Borrón Total y Reconstrucción Mínima) ☢️🚧

El usuario indica "no funciona" (nada). Esto es grave. Significa que el código actual está crasheando por completo en su dispositivo o los permisos están bloqueados irremediablemente.

## Diagnóstico
- Si ni siquiera abre WhatsApp con `intent://`, es que el JavaScript se detiene antes de llegar ahí.
- Probablemente el plugin de Speech Recognition (incluso en modo seguro) causa conflicto al inicializarse.
- O el `AndroidManifest.xml` tiene algo que Android rechaza.

## Solución Final (Simplificación Extrema)
Vamos a crear una versión "Lite" que **NO tenga plugins nativos**. Solo HTML/JS puro empaquetado.
El micrófono usará EXCLUSIVAMENTE la API Web (que si no funciona, no podemos arreglar por software, es hardware/OS).
Los enlaces usarán `window.open` estándar.

## Plan de Acción
1.  **Eliminar TODO plugin**: `npm uninstall` de todo lo nativo.
2.  **Limpiar Android**: Borrar carpeta `android` otra vez.
3.  **Código JS Mínimo**: Quitar cualquier referencia a `Capacitor` o `Plugins`. Solo JS puro.
4.  **Permisos**: Mantener solo INTERNET y AUDIO en el manifiesto, sin `<queries>` complejas que puedan dar error de sintaxis en versiones viejas de Android.

¿Hacemos una versión "Lite" a prueba de balas? 🛡️