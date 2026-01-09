# Fase 61: Activación de Botones (Apagar, Archivo, Settings) 🔘⚙️

¡Excelente! La interfaz principal funciona ("se ve perfecta"), pero el usuario reporta botones muertos: **Apagar**, **Archivo** y **Settings**.
Esto es normal porque hasta ahora nos centramos solo en la Visión y la IA. Es hora de conectar esos cables sueltos.

## Análisis de Funcionalidad
1.  **Botón Apagar (Power)**: Debería cerrar la app o detener el servidor.
    *   *Acción*: Enviar comando `exit_app` al móvil o `shutdown` al servidor.
2.  **Botón Archivo (Files)**: Debería mostrar logs o fotos guardadas.
    *   *Acción*: Mostrar un modal con historial de chat/imágenes.
3.  **Botón Settings (Engranaje)**: Debería permitir cambiar la IP o la voz.
    *   *Acción*: Mostrar un modal de configuración simple.

## Plan de Acción
1.  **Editar `core.js`**: Añadir *Event Listeners* para estos botones (que probablemente tengan IDs en el HTML pero sin lógica JS).
2.  **Implementar Lógica Básica**:
    *   `settings-btn` -> `alert("Configuración próximamente")` (o abrir un div real).
    *   `power-btn` -> `navigator.app.exitApp()` (solo funciona en Android real).
3.  **Recompilar APK**: Generar `NEXA_ROBOT_V3.1.apk`.

¿Le damos vida a los botones? 👆⚡