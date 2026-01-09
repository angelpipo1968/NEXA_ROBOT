# ¿DÓNDE ESTÁ LA INTELIGENCIA ARTIFICIAL? 🧠

Es normal confundirse. Aquí te explico dónde vive cada parte de tu robot.

## EL MAPA DE NEXA

```mermaid
graph TD
    A[📱 TU CELULAR] -->|Internet| B[☁️ RENDER (Tu Servidor)]
    B -->|API Key| C[🧠 GOOGLE GEMINI (La IA)]
    B -->|API Key| D[💳 STRIPE (Los Pagos)]
    B -->|Conexión| E[🗄️ MONGODB (La Memoria)]
```

### 1. 📱 Tu Celular (El Cuerpo)
- Tiene la App instalada (APK).
- Tiene ojos (Cámara) y oídos (Micrófono).
- **NO TIENE LA IA DENTRO**. Solo envía lo que ve y oye.

### 2. ☁️ Render (El Cerebro Central)
- Es el servidor que acabamos de subir.
- Recibe los mensajes de tu celular.
- **Tampoco piensa por sí mismo**. Es un gestor.
- Su trabajo es tomar tu mensaje y pasárselo al experto (Google).

### 3. 🧠 Google Gemini (La Verdadera IA)
- Aquí es donde "vive" la inteligencia.
- Está en los servidores de Google.
- Cuando tú hablas, Render le pregunta a Google: *"¿Qué le respondo?"*.
- Google responde y Render te lo devuelve al celular.

---
**¿Por qué hacerlo así?**
- Porque la IA de Google es mil veces más potente que lo que cabe en un celular.
- Porque así tu celular no se calienta ni gasta batería pensando.
