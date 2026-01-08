import cv2
import threading
import time
import os
from PIL import Image
import google.generativeai as genai
from nexa_agente.voice_engine import speak

class NexaVision:
    def __init__(self):
        self.cap = None
        self.is_active = False
        
    def open_camera(self):
        """Abre una ventana con la cámara."""
        if self.is_active:
            return "La cámara ya está activa."
            
        self.is_active = True
        threading.Thread(target=self._camera_loop, daemon=True).start()
        return "Activando sistema visual."

    def close_camera(self):
        """Cierra la ventana de la cámara."""
        if not self.is_active:
            return "La cámara ya está apagada."
        
        self.is_active = False # Esto romperá el bucle _camera_loop
        return "Desactivando cámara."

    def _camera_loop(self):
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            speak("No detecto ninguna cámara conectada.")
            self.is_active = False
            return

        speak("Cámara activada. Presiona la tecla Q para cerrar.")
        
        while self.is_active:
            ret, frame = self.cap.read()
            if not ret:
                break
                
            cv2.imshow('NEXA VISION (Presiona Q para cerrar)', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        self.cap.release()
        cv2.destroyAllWindows()
        self.is_active = False
        speak("Sistema visual desactivado.")

    def analyze_scene(self, brain_model):
        """Captura una foto y le pregunta a Gemini qué ve."""
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return "No puedo ver nada sin una cámara."
            
        speak("Analizando entorno... Mantén la posición.")
        time.sleep(1) # Dar tiempo a que la cámara ajuste luz
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            return "Error al capturar imagen."
            
        # Convertir a formato que Gemini entienda (PIL Image)
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)
        
        try:
            response = brain_model.generate_content(["Describe brevemente qué ves en esta imagen. Si hay una persona, descríbela.", pil_img])
            return response.text
        except Exception as e:
            print(f"Error visión IA: {e}")
            return "Veo algo, pero mi cerebro no pudo procesarlo."

# Instancia global
vision_system = NexaVision()
