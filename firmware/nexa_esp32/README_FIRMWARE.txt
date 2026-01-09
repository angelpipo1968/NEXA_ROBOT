==================================================
   GUÍA DE INSTALACIÓN DE FIRMWARE - NEXA ROBOT
==================================================

1. REQUISITOS
   - Placa ESP32 (DevKit V1 o similar).
   - Cable Micro-USB.
   - Arduino IDE instalado (https://www.arduino.cc/en/software).

2. CONFIGURACIÓN DE ARDUINO IDE
   - Abre Arduino IDE.
   - Ve a Archivo > Preferencias.
   - En "Gestor de URLs Adicionales de Tarjetas", pega esto:
     https://dl.espressif.com/dl/package_esp32_index.json
   - Ve a Herramientas > Placa > Gestor de Tarjetas.
   - Busca "esp32" e instálalo (por Espressif Systems).

3. PREPARAR EL CÓDIGO
   - Abre el archivo `nexa_esp32.ino` que está en esta carpeta.
   - Busca estas líneas al principio del archivo:
     const char* ssid = "ASUS_4G";
     const char* password = "Gongora1968";
   - CÁMBIALAS por el nombre y contraseña real de tu WiFi.

4. SUBIR EL CÓDIGO
   - Conecta el ESP32 al PC con el cable USB.
   - En Arduino IDE:
     - Selecciona tu placa: Herramientas > Placa > ESP32 Dev Module.
     - Selecciona el puerto: Herramientas > Puerto > (El que aparezca, ej. COM3).
   - Dale al botón de la flecha (➡️) para SUBIR.
   - IMPORTANTE: Si pone "Connecting..." y no avanza, mantén pulsado el botón "BOOT" del ESP32 hasta que empiece a cargar.

5. OBTENER LA IP
   - Una vez subido, abre el Monitor Serie (lupa 🔍 arriba a la derecha).
   - Asegúrate de que la velocidad abajo ponga "115200 baud".
   - Pulsa el botón "EN" o "RESET" en el ESP32.
   - Verás que se conecta al WiFi y te dirá algo como:
     "IP Address: 192.168.1.XX"

6. CONECTAR CON NEXA
   - Apunta esa IP (ej. 192.168.1.45).
   - Abre la App de NEXA en tu móvil/PC.
   - Ve a Ajustes ⚙️.
   - En "IP Hardware", escribe: http://192.168.1.45
   - ¡Listo! Ahora cuando digas "Enciende la luz", el LED azul del ESP32 se encenderá.
