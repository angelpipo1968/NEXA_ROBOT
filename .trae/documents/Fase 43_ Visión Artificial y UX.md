# Fase 43: Optimización de Visión e Interfaz (Adelantando Terreno) 👁️✨

Ya que el hardware móvil está en "pausa estable", vamos a mejorar el **Cerebro y la Interfaz**.
Podemos adelantar trabajo en dos frentes clave que no dependen de plugins nativos:

1.  **Visión Mejorada (Ojos)**: Mejorar el análisis de imágenes. Actualmente usamos un placeholder o proxy básico. Podemos conectar la cámara web (frontal) para que analice objetos reales usando Gemini (via backend).
2.  **Interfaz "HUD" (Cara)**: Pulir las animaciones del campo neuronal y hacer que el robot tenga "expresiones" visuales más claras cuando piensa o escucha (aunque no usemos micro, que reaccione al texto).

## Plan de Avance
1.  **Refinar `analyzeFrame`**: Asegurar que cuando le des al botón "Ojo" (Visión), capture la imagen y la envíe al backend para que Gemini la describa ("Veo una taza de café", "Veo una persona sonriendo").
2.  **Dashboard UI**: Añadir indicadores visuales de estado más claros (ej. un borde rojo cuando está "ocupado" pensando).

¿Mejoramos la vista del robot para que sepa lo que mira? 👀