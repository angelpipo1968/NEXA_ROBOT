# Fase 48: Configuración de IP Local (Conexión Directa) 🏠🔗

El usuario dice "**no**".
He detectado el problema crítico:
- El APK está apuntando a `https://nexa-app.onrender.com` (Nube).
- Pero el servidor está corriendo en **TU ordenador local** (Terminal 7).
- El móvil **no puede ver** lo que pasa en tu ordenador a menos que usemos tu IP local.

Tu IP es: `192.168.12.227`

## Plan de Acción
1.  **Cambiar API_URL**: Modificar `core.js` para que apunte a `http://192.168.12.227:5000`.
2.  **Asegurar Firewall**: (Nota mental) Asegúrate de que Windows no bloquee el puerto 5000 (normalmente Python pide permiso la primera vez).
3.  **Recompilar APK**: Generar la V2.11 "Local Dev Edition".

**Importante**: Para que esto funcione, **tu móvil y tu PC deben estar conectados al mismo Wi-Fi**.

¿Conectamos los cables invisibles? 📡⚡