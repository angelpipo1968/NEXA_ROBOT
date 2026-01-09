# Fase 7: Control de Movimiento (Joystick) 🕹️🚗

Ya que el robot ve y escucha, ¡ahora necesita moverse!
Vamos a implementar un **Joystick Virtual** en la pantalla del móvil para que puedas conducirlo como un coche teledirigido.

## 1. Interfaz de Control
- Añadiré un **Joystick** táctil en el panel de Hardware de la App.
- Usaré una librería ligera (`nipplejs` o CSS puro) para que funcione suave en el móvil.

## 2. Lógica de Movimiento
- El joystick enviará comandos: `move_forward`, `move_back`, `move_left`, `move_right`, `stop`.
- Actualizaré el simulador para que te responda "Avanzando", "Girando", etc.

## 3. Firmware Motores
- Actualizaré el código del ESP32 para controlar 2 motores (usando un driver L298N o similar, que es lo estándar).

¿Te parece bien convertir a NEXA en un vehículo autónomo? 🏎️