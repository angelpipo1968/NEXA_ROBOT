# Fase 8: Sentidos de Seguridad (Evitar Choques) 🦇🛑

Ahora que NEXA se mueve, corre el riesgo de chocar. Vamos a darle "sentidos" para que detecte obstáculos.

## 1. Firmware (ESP32)
- Añadiré soporte para el sensor ultrasónico **HC-SR04** (el de los dos "ojos").
- El ESP32 medirá la distancia y la enviará a la App.

## 2. Interfaz (App)
- Añadiré un indicador de **Distancia** en el panel de Hardware.
- Mostrará visualmente qué tan cerca está un objeto (Verde -> Rojo).

## 3. Seguridad Activa (Frenado Automático)
- Si la App detecta que la distancia es menor a **20 cm**, bloqueará el comando de "Avanzar" y detendrá el robot automáticamente.

¿Te parece bien instalarle este "radar" para protegerlo?