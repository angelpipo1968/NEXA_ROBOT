# 🤖 NEXA ROBOT V2.0

Este es el directorio principal de tu asistente NEXA.

## 🚀 Cómo Iniciar
Para activar el robot con voz y escucha:
1. Abre una terminal en esta carpeta.
2. Ejecuta: `python nexa_ai_agent.py`

## 📂 Estructura del Proyecto

*   **`nexa_ai_agent.py`**: 🧠 **CEREBRO PRINCIPAL**. Este es el script que debes ejecutar. Contiene el bucle de escucha, comandos y la nueva voz.
*   **`nexa_agente/`**: Carpeta con módulos del sistema.
    *   `voice_engine.py`: El nuevo motor de voz neural (Edge TTS).
    *   `speak.py`: (Legacy) Módulo antiguo de voz.
*   **`requirements.txt`**: Lista de librerías necesarias.
*   **`logs/`**: Registro de actividad del robot.

## 🗑️ Carpetas para Revisar (Posibles Duplicados)
*   `NEXA_GENESIS/`: Parece una versión antigua o backup.
*   `QWEN_IMPORT/`: Archivos de logs importados.

## ✨ Nuevas Características
*   **Voz Neural**: NEXA ahora usa voces realistas de Microsoft Edge.
*   **Modo Híbrido**: Si se va internet, vuelve automáticamente a la voz de Windows para no fallar.
