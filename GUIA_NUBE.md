# ☁️ Guía de Despliegue en la Nube - NEXA ROBOT

Para que tu robot sea accesible desde cualquier lugar sin usar tu PC, sigue estos pasos:

## 1. Subir el Cerebro (Backend Python) 🧠
Usaremos **Render** (es gratis y fácil).

1.  Ve a [dashboard.render.com](https://dashboard.render.com/) y crea una cuenta.
2.  Haz clic en **"New +"** -> **"Web Service"**.
3.  Conecta tu repositorio de GitHub (`angelpipo1968/NEXA_ROBOT`).
4.  Configura lo siguiente:
    *   **Name**: `nexa-brain` (o lo que quieras).
    *   **Runtime**: `Python 3`.
    *   **Build Command**: `pip install -r requirements.txt`.
    *   **Start Command**: `gunicorn --worker-class eventlet -w 1 NEXA_OS.server:app`.
5.  Dale a **"Create Web Service"**.
6.  ¡Espera a que termine! Te dará una URL (ej: `https://nexa-brain.onrender.com`).

## 2. Subir la Página Web (Frontend) 🌐
Usaremos **Vercel** o **GitHub Pages**.

**Opción GitHub Pages (Más fácil):**
1.  Ve a tu repositorio en GitHub.
2.  Entra en **Settings** -> **Pages**.
3.  En **Branch**, elige `main` y carpeta `/deploy` (si te deja) o `/docs`.
    *   *Nota: Si GitHub solo deja elegir `/` o `/docs`, mueve el contenido de `deploy` a `docs`.*

**Opción Vercel (Recomendada):**
1.  Ve a [vercel.com](https://vercel.com/) y conecta tu GitHub.
2.  Importa el proyecto `NEXA_ROBOT`.
3.  En **Framework Preset**, elige "Other".
4.  En **Root Directory**, edita y selecciona `deploy`.
5.  Dale a **Deploy**.
6.  Te dará una URL (ej: `https://nexa-robot.vercel.app`).

## 4. Base de Datos (MongoDB) 🗄️
Para que NEXA recuerde todo aunque reinicies el servidor:

1.  Crea una cuenta gratis en [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2.  Crea un **Cluster** (gratis).
3.  En **Network Access**, permite acceso desde `0.0.0.0/0`.
4.  Obtén la **Connection String** (ej: `mongodb+srv://...`).
5.  En Render/Oracle, añade la variable de entorno:
    *   `MONGO_URI` = `tu_string_de_conexion`

## 5. Dominio y Nameservers (DNS) 🌐
Para usar `pro.nexa-ai.dev`:

1.  Compra el dominio en Namecheap/GoDaddy.
2.  Si usas **Vercel** para la web:
    *   Ve a Vercel -> Settings -> Domains.
    *   Añade `pro.nexa-ai.dev`.
    *   Vercel te dará unos **Nameservers** (ej: `ns1.vercel-dns.com`).
    *   Ve a tu proveedor de dominio y cambia los Nameservers por los de Vercel.
3.  Si usas **Oracle Cloud** para la API:
    *   Crea un subdominio (ej: `api.nexa-ai.dev`) apuntando a la IP de Oracle (Registro A).

## 6. Conectar Todo 🔗
Una vez tengas las URLs de la nube:


1.  Abre la **App Móvil (NEXA)**.
2.  Ve a **Ajustes**.
3.  En **IP Servidor IA**, pon la URL de Render (`https://nexa-brain.onrender.com`).
4.  En **IP Hardware**, sigue usando la IP local (`http://192.168...`) si el robot está en casa, O usa el túnel si te llevas el robot fuera.

¡Listo! Tu robot vive en internet. 🚀
