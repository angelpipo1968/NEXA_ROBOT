# Fase 13: Aplicación Móvil Nativa (Android/APK) 📱🤖

Ya tenemos la web y el backend. Ahora vamos a cerrar el círculo creando la **App Android Nativa** (APK).
Esto permitirá controlar a NEXA desde el celular sin abrir el navegador.

## 1. Empaquetado con Capacitor/Cordova
- Usaremos los archivos web de `deploy/` como base.
- Crearemos un proyecto híbrido para generar el APK.
- Ya tienes `build_apk.ps1`, pero vamos a hacerlo "bien" usando **Cordova** o **Capacitor** para acceso nativo (cámara, micrófono, bluetooth).

## 2. Acceso a Hardware Nativo
- Permitir que la App use el micrófono del celular para hablar con NEXA.
- Usar la cámara del celular como "Ojos Remotos".

## 3. Generación del APK
- Compilar el APK final (`nexa-robot-v2.apk`).
- Dejarlo listo para instalar en tu Android.

¿Empezamos a compilar la App Móvil? 📲⚙️