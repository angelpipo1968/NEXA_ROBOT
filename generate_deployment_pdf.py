from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime
import os

# Configuración
PDF_FILENAME = "NEXA_OS_Deployment.pdf"
DOMAIN = "http://nexa-ai.dev"
VERSION = "1.0.0-alpha"
AUTHOR = "Ángel (NEXA Ai.Dev)"

def create_pdf():
    c = canvas.Canvas(PDF_FILENAME, pagesize=letter)
    width, height = letter

    # --- FONDO ---
    # Un fondo oscuro tecnológico (simulado con un rectángulo gris muy oscuro)
    c.setFillColorRGB(0.05, 0.05, 0.1) # #0f0c1a
    c.rect(0, 0, width, height, fill=1)

    # --- CABECERA ---
    # Título Principal
    c.setFillColor(colors.cyan)
    c.setFont("Helvetica-Bold", 30)
    c.drawString(1 * inch, height - 1.5 * inch, "NEXA OS")
    
    # Subtítulo
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 14)
    c.drawString(1 * inch, height - 1.8 * inch, "SISTEMA OPERATIVO DE INTELIGENCIA SOBERANA")

    # Línea separadora
    c.setStrokeColor(colors.cyan)
    c.setLineWidth(2)
    c.line(1 * inch, height - 2 * inch, width - 1 * inch, height - 2 * inch)

    # --- METADATOS ---
    y_pos = height - 3 * inch
    c.setFont("Courier", 12)
    c.setFillColor(colors.lightgrey)

    data = [
        f"DOMINIO:       {DOMAIN}",
        f"VERSIÓN:       {VERSION}",
        f"AUTOR:         {AUTHOR}",
        f"FECHA:         {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"ARQUITECTURA:  Local / Soberana (Python + Web)",
        f"ESTADO:        ACTIVO"
    ]

    for line in data:
        c.drawString(1 * inch, y_pos, line)
        y_pos -= 0.3 * inch

    # --- DETALLES TÉCNICOS ---
    y_pos -= 0.5 * inch
    c.setFillColor(colors.cyan)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, y_pos, "ESPECIFICACIONES DEL DESPLIEGUE")
    
    y_pos -= 0.4 * inch
    c.setFillColor(colors.white)
    c.setFont("Helvetica", 11)
    
    specs = [
        "• Núcleo: Python 3.10+ (Flask Backend)",
        "• Interfaz: HTML5 / CSS3 (Glassmorphism UI)",
        "• Comunicación: WebSockets en tiempo real",
        "• Memoria: Vectorial Local (RAG Ready)",
        "• Seguridad: Ejecución aislada en entorno local",
        "• Puertos: 5000 (Web), 8080 (API)"
    ]

    for spec in specs:
        c.drawString(1.2 * inch, y_pos, spec)
        y_pos -= 0.25 * inch

    # --- LOGO 3D (Simulado) ---
    # Dibujamos un triángulo futurista
    c.setStrokeColor(colors.magenta)
    c.setLineWidth(3)
    p = c.beginPath()
    p.moveTo(width - 2 * inch, height - 1.5 * inch)
    p.lineTo(width - 1.5 * inch, height - 2.5 * inch)
    p.lineTo(width - 2.5 * inch, height - 2.5 * inch)
    p.close()
    c.drawPath(p, stroke=1, fill=0)
    
    c.setFillColor(colors.cyan)
    c.setFont("Helvetica", 8)
    c.drawCentredString(width - 2 * inch, height - 2.7 * inch, "NEXA CORE")

    # --- FOOTER ---
    c.setFillColor(colors.grey)
    c.setFont("Helvetica", 9)
    c.drawCentredString(width / 2, 0.5 * inch, f"© {datetime.now().year} NEXA AI.DEV - DOCUMENTO CONFIDENCIAL")

    c.save()
    print(f"✅ PDF Generado exitosamente: {os.path.abspath(PDF_FILENAME)}")

if __name__ == "__main__":
    create_pdf()
