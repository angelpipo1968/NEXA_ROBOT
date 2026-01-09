# GUÍA DE CERTIFICADOS SSL (ZEROSSL) PARA nexa-ai.dev

Si tienes el dominio **nexa-ai.dev** (o www.nexa-ai.dev), sigue estos pasos para obtener el candado verde 🔒.

## PASO 1: Generar el Certificado en ZeroSSL
1.  Ve a [https://zerossl.com/](https://zerossl.com/) y regístrate (es gratis).
2.  Haz clic en **"New Certificate"**.
3.  Escribe tu dominio: `nexa-ai.dev` (ZeroSSL sugerirá incluir `www.nexa-ai.dev` automáticamente, acepta).
4.  Selecciona "90-Day Certificate" (Gratis).
5.  Deja activado "Auto-Generate CSR".
6.  **Validación**: Te pedirán verificar que eres el dueño.
    *   **Email**: Te envían un correo a `admin@nexa-ai.dev`.
    *   **DNS (CNAME)**: Te dan un registro CNAME para tu DNS.
    *   **HTTP Upload**: Te dan un archivo para subir.

## PASO 2: Descargar
Una vez validado, te dejarán descargar un archivo ZIP.
Dentro encontrarás:
- `certificate.crt`
- `ca_bundle.crt`
- `private.key`

## PASO 3: Instalar en NEXA
1.  Extrae los archivos.
2.  Renombra `certificate.crt` a **`cert.pem`**.
3.  Renombra `private.key` a **`key.pem`**.
4.  Copia ambos (`cert.pem` y `key.pem`) a la carpeta principal de este proyecto: `C:\Users\pipog\NEXA_ROBOT_V2\`.

## PASO 4: Reiniciar
Reinicia tu servidor NEXA:
```bash
python NEXA_OS/server.py
```
¡Listo! Ahora tu servidor funcionará en `https://nexa-ai.dev`.

---
**NOTA**: Si estás probando en local (tu PC) y no tienes el dominio apuntando a tu IP todavía, usa el script `GENERAR_SSL_LOCAL.bat` para crear un certificado de prueba temporal.
