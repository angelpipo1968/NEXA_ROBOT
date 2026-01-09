#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>

// --- CONFIGURACIÓN WIFI ---
const char* ssid = "TU_WIFI_NOMBRE";
const char* password = "TU_WIFI_PASSWORD";

// --- HARDWARE ---
#define LED_PIN 2 // LED Integrado

// Motores (Driver L298N o similar)
#define MOTOR_A_1 26
#define MOTOR_A_2 27
#define MOTOR_B_1 14
#define MOTOR_B_2 12

// Sensor Ultrasónico (HC-SR04)
#define TRIG_PIN 5
#define ECHO_PIN 18

// Servidor Web en puerto 80
WebServer server(80);

// --- CABECERAS CORS (Para permitir acceso desde la App) ---
void sendCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

// --- MANEJADORES DE RUTAS ---

// 1. Página de Inicio (Status)
void handleRoot() {
  sendCorsHeaders();
  String html = "<html><body style='background:black; color:#00f3ff; font-family:monospace; text-align:center;'>";
  html += "<h1>🤖 NEXA ROBOT V2 - FIRMWARE</h1>";
  html += "<p>Estado: ONLINE</p>";
  html += "<p>IP: " + WiFi.localIP().toString() + "</p>";
  html += "<hr><p>Esperando comandos...</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// 2. Ejecutar Comandos
void handleCommand() {
  sendCorsHeaders();
  
  if (server.hasArg("action")) {
    String action = server.arg("action");
    String message = "";
    
    Serial.print("Comando recibido: ");
    Serial.println(action);

    if (action == "led_on") {
      digitalWrite(LED_PIN, HIGH);
      message = "LED Encendido";
    } 
    else if (action == "led_off") {
      digitalWrite(LED_PIN, LOW);
      message = "LED Apagado";
    }
    // --- CONTROL DE MOTORES ---
    else if (action == "move_forward") {
      // Motor A Avanza
      digitalWrite(MOTOR_A_1, HIGH); digitalWrite(MOTOR_A_2, LOW);
      // Motor B Avanza
      digitalWrite(MOTOR_B_1, HIGH); digitalWrite(MOTOR_B_2, LOW);
      message = "Avanzando";
    }
    else if (action == "move_back") {
      // Motor A Retrocede
      digitalWrite(MOTOR_A_1, LOW); digitalWrite(MOTOR_A_2, HIGH);
      // Motor B Retrocede
      digitalWrite(MOTOR_B_1, LOW); digitalWrite(MOTOR_B_2, HIGH);
      message = "Retrocediendo";
    }
    else if (action == "move_left") {
      // Giro Izquierda (Motor A Atrás, Motor B Adelante)
      digitalWrite(MOTOR_A_1, LOW); digitalWrite(MOTOR_A_2, HIGH);
      digitalWrite(MOTOR_B_1, HIGH); digitalWrite(MOTOR_B_2, LOW);
      message = "Girando Izquierda";
    }
    else if (action == "move_right") {
      // Giro Derecha (Motor A Adelante, Motor B Atrás)
      digitalWrite(MOTOR_A_1, HIGH); digitalWrite(MOTOR_A_2, LOW);
      digitalWrite(MOTOR_B_1, LOW); digitalWrite(MOTOR_B_2, HIGH);
      message = "Girando Derecha";
    }
    else if (action == "stop") {
      // Parar todo
      digitalWrite(MOTOR_A_1, LOW); digitalWrite(MOTOR_A_2, LOW);
      digitalWrite(MOTOR_B_1, LOW); digitalWrite(MOTOR_B_2, LOW);
      message = "Motores Detenidos";
    }
    else if (action == "scan") {
      // Aquí iría lógica de sensores
      message = "Escaneo completado (Simulado)";
      // Parpadeo rápido
      for(int i=0; i<5; i++) {
        digitalWrite(LED_PIN, HIGH); delay(100);
        digitalWrite(LED_PIN, LOW); delay(100);
      }
    }
    else {
      message = "Comando desconocido";
    }

    server.send(200, "application/json", "{\"status\":\"success\", \"message\":\"" + message + "\"}");
  } else {
    server.send(400, "application/json", "{\"status\":\"error\", \"message\":\"Falta parametro 'action'\"}");
  }
}

// 3. Obtener Datos de Sensores
void handleSensors() {
  sendCorsHeaders();
  
  // Medir distancia
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  int distance = duration * 0.034 / 2; // cm
  
  // Limitar ruido
  if (distance > 400 || distance < 0) distance = 400;

  String json = "{";
  json += "\"distance\": " + String(distance) + ",";
  json += "\"status\": \"online\"";
  json += "}";
  
  server.send(200, "application/json", json);
}

// 4. Manejar OPTIONS (Pre-flight CORS)
void handleOptions() {
  sendCorsHeaders();
  server.send(200, "text/plain", "");
}

void handleNotFound() {
  if (server.method() == HTTP_OPTIONS) {
    handleOptions();
  } else {
    server.send(404, "text/plain", "Not Found");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Configurar Pines de Motor
  pinMode(MOTOR_A_1, OUTPUT); pinMode(MOTOR_A_2, OUTPUT);
  pinMode(MOTOR_B_1, OUTPUT); pinMode(MOTOR_B_2, OUTPUT);
  // Motores parados al inicio
  digitalWrite(MOTOR_A_1, LOW); digitalWrite(MOTOR_A_2, LOW);
  digitalWrite(MOTOR_B_1, LOW); digitalWrite(MOTOR_B_2, LOW);

  // Configurar Sensor
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Conexión WiFi
  Serial.println("\nConnecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // Parpadeo mientras conecta
  }
  
  digitalWrite(LED_PIN, LOW); // Apagar al conectar
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Rutas del Servidor
  server.on("/", handleRoot);
  server.on("/command", handleCommand);
  server.on("/sensors", handleSensors);
  server.onNotFound(handleNotFound);

  // Iniciar
  server.begin();
  Serial.println("HTTP Server Started");
}

void loop() {
  server.handleClient();
  delay(2); // Pequeña pausa para estabilidad
}
