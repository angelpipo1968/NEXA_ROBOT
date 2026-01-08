import customtkinter as ctk
import threading
import time
import os
from PIL import Image
from datetime import datetime

# Configuración visual
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class NexaGUI(ctk.CTk):
    def __init__(self, agent_loop_callback):
        super().__init__()

        # Configuración de ventana
        self.title("NEXA AI - Robot Assistant")
        self.geometry("600x700")
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1) # Chat expandible

        # 1. Cabecera (Header)
        self.header_frame = ctk.CTkFrame(self, corner_radius=0)
        self.header_frame.grid(row=0, column=0, sticky="ew")
        
        # Intentar cargar logo
        self.logo_image = None
        try:
            # Buscar face.png en varias ubicaciones posibles
            possible_paths = [
                os.path.join(os.getcwd(), "face.png"),
                os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "face.png"),
                r"c:\Users\pipog\NEXA_ROBOT_V2\face.png"
            ]
            
            final_path = None
            for p in possible_paths:
                if os.path.exists(p):
                    final_path = p
                    print(f"[GUI] Logo encontrado en: {p}")
                    break
            
            if final_path:
                pil_image = Image.open(final_path)
                self.logo_image = ctk.CTkImage(light_image=pil_image, dark_image=pil_image, size=(50, 50))
            else:
                print("[GUI] ⚠️ No se encontró face.png")
                
        except Exception as e:
            print(f"[GUI] Error cargando imagen: {e}")

        # Label con imagen si existe
        if self.logo_image:
            self.title_label = ctk.CTkLabel(self.header_frame, text="  NEXA AI V2.0", image=self.logo_image, compound="left", font=("Roboto Medium", 20))
        else:
            self.title_label = ctk.CTkLabel(self.header_frame, text="🤖 NEXA AI V2.0", font=("Roboto Medium", 20))
            
        self.title_label.pack(pady=10, padx=10, side="left")
        
        self.status_label = ctk.CTkLabel(self.header_frame, text="🔴 Offline", text_color="gray")
        self.status_label.pack(pady=10, padx=10, side="right")

        # 2. Área de Chat (Log)
        self.chat_area = ctk.CTkTextbox(self, width=500, font=("Consolas", 14))
        self.chat_area.grid(row=1, column=0, padx=20, pady=20, sticky="nsew")
        self.chat_area.configure(state="disabled") # Solo lectura

        # 3. Panel de Control (Footer)
        self.footer_frame = ctk.CTkFrame(self, height=80, corner_radius=0)
        self.footer_frame.grid(row=2, column=0, sticky="ew")
        
        self.listen_button = ctk.CTkButton(self.footer_frame, text="🎤 ESCUCHAR AHORA", command=self.manual_listen, height=40, font=("Roboto", 14, "bold"))
        self.listen_button.pack(pady=20, padx=20, fill="x")

        # Variables de control
        self.agent_loop_callback = agent_loop_callback
        self.is_running = False

        # Iniciar hilo del agente
        self.start_agent()

    def start_agent(self):
        """Inicia el cerebro del robot en un hilo separado."""
        self.is_running = True
        self.status_label.configure(text="🟢 En Línea", text_color="#00FF00")
        
        # Thread daemon para que muera al cerrar la ventana
        self.thread = threading.Thread(target=self.agent_loop_callback, args=(self,), daemon=True)
        self.thread.start()

    def manual_listen(self):
        """Fuerza la escucha (placeholder por si quieres implementar push-to-talk)."""
        pass 

    def update_status(self, text, color="white"):
        """Actualiza el indicador de estado."""
        try:
            self.status_label.configure(text=text, text_color=color)
        except:
            pass

    def log_message(self, sender, message):
        """Escribe un mensaje en el chat."""
        try:
            timestamp = datetime.now().strftime("%H:%M")
            self.chat_area.configure(state="normal")
            
            if sender == "NEXA":
                prefix = f"[{timestamp}] 🤖 NEXA:\n"
                tag = "robot"
            elif sender == "USER":
                prefix = f"\n[{timestamp}] 👤 TÚ:\n"
                tag = "user"
            else:
                prefix = f"[{timestamp}] ℹ️ SISTEMA: "
                tag = "sys"

            full_text = f"{prefix}{message}\n"
            self.chat_area.insert("end", full_text)
            self.chat_area.see("end") # Auto-scroll
            self.chat_area.configure(state="disabled")
        except:
            pass

def launch_gui(agent_loop_func):
    app = NexaGUI(agent_loop_func)
    app.mainloop()
