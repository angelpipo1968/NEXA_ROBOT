from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys

class MockAIServer(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        print(f"📥 Received AI Request: {post_data.decode('utf-8')}")

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        response = {
            "choices": [
                {
                    "message": {
                        "content": "¡Conexión Neural Exitosa! Tus tokens son ilimitados. El futuro es ahora."
                    }
                }
            ]
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))

if __name__ == '__main__':
    port = 11434
    print(f"🤖 Mock AI Server running on port {port}...")
    httpd = HTTPServer(('0.0.0.0', port), MockAIServer)
    httpd.serve_forever()
