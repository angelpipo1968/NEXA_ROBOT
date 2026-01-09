from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse
import json

# Configuración
HOST_NAME = "0.0.0.0"
SERVER_PORT = 80  # Cambiar a 8080 si falla por permisos

class MockHardwareHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        
        # Endpoint raíz: Panel de estado simple
        if parsed_path.path == "/":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            html = """
            <html>
            <body style="background:#000; color:#00f3ff; font-family:monospace; text-align:center; padding-top:50px;">
                <h1>🤖 NEXA HARDWARE SIMULATOR</h1>
                <p>Status: <span style="color:#0f0">ONLINE</span></p>
                <p>Port: 80</p>
                <hr style="border-color:#333; width:50%;">
                <p>Waiting for commands...</p>
                <p style="color:#555; font-size:12px;">Use /command?action=... endpoint</p>
            </body>
            </html>
            """
            self.wfile.write(html.encode('utf-8'))
            return

        # Endpoint para comandos: /command?action=...
        if parsed_path.path == "/command":
            query = urllib.parse.parse_qs(parsed_path.query)
            action = query.get('action', [''])[0]
            
            print(f"\n⚡ [HARDWARE] Comando Recibido: {action}")
            
            if action == 'led_on':
                print("💡 LUZ ENCENDIDA")
            elif action == 'led_off':
                print("🌑 LUZ APAGADA")
            elif action == 'scan':
                print("📡 ESCANEANDO SENSORES...")
            
            # Respuesta JSON para el navegador
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*") # CORS para que funcione desde localhost
            self.end_headers()
            
            response = {"status": "success", "message": f"Comando '{action}' ejecutado en simulador."}
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    print(f"🤖 Simulador de Hardware NEXA iniciado en http://localhost:{SERVER_PORT}")
    print("👉 Configura la IP del Hardware en la app como: http://localhost (o tu IP local)")
    try:
        webServer = HTTPServer((HOST_NAME, SERVER_PORT), MockHardwareHandler)
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass
    print("Simulador detenido.")
