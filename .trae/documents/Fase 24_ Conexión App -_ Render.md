# Fase 24: Conexión de la App Móvil a la Nube (Render) 📱☁️

¡Felicidades! Tienes tu servidor en la nube funcionando: `https://nexa-app.onrender.com`. 🚀
Ahora vamos a conectar la App Móvil (APK) a este servidor.

## 1. Actualizar `core.js` (Frontend)
- Actualmente, la App busca conectarse a `http://localhost:5000` o `http://10.0.2.2:5000`.
- Debo cambiar la variable `API_URL` en `deploy/core.js` para que apunte a `https://nexa-app.onrender.com`.

## 2. Actualizar Configuración de Capacitor
- En `capacitor.config.ts`, asegurarnos de que `server.url` apunte a la nube (o dejarlo para que cargue los archivos locales `www` pero haga peticiones a la nube).
- Lo mejor para una App híbrida es cargar la UI localmente (`android/app/src/main/assets/public`) y que las llamadas AJAX vayan a la URL de Render.
- Ya tengo lógica en `core.js` para usar `API_URL`.

## 3. Sincronizar y Preparar APK
- Copiar el nuevo `core.js` a la carpeta `neuronex-mobile/www`.
- El usuario deberá regenerar el APK (o si tiene "Live Reload", se actualizará, pero mejor regenerar).

¿Actualizo la App para que se conecte a tu servidor Render? 📡