# Fase 36: Diagnóstico de "Enlaces Rotos" (WhatsApp/Spotify) 🔗🩺

El usuario reporta que **Spotify** y **WhatsApp** "no están conectados" (no se abren), pero los demás sí (YouTube/Cámara).
Esto suele deberse a cómo Android maneja los "Intent URIs" o "Deep Links".

## Análisis
- `whatsapp://` funciona si la app está instalada.
- `spotify://` funciona si la app está instalada.
- **Problema**: Algunos dispositivos modernos o versiones de Android bloquean estos enlaces si no se declaran explícitamente en el `AndroidManifest.xml` (queries).
- O simplemente la URL está mal formada para ese dispositivo.

## Solución: `AppLauncher` Plugin (Capacitor)
Lo ideal sería usar el plugin oficial `AppLauncher` de Capacitor, pero requiere instalación y configuración.
Como solución rápida (hotfix) sin instalar plugins pesados, intentaré mejorar las URLs de Intent.

- **WhatsApp**: Intentar `https://wa.me/` o `intent://send...`.
- **Spotify**: Intentar `intent://...` o asegurar que `spotify://` sea correcto.

Sin embargo, la causa más probable en Android 11+ es la falta de `<queries>` en el manifiesto.

## Plan de Acción
1.  **Editar `AndroidManifest.xml`**: Añadir permisos de consulta (`<queries>`) para `com.whatsapp`, `com.spotify.music`, etc.
2.  **Actualizar `core.js`**: Probar métodos alternativos de lanzamiento (Intent URLs más robustas).
3.  **Reconstruir**: `gradlew` necesita procesar el nuevo manifiesto.

¿Arreglamos esos enlaces para que la música y los mensajes fluyan? 🛠️