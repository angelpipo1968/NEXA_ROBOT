# DESPLIEGUE RÁPIDO EN RENDER (PLAN B)

Si Oracle Cloud está fallando (error 500/Technical Difficulty), usa **Render**. Es gratis y funciona al instante.

## PASO 1: Crear Cuenta
1.  Ve a [https://render.com/](https://render.com/)
2.  Regístrate con tu **GitHub** (es lo más fácil).

## PASO 2: Crear Blueprint
1.  En el Dashboard, haz clic en **"New"** -> **"Blueprint"**.
2.  Conecta tu repositorio `angelpipo1968/NEXA_ROBOT`.
3.  Render detectará automáticamente el archivo `render.yaml` que ya creé.
4.  Haz clic en **"Apply"**.

## PASO 3: ¡Listo!
Render instalará Python, las dependencias y lanzará el servidor.
Te dará una URL tipo: `https://nexa-os-backend.onrender.com`.

## PASO 4: Conectar la Web/App
1.  Copia esa URL.
2.  En tu computadora local, edita `deploy/core.js` (o usa la configuración en la web) para poner esa URL en `API_URL`.
3.  Si usas la App Móvil, reconstruye el APK con la nueva URL (o usa el menú de configuración de la App si lo hiciste dinámico).

---
**Ventajas de Render**:
- HTTPS automático (candado verde 🔒).
- Despliegue con un clic.
- Gratis (se duerme si no se usa por 15 min, pero despierta rápido).
