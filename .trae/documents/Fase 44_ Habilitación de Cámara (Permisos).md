# Fase 44: Activación de Ojos (Permisos de Cámara Faltantes) 📷🔓

El usuario tiene razón: **No se abre la cámara**.
He revisado el archivo `AndroidManifest.xml` y he confirmado el error: **Falta el permiso `CAMERA`**.
Sin `<uses-permission android:name="android.permission.CAMERA" />`, Android bloquea silenciosamente cualquier intento de usar la cámara, por eso no ves nada.

## Diagnóstico
- `RECORD_AUDIO`: Presente.
- `CAMERA`: **AUSENTE**. ❌

## Plan de Acción
1.  **Añadir Permisos**: Insertar `android.permission.CAMERA` en el manifiesto.
2.  **Configurar Hardware**: Añadir `<uses-feature android:name="android.hardware.camera" />` para asegurar compatibilidad.
3.  **Depuración Visual**: Añadir alertas explícitas en `core.js` si la cámara falla, para que el usuario sepa *por qué* (ej. "Permiso denegado" vs "Cámara no encontrada").
4.  **Reconstruir**: Generar el APK V2.8.

¡Vamos a darle vista a NEXA! 👁️✨