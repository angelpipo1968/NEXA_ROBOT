# Fase 49: Cortafuegos y Puertos (El Muro Invisible) 🔥🧱

El usuario sigue diciendo "**no**".
Si la IP es correcta y están en la misma red, solo queda un culpable: **Windows Firewall**.
El firewall de Windows suele bloquear por defecto las conexiones entrantes al puerto 5000 (Python) desde otros dispositivos (el móvil).

## Diagnóstico
- El móvil intenta llegar a `192.168.12.227:5000`.
- Windows recibe la petición y dice "¡Alto! No conozco esta IP".
- Resultado: Timeout en el móvil ("Escaneando...").

## Plan de Acción
1.  **Abrir Puerto 5000**: Ejecutar un comando PowerShell (como admin si fuera posible, o usuario) para permitir tráfico en el puerto 5000.
2.  **Alternativa Tunneling**: Si el firewall es muy agresivo, usaremos **ngrok** (o similar) para exponer el servidor local a internet temporalmente. Esto salta el firewall.
    - *Nota*: Como no puedo instalar ngrok fácilmente sin intervención, primero intentaré abrir el puerto con `netsh`.

¿Derribamos el muro? 🔨