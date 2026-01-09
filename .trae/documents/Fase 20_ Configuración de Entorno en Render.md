# Fase 20: Configuración de Variables de Entorno en Render ☁️🔑

El usuario está en el proceso de despliegue ("deploymen") y dice que "te dan una clave" o probablemente **le están pidiendo una clave** (Environment Variables) o le han dado una URL.

Si Render está construyendo el servicio, es posible que el usuario necesite añadir las variables de entorno (`GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, etc.) que pusimos en el `.env` local. Render no lee el archivo `.env` local, hay que ponerlas en su panel.

## 1. Explicar cómo añadir las "Environment Variables"
- En el dashboard de Render, hay una pestaña llamada **"Environment"**.
- Ahí debe añadir las claves:
    - `GEMINI_API_KEY`
    - `STRIPE_SECRET_KEY`
    - `MONGO_URI` (si la tiene)
    - `FLASK_ENV` = `production`

## 2. Verificar si se refiere a la URL
- Si "te dan una clave" se refiere a la URL final (`https://...onrender.com`), esa es la que necesitamos para la App Móvil.

Voy a asumir que necesita configurar las variables de entorno para que el servidor arranque bien (si no, fallará al intentar conectar con Gemini).

¿Te pide añadir "Environment Variables" o te dio ya la URL de la web? 🤔