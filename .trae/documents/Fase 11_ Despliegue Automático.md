# Fase 11: Despliegue en la Nube (Backend y Frontend) 🚀☁️

El usuario quiere poner "el baken y el fron des" (Backend y Frontend) en la nube.
Ya hemos preparado los archivos (`vercel.json`, `GUIA_ORACLE_CLOUD.md`), pero ahora vamos a **ejecutar** o **facilitar** el despliegue real.

## 1. Frontend (Vercel)
- Ya tenemos `deploy/` y `vercel.json`.
- Voy a simular un despliegue local con `vercel-cli` si está instalado, o daré el comando exacto para que el usuario solo escriba "vercel".
- O mejor, crearé un script `DEPLOY_FRONTEND.bat` que instale vercel y despliegue.

## 2. Backend (Render / Oracle)
- Oracle es manual (VPS). Render es más automático.
- Voy a crear un `render.yaml` (Blueprint) para que el despliegue en Render sea automático al conectar GitHub.
- Esto es mucho más "5 estrellas" que configurar un VPS manualmente.

## 3. Conexión Frontend-Backend
- Asegurarnos de que el Frontend sepa dónde está el Backend (URL de API).
- Actualizar `deploy/config.js` o similar para leer la URL de la API dinámicamente.

¿Procedemos a automatizar el despliegue? ⚙️