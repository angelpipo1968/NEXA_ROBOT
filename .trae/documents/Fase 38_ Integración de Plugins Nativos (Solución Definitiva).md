# Fase 38: Solución Radical de Permisos (Capacitor Plugins) 🛑🔧

El usuario reporta que **ni el micrófono ni WhatsApp funcionan** a pesar de los cambios anteriores.
Esto indica que el WebView nativo está bloqueando estas funciones por seguridad, y que los métodos web estándar (`window.location.href` y `SpeechRecognition`) no son suficientes en su dispositivo/versión de Android.

## El Problema Real
1.  **Micrófono**: `webkitSpeechRecognition` no es estándar en todos los WebViews de Android. Necesitamos usar un **Plugin Nativo** de Capacitor para el reconocimiento de voz.
2.  **WhatsApp**: Si `wa.me` falla, es posible que el navegador interno esté bloqueando la redirección a una app externa. Necesitamos usar el plugin **AppLauncher**.

## Solución Definitiva: Plugins de Capacitor
Vamos a instalar y configurar plugins que puentean el navegador y hablan directo con el sistema operativo.

1.  **Instalar Plugins**:
    - `@capacitor-community/speech-recognition`: Para el micrófono real.
    - `@capacitor/app-launcher`: Para abrir apps (WhatsApp, Spotify) de forma garantizada.

2.  **Modificar Código**:
    - Reemplazar la lógica web de `core.js` con la lógica de los plugins.

3.  **Sincronizar y Compilar**:
    - Esto es crítico. Al añadir plugins, el proyecto Android cambia estructuralmente.

## Plan de Acción
1.  Instalar plugins npm.
2.  Actualizar `core.js` para importar y usar estos plugins.
3.  Sincronizar (`npx cap sync`).
4.  Reconstruir APK.

¿Listo para inyectarle superpoderes nativos al robot? 💉🦾