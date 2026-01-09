# Fase 50: Plan de Contingencia "Offline Vision" (IA Local Simulada) 🔌🧠

El usuario reporta "**no**".
Si ni abriendo el puerto funciona, es probable que haya un aislamiento de red más profundo (AP Isolation en el router, perfiles de red públicos, etc.) que no podemos arreglar remotamente sin frustrar al usuario.

## Nueva Estrategia: IA Visual Simulada (Offline)
Para que el usuario no se quede con un robot "ciego", voy a implementar un **modo de demostración offline** en el propio JavaScript.
Si la conexión al servidor falla (después del timeout), el robot **simulará** que ve algo genérico o usará una IA básica en el navegador (si fuera posible, pero MobileNet es pesado).
Mejor: Usaremos una lista de respuestas predefinidas divertidas para que al menos el usuario vea que la "intención" funciona, o un mensaje claro de "Modo Offline: Solo funciones básicas".

**Corrección**: El usuario quiere que funcione de verdad. Si no conecta, volveremos a intentar una **conexión por cable (USB Debugging)** o simplificar al máximo.

Pero espera... si el usuario dice "no", puede que **no haya ejecutado el script**.
Voy a asumir que la red local es imposible.
Voy a revertir a la **URL de Render (Nube)** pero asegurándome de que el usuario entienda que necesita internet.

**O MEJOR**: Voy a crear un **Servidor de Túnel (Ngrok/LocalTunnel)** en Python. Esto crea una URL pública (`https://blabla.ngrok.io`) que apunta a tu PC. El móvil conectará a esa URL pública y llegará a tu PC sin importar firewalls o IPs.

## Plan de Acción (Túnel de Escape)
1.  **Instalar `pyngrok`**: Una librería de Python que crea túneles automáticamente.
2.  **Modificar `server.py`**: Para que al iniciar, arranque el túnel y **muestre la URL pública en pantalla**.
3.  **Actualizar APK**: Hardcodear esa URL o hacer que la pida al inicio (más complejo).
    - *Mejor*: Usar un servicio de redirección estático o volver a intentar el despliegue en Render (que falló por `pywin32` pero ya lo arreglamos).

**Decisión**: Vamos a **arreglar el despliegue en Render**. Es la solución definitiva. Si el servidor está en la nube, el móvil (con 4G o Wi-Fi) llegará siempre.

¿Desplegamos en la nube de verdad? ☁️🚀