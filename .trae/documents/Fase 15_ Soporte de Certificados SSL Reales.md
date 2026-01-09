# Fase 15: Certificados SSL (HTTPS) 🔒

El usuario pregunta "como se yama la que es para el https".
Se refiere probablemente a **"SSL"**, **"Certificado"**, **"Let's Encrypt"** o la librería que usamos nosotros (**pyOpenSSL** / **Adhoc**).

Si pregunta por el **nombre de la clave/archivo** que necesita para configurar HTTPS en la nube, suele ser:
1.  **Certificado (CRT/PEM)**
2.  **Clave Privada (KEY)**

O si se refiere a la **variable de entorno** que yo puse en el `.env`, no puse ninguna específica para HTTPS porque lo activé en modo "adhoc" (automático) en `server.py`.

Pero si quiere saber qué pedirle a "Clau" (Claude) para que le dé el HTTPS, necesita pedir:
*"¿Cómo configuro un certificado SSL o HTTPS para mi servidor Flask?"*
O si está en la nube: *"¿Cómo activo HTTPS en mi VPS?"*

Voy a asumir que quiere saber el nombre de la tecnología o herramienta para activarlo manualmente si "Clau" se lo va a dar.
Le explicaré las opciones y si necesita que configure algo específico (como `cert.pem` y `key.pem`), lo haré.

## 1. Explicación
- Aclarar que para local usamos `adhoc` (automático).
- Para nube se usa **Certbot** (Let's Encrypt).

## 2. Preparar soporte para certificados reales
- Modificar `server.py` para que, si existen archivos `cert.pem` y `key.pem`, los use en lugar de `adhoc`.
- Esto es más profesional y permite que el usuario ponga sus propios certificados si "Clau" se los da.

¿Te refieres a los archivos de certificado? 📜