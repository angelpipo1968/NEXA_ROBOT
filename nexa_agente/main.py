# main.py
from agent_core.permissions import request_admin
from agent_core.executor import launch_server
import os
import sys
import webbrowser

# Motor de decisión de la IA (Lógica básica)
def ai_decide_server():
    """
    Decide qué servidor iniciar basado en el contenido del directorio actual.
    """
    print("\n[🧠] NEXA AI está analizando el proyecto...")
    
    project_path = os.getcwd()
    
    if os.path.exists(os.path.join(project_path, "package.json")):
        try:
            with open("package.json", "r", encoding="utf-8") as f:
                content = f.read().lower()
                if "next" in content:
                    return "npx next dev --port 3000", project_path, False
                elif "vite" in content or "vue" in content:
                    return "npm run dev", project_path, False
                else:
                    return "npm start", project_path, False
        except:
             return "npm start", project_path, False
                
    elif os.path.exists(os.path.join(project_path, "requirements.txt")):
        return "python -m http.server 8080", project_path, False
    
    # Valor por defecto: servidor web estático
    return "python -m http.server 8000", project_path, False

if __name__ == "__main__":
    request_admin()  # Asegura permisos si serán necesarios

    print("╔════════════════════════════════════╗")
    print("║  🌌 NEXA AI.Dev - Agente Autónomo  ║")
    print("╚════════════════════════════════════╝")
    print("Sistema listo con permisos totales.\n")

    # Abrir la interfaz holográfica automáticamente
    ui_path = os.path.join(os.getcwd(), "ui", "index.html")
    print(f"[🖥️] Abriendo interfaz en: {ui_path}")
    webbrowser.open(f"file:///{ui_path}")

    # Tu IA decide qué servidor iniciar
    command, work_dir, needs_admin_flag = ai_decide_server()

    # Lanzar con permiso explícito
    launch_server(
        command=command,
        working_dir=work_dir,
        needs_admin=needs_admin_flag
    )

    print(f"\n[📄] Proceso finalizado.")
    input("\nPresiona ENTER para salir...")
