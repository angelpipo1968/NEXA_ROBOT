# Fase 3: Identidad y Conocimiento Profundo 👤📚

Ya que "seguimos", vamos a romper la barrera entre un asistente genérico y un compañero real.

## 1. Reconocimiento Facial (Face ID) 👤
NEXA no solo debe saber tu nombre porque se lo dices, debe **reconocerte**.
- **Tecnología:** Integrar `face-api.js` (TensorFlow.js ligero) directamente en el navegador/app.
- **Flujo:**
    1.  Detectar caras en el feed de video.
    2.  Comparar con una "base de datos" local de rostros conocidos (guardada en `localStorage`).
    3.  Si te reconoce, saludarte por tu nombre automáticamente: "Hola de nuevo, Pipo."
    4.  Si no, preguntar: "¿Quién eres?" y aprender tu cara.

## 2. Sistema RAG Real (Cerebro Documental) 🧠
Vamos a reemplazar la "simulación de noticias" con inteligencia real.
- **Funcionalidad:** Permitir que "subas" texto o conocimientos al robot.
- **Técnica:** Crear un input simple donde pegues texto (notas, manuales) y NEXA lo guarde en su memoria vectorial (simulada con búsqueda de texto simple por ahora para mantenerlo ligero en JS, o real si usamos el backend Python).
- **Uso:** Cuando preguntes algo, NEXA buscará primero en tu "Base de Conocimiento" antes de alucinar.

---

### Recomendación: Empezar con **Reconocimiento Facial**
Es el paso lógico tras haber implementado la visión. Convertirá a NEXA en un guardián de seguridad activo.

### Plan de Ejecución
1.  **Instalar Librería:** Descargar `face-api.min.js` y los modelos necesarios a `deploy/models`.
2.  **Actualizar `core.js`:** Implementar la lógica de detección y reconocimiento en el bucle de visión.
3.  **UI de Entrenamiento:** Añadir un modo "Aprender Rostro" en el panel de visión.
