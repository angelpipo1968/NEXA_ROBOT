# Fase 5: Evolución a App Nativa (PWA) y Simulación de Hardware 📱🔌

Vamos a convertir a **NEXA ROBOT V2** en una aplicación instalable real y a proporcionar herramientas para probar el hardware sin tenerlo físicamente.

## 1. PWA Real (Progressive Web App) 📲
Actualmente, el `manifest.json` que tenemos es para el sistema de actualizaciones propio de NEXA, no para el navegador.
- **Acción:** Crear `deploy/pwa.manifest` (o `manifest.webmanifest`) con los iconos y configuración estándar.
- **Service Worker:** Implementar `sw.js` para cachear los archivos críticos (`core.js`, modelos, estilos). Esto hará que la app funcione **offline** y cargue instantáneamente.
- **Resultado:** Podrás darle a "Instalar App" en Chrome/Safari y tener un icono en tu pantalla de inicio.

## 2. Simulador de Hardware (Python) 🐍
Para probar el botón "💡 LED ON" sin un ESP32 real.
- **Acción:** Crear un script `mock_hardware.py` en la carpeta `deploy`.
- **Funcionamiento:** Escuchará en el puerto 80 (o uno alternativo si no tienes permisos de admin, ej. 8080) y responderá a las peticiones `/command?action=...` imprimiendo el estado en la consola.

## 3. Modo "Escucha Continua" 👂
Mejorar la experiencia de voz.
- **Acción:** Modificar `core.js` para que el reconocimiento de voz se reinicie automáticamente si se detiene (loop infinito), permitiendo dejar el robot "escuchando" en una tablet antigua colgada en la pared.

---

### Plan de Ejecución
1.  **PWA:** Generar iconos (placeholders), crear manifest y service worker. Vincularlos en `index.html`.
2.  **Simulador:** Escribir el script de Python para simular el hardware.
3.  **Voz:** Refinar el bucle de `initVoiceInterface`.
