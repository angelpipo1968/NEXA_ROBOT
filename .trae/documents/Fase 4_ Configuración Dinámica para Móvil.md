# Fase 4: Configuración Dinámica y Portabilidad ⚙️📱

Para que tu robot sea realmente útil en el móvil (y no solo en el emulador), necesitamos solucionar un problema clave: **Las direcciones IP**.

Actualmente, `core.js` apunta a `localhost` para la IA. Si instalas la app en tu móvil, `localhost` será el propio teléfono, no tu PC donde corre Ollama.

## 1. Panel de Configuración ⚙️
Añadiré un botón de "Ajustes" que permita cambiar en tiempo real:
- **URL del Servidor IA**: Para poner la IP de tu PC (ej. `http://192.168.1.15:11434`).
- **IP del Hardware**: Para cambiar la dirección del ESP32 sin tocar código.
- **Nombre del Robot**: Cambiar "NEXA" por lo que quieras.

## 2. Optimización Táctil 👆
Asegurar que los paneles se cierren al tocar fuera o con un botón de "cerrar", mejorando la experiencia en pantallas táctiles.

---

### Por qué esto es vital
Sin esto, cada vez que cambies de red Wi-Fi o cambie la IP de tu PC, tendrías que editar el código y volver a desplegar. Con esto, lo cambias desde la propia app en segundos.

### Plan de Ejecución
1.  **UI**: Añadir botón de engranaje ⚙️ y un modal de configuración en `index.html`.
2.  **Lógica**: Crear funciones en `core.js` para guardar/cargar estas IPs desde `localStorage` y actualizar `AI_CONFIG` dinámicamente.
3.  **Estilos**: Darle el look "Cyberpunk" al panel de ajustes.
