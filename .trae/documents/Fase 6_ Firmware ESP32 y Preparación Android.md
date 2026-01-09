# Fase 6: Conexión Física (Firmware ESP32) 🔌🤖

Ya tenemos el cerebro (IA) y el simulador de cuerpo. Ahora vamos a crear el **código real** para el microcontrolador ESP32, para que puedas sustituir el simulador por un robot de verdad.

## 1. Firmware NEXA (Arduino/C++)
Crearé un archivo `nexa_esp32.ino` que:
- Se conecta a tu Wi-Fi.
- Inicia un servidor web (igual que el simulador).
- Controla pines reales (LEDs, Servos) cuando recibe comandos de la App.

## 2. Sincronización Móvil (APK) 📱
Preparar la carpeta `android` para que puedas generar el archivo `.apk` final si decides compilarlo.

---

### Pasos
1.  Crear carpeta `firmware/nexa_esp32`.
2.  Escribir `nexa_esp32.ino` con la lógica de servidor web y control de pines.
3.  Actualizar la carpeta del proyecto Android con los últimos cambios de la web.
