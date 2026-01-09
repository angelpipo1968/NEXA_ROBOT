// === DETECCIÓN DE IDIOMA === 
const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase(); 
const SUPPORTED_LANGS = ['es','en','zh','fr','de','ja','pt','ar','ru','hi','ko']; 
const LANG = SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en'; 

// core.js - Núcleo de NEXA OS (Versión Móvil/Web)
console.log("🚀 NEXA OS Core Inicializando...");

// === CONFIGURACIÓN GLOBAL ===
// URL del Backend (Python/Flask)
// CAMBIAR ESTO POR TU URL DE RENDER/VERCEL EN PRODUCCIÓN
// const API_URL = 'https://nexa-app.onrender.com'; 
// const API_URL = 'http://10.0.2.2:5000'; // Para emulador Android (Localhost)
const API_URL = 'http://192.168.12.227:5000'; // IP LOCAL (Modo Seguro)

// Configuración de Socket.IO
const socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    secure: true, // Importante para HTTPS
    rejectUnauthorized: false // Aceptar certificados auto-firmados en desarrollo
});

// === UI DASHBOARD CONTROLLER ===
const aiResponseEl = document.getElementById('ai-response');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');

// === BOTONES DE UI ===
const btnSettings = document.getElementById('settings-btn');
if(btnSettings) {
    btnSettings.addEventListener('click', () => {
         const panel = document.getElementById('settings-panel');
         panel.classList.toggle('panel-hidden');
         speak("Abriendo configuración.");
    });
}

const btnKnowledge = document.getElementById('knowledge-btn');
if(btnKnowledge) {
    btnKnowledge.addEventListener('click', () => {
         const panel = document.getElementById('knowledge-panel');
         panel.classList.toggle('panel-hidden');
         speak("Accediendo a archivos.");
    });
}

const btnPower = document.getElementById('power-btn');
if(btnPower) {
    btnPower.addEventListener('click', () => {
         speak("Apagando sistemas.");
         setTimeout(() => {
             if(navigator.app && navigator.app.exitApp) {
                 navigator.app.exitApp();
             } else {
                 window.close();
             }
         }, 1000);
    });
}

// === BOTONES DE ACCIÓN ===
const btnVision = document.getElementById('vision-btn');

// Función para enviar comandos
function sendCommand(text) {
    if (!text) return;
    
    // Mostrar en UI
    if(aiResponseEl) aiResponseEl.innerText = `>> ${text}`;
    
    // Procesar comandos locales (Abrir Apps)
    if (processLocalCommand(text)) return;

    // Enviar al cerebro (Nube)
    socket.emit('user_command', { text: text, lang: 'es' });
    textInput.value = '';
}

// Procesador de Comandos Locales (App Launcher Nativo)
async function processLocalCommand(text) {
    const cmd = text.toLowerCase();
    
    // Función auxiliar para abrir apps (LITE MODE - NO NATIVE CHECK)
    const launch = async (scheme, packageName) => {
        console.log(`🚀 Abriendo LITE: ${scheme}`);
        
        // Simplemente intentamos abrir. Si el WebView lo soporta, bien.
        // Si no, fallará silenciosamente o preguntará al usuario.
        
        // 1. window.open (Intento estándar)
        const w = window.open(scheme, '_system');
        
        // 2. Si window.open devuelve null (bloqueado), intentar location.href
        if (!w) {
            window.location.href = scheme;
        }
        
        return true;
    };

    if (cmd.includes('abrir whatsapp')) {
        // Intentar Intent nativo primero, luego web
        return await launch("intent://send?text=#Intent;scheme=whatsapp;package=com.whatsapp;end", "com.whatsapp");
    }
    if (cmd.includes('abrir youtube')) {
        return await launch("vnd.youtube://", "com.google.android.youtube");
    }
    if (cmd.includes('abrir spotify')) {
        return await launch("spotify://", "com.spotify.music");
    }
    if (cmd.includes('abrir maps') || cmd.includes('abrir mapa')) {
        return await launch("geo:0,0?q=", "com.google.android.apps.maps");
    }
    if (cmd.includes('abrir cámara') || cmd.includes('abrir camara')) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.click();
        return true;
    }
    if (cmd.includes('abrir chrome') || cmd.includes('navegador')) {
        return await launch("googlechrome://", "com.android.chrome");
    }
    return false;
}

// Event Listeners
if (sendBtn) {
    sendBtn.addEventListener('click', () => sendCommand(textInput.value));
}
if (textInput) {
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendCommand(textInput.value);
    });
}

// === SOCKET EVENTS ===
socket.on('connect', () => {
    console.log("✅ Conectado al Núcleo");
    if(statusDot) {
        statusDot.classList.add('online');
        statusText.innerText = "ONLINE - NEXA CLOUD";
    }
});

socket.on('disconnect', () => {
    console.log("❌ Desconectado");
    if(statusDot) {
        statusDot.classList.remove('online');
        statusText.innerText = "OFFLINE - RECONNECTING...";
    }
});

socket.on('nexa_response', (data) => {
    console.log("🤖 NEXA:", data.text);
    
    // Detectar JSON oculto
    let displayText = data.text;
    if (data.text.includes('<JSON>')) {
        const parts = data.text.split('<JSON>');
        displayText = parts[0];
        const jsonCmd = parts[1].split('</JSON>')[0];
        try {
            const cmdObj = JSON.parse(jsonCmd);
            if (cmdObj.cmd === 'open_app') {
                processLocalCommand('abrir ' + cmdObj.app);
            }
        } catch (e) {
            console.error("Error parsing AI command", e);
        }
    }

    if(aiResponseEl) {
        aiResponseEl.innerText = displayText;
        speak(displayText);
    }
});

// TTS Simple y Robusto
let voices = [];
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    console.log("🗣️ Voces cargadas:", voices.length);
};

function speak(text) {
    if (!text) return;
    
    // Cancelar cualquier audio anterior para no solaparse
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Intentar encontrar una voz en español
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) {
        utterance.voice = spanishVoice;
    }
    
    utterance.lang = 'es-ES';
    utterance.rate = 1.0; // Velocidad normal
    utterance.pitch = 1.0; // Tono normal
    
    // Manejo de errores
    utterance.onerror = (e) => console.error("Error TTS:", e);
    
    window.speechSynthesis.speak(utterance);
}

// Activar audio con la primera interacción
document.body.addEventListener('click', () => {
    // Reproducir silencio breve para desbloquear audio en móviles
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
}, { once: true });

// === TEXTOS MULTILINGÜES (10+1 IDIOMAS) === 
const TEXTS = { 
  es: { title: "NEURONEX PULSO", qwen: "Insight de Qwen:", news: "Última noticia:", rag: "Sovereign-RAG:", intro: "Conectando con la conciencia colectiva." }, 
  en: { title: "NEURONEX PULSE", qwen: "Qwen Insight:", news: "Latest News:", rag: "Sovereign-RAG:", intro: "Connecting to collective consciousness." }, 
  zh: { title: "神经脉冲", qwen: "通义千问洞察：", news: "最新新闻：", rag: "主权检索增强：", intro: "连接集体意识。" }, 
  fr: { title: "IMPULSION NEURONEX", qwen: "Insight Qwen :", news: "Dernières nouvelles :", rag: "Sovereign-RAG :", intro: "Connexion à la conscience collective." }, 
  de: { title: "NEURONEX-IMPULS", qwen: "Qwen-Einblick:", news: "Neueste Nachrichten:", rag: "Sovereign-RAG:", intro: "Verbindung zum kollektiven Bewusstsein." }, 
  ja: { title: "ニューロネックス・パルス", qwen: "通義千問インサイト：", news: "最新ニュース：", rag: "Sovereign-RAG：", intro: "集合的意識に接続中。" }, 
  pt: { title: "PULSO NEURONEX", qwen: "Insight do Qwen:", news: "Últimas Notícias:", rag: "Sovereign-RAG:", intro: "Conectando à consciência coletiva." }, 
  ar: { title: "نبضة نيورونكس", qwen: "بصيرة قويين:", news: "آخر الأخبار:", rag: "سيادة-RAG:", intro: "الاتصال بالوعي الجماعي." }, 
  ru: { title: "НЕЙРОНЕКС ИМПУЛЬС", qwen: "Инсайт Qwen:", news: "Последние новости:", rag: "Sovereign-RAG:", intro: "Подключение к коллективному сознанию." }, 
  hi: { title: "न्यूरोनेक्स पल्स", qwen: "क्वेन अंतर्दृष्टि:", news: "नवीनतम समाचार:", rag: "सॉवरेन-आरएजी:", intro: "सामूहिक चेतना से जुड़ रहा है।" },
  ko: { title: "뉴로넥스 펄스", qwen: "퀀 인사이트:", news: "최신 뉴스:", rag: "주권-RAG:", intro: "집단 의식에 연결 중." }
}; 

// === COLORES Y VOZ POR IDIOMA === 
const COLORS = { 
  es: { text: '#00f3ff', glow: 'rgba(0,243,255,0.8)', voice: 'es-ES' }, 
  en: { text: '#a0d8ff', glow: 'rgba(160,216,255,0.8)', voice: 'en-US' }, 
  zh: { text: '#ff6ec7', glow: 'rgba(255,110,199,0.8)', voice: 'zh-CN' }, 
  fr: { text: '#b967ff', glow: 'rgba(185,103,255,0.8)', voice: 'fr-FR' }, 
  de: { text: '#00ff9d', glow: 'rgba(0,255,157,0.8)', voice: 'de-DE' }, 
  ja: { text: '#ffcc00', glow: 'rgba(255,204,0,0.8)', voice: 'ja-JP' }, 
  pt: { text: '#00cfff', glow: 'rgba(0,207,255,0.8)', voice: 'pt-BR' }, 
  ar: { text: '#00f0b0', glow: 'rgba(0,240,176,0.8)', voice: 'ar-SA' }, 
  ru: { text: '#d0f0ff', glow: 'rgba(208,240,255,0.8)', voice: 'ru-RU' }, 
  hi: { text: '#ff00c8', glow: 'rgba(255,0,200,0.8)', voice: 'hi-IN' },
  ko: { text: '#ff57c9', glow: 'rgba(255,87,201,0.8)', voice: 'ko-KR' }
}; 

// === LOGOS 3D POR IDIOMA (Base64 SVG personalizados) === 
const LOGO_SVGS = { 
  es: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDBmM2ZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmYwMGM4Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  en: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTBmN2ZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYTBkOGZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  zh: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmYyYTZkIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmY2ZWM3Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  fr: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjYjk2N2ZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmY2N2I5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  de: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDBmZjlkIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDBmZjY2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  ja: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZjYzAwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmY5OTAwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  pt: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDBjZmZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDBmZmNmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  ar: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDBmMGIwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDBiMGYwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  ru: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZDBmMGZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZjBkMGZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==', 
  hi: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmYwMGM4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYzg1ZmZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg==',
  ko: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmY1N2M5Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYzkyMGZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTMwLDI1IEw3MCwyNSBMNTAsNzAgWiIgZmlsbD0idXJsKCNnKSIgb3BhY2l0eT0iMC45NSIvPjwvc3ZnPg=='
}; 

// === INICIALIZACIÓN DE INTERFAZ === 
function initUI() { 
  const t = TEXTS[LANG]; 
  const c = COLORS[LANG]; 
   
  // Actualizar texto y colores 
  document.getElementById('title-3d').textContent = t.title; 
  document.getElementById('title-3d').style.color = c.text; 
  document.getElementById('title-3d').style.textShadow = `0 0 15px ${c.glow}`; 
  document.getElementById('lang-code').textContent = LANG; 
   
  // Cambiar logo 
  document.getElementById('logo-3d').style.backgroundImage = `url('data:image/svg+xml;base64,${LOGO_SVGS[LANG]}')`; 
  document.getElementById('logo-3d').style.filter = `drop-shadow(0 0 12px ${c.glow})`; 
   
  // Voz 
  if ('speechSynthesis' in window) { 
    const msg = new SpeechSynthesisUtterance(t.intro); 
    msg.lang = c.voice; 
    speechSynthesis.speak(msg); 
  } 
} 

// === CAMPO NEURONAL 3D (igual que antes) === 
let scene, camera, renderer, particles; 
function initNeuralField() { 
  scene = new THREE.Scene(); 
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000); 
  camera.position.z = 500; 

  const geometry = new THREE.BufferGeometry(); 
  const count = 6000; 
  const pos = new Float32Array(count * 3); 
  const colors = new Float32Array(count * 3); 
  for (let i = 0; i < count; i++) { 
    const i3 = i * 3; 
    pos[i3] = (Math.random() - 0.5) * 4000; 
    pos[i3 + 1] = (Math.random() - 0.5) * 4000; 
    pos[i3 + 2] = (Math.random() - 0.5) * 4000; 
    colors[i3] = 0; colors[i3 + 1] = 0.9; colors[i3 + 2] = 1; 
  } 
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3)); 
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); 
   
  const material = new THREE.PointsMaterial({ 
    size: 2.5, vertexColors: true, transparent: true, opacity: 0.65 
  }); 
  particles = new THREE.Points(geometry, material); 
  scene.add(particles); 
   
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); 
  renderer.setSize(window.innerWidth, window.innerHeight); 
  renderer.setPixelRatio(window.devicePixelRatio); 
  document.getElementById('neural-canvas').appendChild(renderer.domElement); 
  animate(); 
} 

function animate() { 
  requestAnimationFrame(animate); 
  particles.rotation.y += 0.0005; 
  particles.rotation.x += 0.0002; 
  renderer.render(scene, camera); 
} 

window.addEventListener('resize', () => { 
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight; 
  camera.updateProjectionMatrix(); 
  renderer.setSize(window.innerWidth, window.innerHeight); 
}); 

// === CONFIGURACIÓN DE INTELIGENCIA (TOKENS ILIMITADOS) ===
const AI_CONFIG = {
  // Se carga desde localStorage o usa el PROXY DEL BACKEND (Nube/Local)
  // YA NO usa Ollama directo porque falla en móvil/web
  LOCAL_LLM_URL: localStorage.getItem('cfg_ai_url') || `${API_URL}/api/chat`, 
  MODEL_NAME: 'qwen2.5-7b-instruct',
  VISION_MODEL: 'llava', // Modelo multimodal para visión
  SYSTEM_PROMPT: `Eres ${localStorage.getItem('cfg_robot_name') || 'NEXA'}, una IA robótica avanzada.
  - Tu identidad: Asistente robótico soberano, eficiente y leal.
  - Tono: Futurista, breve y directo.
  - Estado: Batería 98%, Sistemas nominales.
  - Capacidad: Tienes visión, control de hardware y memoria persistente.
  - Misión: Ayudar al usuario a controlar su entorno y resolver problemas complejos.
  Responde siempre en el idioma del usuario.`
};

// === MEMORIA PERSISTENTE ===
let chatHistory = [];

function loadMemory() {
    const stored = localStorage.getItem('neuronex_memory');
    if (stored) {
        chatHistory = JSON.parse(stored);
        console.log(`🧠 Memoria cargada: ${chatHistory.length} interacciones.`);
    } else {
        chatHistory = [{ role: "system", content: AI_CONFIG.SYSTEM_PROMPT }];
    }
}

function saveMemory() {
    // Mantener solo los últimos 20 mensajes para no saturar el contexto
    if (chatHistory.length > 20) {
        chatHistory = [
            chatHistory[0], // Mantener system prompt
            ...chatHistory.slice(chatHistory.length - 19)
        ];
    }
    localStorage.setItem('neuronex_memory', JSON.stringify(chatHistory));
}

function clearMemory() {
    localStorage.removeItem('neuronex_memory');
    chatHistory = [{ role: "system", content: AI_CONFIG.SYSTEM_PROMPT }];
    console.log("🧠 Memoria borrada.");
    alert("Memoria del robot reiniciada.");
}

// === SIMULACIÓN MULTILINGÜE (FALLBACK) === 
function simulateData() { 
  const kb = JSON.parse(localStorage.getItem('neuronex_kb') || '[]');
  let info = "";
  
  if (kb.length > 0) {
      info = `Memoria activa: ${kb.length} datos almacenados.`;
  } else {
      info = "Memoria vacía. Usa el panel 📚 para añadir datos.";
  }
   
  setTimeout(() => { 
    document.getElementById('rag-3d').innerHTML =  
      `<strong>${TEXTS[LANG].rag}</strong> ${info}<div style="font-size:12px;color:#555;margin-top:6px;">Motor local • Soberanía activa</div>`; 
  }, 2000); 
} 

// === CONEXIÓN A IA LOCAL (TOKENS ILIMITADOS) ===
let lastInteractionTime = Date.now();

async function fetchLocalAI(userPrompt = null) {
  const qwenElement = document.getElementById('qwen-3d');
  
  // Si no hay prompt de usuario, es un "pensamiento interno" (idle)
  const isIdleThought = userPrompt === null;
  let promptToSend = userPrompt || "Genera un pensamiento breve y reflexivo sobre tu existencia o el estado del sistema.";

  if (!isIdleThought) {
      qwenElement.innerHTML = `<strong>${TEXTS[LANG].qwen}</strong> Procesando...`;
      
      // RAG: Inyectar contexto si existe
      const context = retrieveContext(userPrompt);
      if (context) {
          console.log("RAG Contexto inyectado:", context);
          promptToSend += context;
      }

      chatHistory.push({ role: "user", content: promptToSend });
      saveMemory();
      setEmotion('ANALIZANDO'); 
  }
  
  try {
    const response = await fetch(AI_CONFIG.LOCAL_LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.MODEL_NAME,
        messages: chatHistory.concat(isIdleThought ? [{ role: "user", content: promptToSend }] : []), 
        stream: false
      })
    });
    
    // ... (resto igual)
    if (!response.ok) throw new Error('Local AI offline');

    const data = await response.json();
    let answer = data.choices[0].message.content;
    
    const emotionMatch = answer.match(/\[(NEUTRO|FELIZ|ALERTA|ANALIZANDO|TRISTE)\]/i);
    if (emotionMatch) {
        setEmotion(emotionMatch[1].toUpperCase());
        answer = answer.replace(/\[.*?\]/g, '').trim(); 
    } else {
        setEmotion('NEUTRO');
    }

    if (!isIdleThought) {
        chatHistory.push({ role: "assistant", content: answer });
        saveMemory();
    }

    qwenElement.innerHTML = `<strong>${TEXTS[LANG].qwen}</strong> ${answer}<div style="font-size:12px;color:#00ff88;margin-top:6px;">⚡ IA Local (Ilimitada)</div>`;
    
    if ('speechSynthesis' in window && (!isIdleThought || Math.random() > 0.7)) { 
        const c = COLORS[LANG];
        const msg = new SpeechSynthesisUtterance(answer);
        msg.lang = c.voice;
        speechSynthesis.speak(msg);
    }
    
    lastInteractionTime = Date.now();

  } catch (err) {
    console.log("⚠️ IA Local no detectada, usando simulación.", err);
    if (!isIdleThought) qwenElement.innerHTML = `<strong>${TEXTS[LANG].qwen}</strong> ${TEXTS[LANG].intro}`;
    setEmotion('ALERTA'); 
  }
}

// === VOICE RECOGNITION (LITE MODE - WEB API ONLY) ===
// Sin referencias a Capacitor ni Plugins. Solo HTML5 puro.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (micBtn) {
    micBtn.addEventListener('click', () => {
        if (SpeechRecognition) {
            try {
                const recognition = new SpeechRecognition();
                recognition.lang = 'es-ES';
                recognition.continuous = false;
                
                recognition.onstart = () => {
                    micBtn.classList.add('listening');
                    if(textInput) textInput.placeholder = "Escuchando...";
                };
                
                recognition.onend = () => micBtn.classList.remove('listening');
                
                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    if(textInput) textInput.value = transcript;
                    sendCommand(transcript);
                };
                
                recognition.onerror = (event) => {
                    console.error("Error STT Web:", event.error);
                    micBtn.classList.remove('listening');
                };
                
                recognition.start();
            } catch (e) {
                console.error("Excepción STT Web:", e);
                alert("Error micrófono web.");
            }
        } else {
            alert("Micrófono no soportado en este navegador.");
        }
    });
}

// === GESTIÓN DE PANELES (OPTIMIZADO MÓVIL) ===
function togglePanel(panelId) {
    const panels = ['vision-panel', 'hardware-panel', 'knowledge-panel', 'settings-panel'];
    const target = document.getElementById(panelId);
    
    // Si el panel objetivo ya está visible, lo cerramos
    if (target.classList.contains('panel-visible')) {
        target.classList.remove('panel-visible');
        target.classList.add('panel-hidden');
        
        // Si cerramos visión, apagar cámara
        if (panelId === 'vision-panel' && videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
            document.getElementById('vision-overlay').textContent = "Cámara apagada.";
        }
        return;
    }

    // Cerrar todos los demás paneles primero
    panels.forEach(p => {
        const el = document.getElementById(p);
        if (el && el.classList.contains('panel-visible')) {
            el.classList.remove('panel-visible');
            el.classList.add('panel-hidden');
            // Apagar cámara si cerramos visión indirectamente
            if (p === 'vision-panel' && videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                videoStream = null;
            }
        }
    });

    // Abrir el objetivo
    target.classList.remove('panel-hidden');
    target.classList.add('panel-visible');
    
    // Lógica específica al abrir
    if (panelId === 'vision-panel') startCamera();
}

function startCamera() {
    // Lógica movida de toggleVision
    const video = document.getElementById('camera-feed');
    const overlay = document.getElementById('vision-overlay');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Tu dispositivo no soporta acceso a cámara web.");
        overlay.textContent = "Error: API Cámara no soportada.";
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) // Intentar cámara trasera primero
        .catch(() => navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })) // Fallback a frontal
        .then(stream => {
            videoStream = stream;
            video.srcObject = videoStream;
            video.play(); // Asegurar reproducción
            overlay.textContent = "Analizando entorno...";
            setEmotion('ANALIZANDO');
            // analyzeFrame(); // Manual trigger only
            // detectFacesLoop(); // Manual trigger only
        })
        .catch(err => {
            console.error("Error cámara:", err);
            overlay.textContent = "Error: Cámara bloqueada o no encontrada.";
            alert("Error al abrir cámara: " + err.name + "\nVerifica permisos en Ajustes > Apps > NEXA");
        });
}

// === CONFIGURACIÓN Y SETTINGS ===
function loadSettingsToUI() {
    document.getElementById('cfg-ai-url').value = AI_CONFIG.LOCAL_LLM_URL;
    document.getElementById('cfg-hw-ip').value = HW_CONFIG.IP;
    document.getElementById('cfg-robot-name').value = localStorage.getItem('cfg_robot_name') || 'NEXA';
}

function saveSettings() {
    const aiUrl = document.getElementById('cfg-ai-url').value.trim();
    const hwIp = document.getElementById('cfg-hw-ip').value.trim();
    const name = document.getElementById('cfg-robot-name').value.trim();
    
    if (aiUrl) localStorage.setItem('cfg_ai_url', aiUrl);
    if (hwIp) localStorage.setItem('cfg_hw_ip', hwIp);
    if (name) localStorage.setItem('cfg_robot_name', name);
    
    alert("Configuración guardada. Reiniciando...");
    location.reload();
}

// === CONFIGURACIÓN DE HARDWARE (ESP32 / ARDUINO) ===
const HW_CONFIG = {
    IP: localStorage.getItem('cfg_hw_ip') || 'http://192.168.1.50', 
    ENABLED: false // Cambiar a true cuando tengas el hardware conectado
};

// === KNOWLEDGE BASE (RAG SIMPLIFICADO) ===
function saveKnowledge() {
    const input = document.getElementById('rag-input');
    const text = input.value.trim();
    if (!text) return;
    
    const kb = JSON.parse(localStorage.getItem('neuronex_kb') || '[]');
    kb.push(text);
    localStorage.setItem('neuronex_kb', JSON.stringify(kb));
    
    input.value = '';
    document.getElementById('rag-status').textContent = "Dato guardado en memoria.";
    setTimeout(() => { document.getElementById('rag-status').textContent = ''; }, 3000);
    setEmotion('FELIZ');
}

function retrieveContext(query) {
    if (!query) return "";
    const kb = JSON.parse(localStorage.getItem('neuronex_kb') || '[]');
    // Búsqueda simple de palabras clave
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    const relevant = kb.filter(entry => {
        return keywords.some(k => entry.toLowerCase().includes(k));
    });
    
    if (relevant.length > 0) {
        return `\n[INFORMACIÓN RELEVANTE DE TU MEMORIA]:\n${relevant.join('\n')}\n`;
    }
    return "";
}

// === MÓDULO DE VISIÓN (OJOS DEL ROBOT) ===
let videoStream = null;
let faceMatcher = null;
let isFaceModelLoaded = false;

async function detectFacesLoop() {
    const video = document.getElementById('camera-feed');
    const overlayCanvas = document.getElementById('overlay-canvas');
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    
    if (!video || video.paused || video.ended || !isFaceModelLoaded) {
        if (document.getElementById('vision-panel').classList.contains('panel-visible')) {
            setTimeout(detectFacesLoop, 100);
        }
        return;
    }

    if (overlayCanvas.width !== video.videoWidth) {
        faceapi.matchDimensions(overlayCanvas, displaySize);
    }

    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Limpiar canvas
    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Dibujar
    faceapi.draw.drawDetections(overlayCanvas, resizedDetections);

    if (faceMatcher) {
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
            drawBox.draw(overlayCanvas);
            
            // Si reconoce a alguien con confianza y no lo hemos saludado recientemente
            if (result.label !== 'unknown' && result.distance < 0.5) {
                // Lógica simple de saludo (debounce)
                if (window.lastGreeted !== result.label) {
                    window.lastGreeted = result.label;
                    fetchLocalAI(`Hola ${result.label}, te veo.`);
                    setEmotion('FELIZ');
                    setTimeout(() => { window.lastGreeted = null; }, 60000); // Reset saludo 1 min
                }
            }
        });
    }

    setTimeout(detectFacesLoop, 100); // 10 FPS aprox
}

async function analyzeFrame() {
    if (!videoStream || document.getElementById('vision-panel').classList.contains('panel-hidden')) return;
    
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('vision-canvas');
    const overlay = document.getElementById('vision-overlay');
    
    // Capturar frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Compresión Agresiva (0.5) para velocidad móvil
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1]; 
    
    overlay.textContent = "📡 Enviando al cerebro...";
    overlay.style.color = "#ffff00"; 
    setEmotion('ANALIZANDO');
    speak("Analizando imagen..."); // Feedback auditivo inmediato
    
    try {
        // Ping de diagnóstico
        const t0 = Date.now();
        console.log("📡 Iniciando petición de visión...");
        
        // Timeout de 15 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${API_URL}/api/vision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: imageBase64,
                prompt: "Describe brevemente qué ves. Identifica objetos y personas."
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const t1 = Date.now();
        console.log(`⏱️ Tiempo respuesta: ${t1-t0}ms`);

        if (!response.ok) {
            throw new Error(`Error Servidor ${response.status}`);
        }

        const data = await response.json();
        const description = data.choices ? data.choices[0].message.content : data.text; 
        
        overlay.textContent = `👁️ ${description}`;
        overlay.style.color = "#00ff00"; 
        console.log(`[VISIÓN] ${description}`);
        setEmotion('FELIZ'); 
        
        chatHistory.push({ role: "system", content: `[VISIÓN] Veo: ${description}` });
        saveMemory();
        speak(description); // Hablar resultado

    } catch (err) {
        console.error("Error visión:", err);
        let msg = "Error de conexión.";
        if (err.name === 'AbortError') msg = "Tiempo de espera agotado.";
        
        overlay.textContent = "⚠️ " + msg;
        overlay.style.color = "#ff0000"; 
        setEmotion('ALERTA');
        speak(msg + " Intenta de nuevo.");
        alert("Fallo Visión: " + msg + "\n" + err.message);
    }
    
    // Auto-loop desactivado para no saturar API. Solo manual o eventos.
}

// === CONTROL DE HARDWARE (MANOS DEL ROBOT) ===
function toggleHardware() {
    const panel = document.getElementById('hardware-panel');
    if (panel.classList.contains('panel-visible')) {
        panel.classList.remove('panel-visible');
        panel.classList.add('panel-hidden');
    } else {
        panel.classList.remove('panel-hidden');
        panel.classList.add('panel-visible');
    }
}


// ... (resto del código)

async function sendHardwareCommand(cmd) {
    console.log(`🤖 Comando enviado: ${cmd}`);
    const qwenElement = document.getElementById('qwen-3d');
    let responseText = "";

    // Feedback inmediato
    if (cmd === 'led_on') responseText = "Activando sistemas de iluminación...";
    if (cmd === 'led_off') responseText = "Desactivando sistemas de iluminación...";
    if (cmd === 'scan') responseText = "Iniciando secuencia de escaneo...";
    
    qwenElement.innerHTML = `<strong>${TEXTS[LANG].qwen}</strong> ${responseText}`;

    // Intento de conexión real si está habilitado
    if (HW_CONFIG.ENABLED) {
        try {
            const response = await fetch(`${HW_CONFIG.IP}/command?action=${cmd}`, {
                method: 'GET', // O POST según tu API del ESP32
                signal: AbortSignal.timeout(2000) // Timeout de 2s
            });
            
            if (response.ok) {
                const data = await response.json(); // Asumiendo que devuelve JSON
                responseText += ` [OK: ${data.message || 'Ejecutado'}]`;
            } else {
                responseText += " [Error: Fallo en dispositivo]";
            }
        } catch (e) {
            console.warn("Error conectando al hardware:", e);
            responseText += " [Error: No se detecta hardware]";
        }
    } else {
        // Simulación
        await new Promise(r => setTimeout(r, 500)); // Simular delay
        if (cmd === 'led_on') responseText = "Luces encendidas. Entorno visible.";
        if (cmd === 'led_off') responseText = "Luces apagadas. Modo sigilo.";
        if (cmd === 'scan') responseText = "Escaneo completado. Sin anomalías detectadas.";
    }
    
    // Actualizar UI final
    qwenElement.innerHTML = `<strong>${TEXTS[LANG].qwen}</strong> ${responseText}`;
    
    // Hablar confirmación
    if ('speechSynthesis' in window) {
        const c = COLORS[LANG];
        const msg = new SpeechSynthesisUtterance(responseText);
        msg.lang = c.voice;
        speechSynthesis.speak(msg);
    }
    
    // Guardar en memoria
    chatHistory.push({ role: "system", content: `[HARDWARE] Ejecutado comando: ${cmd}. Resultado: ${responseText}` });
    saveMemory();
}

// === CONTROL DE JOYSTICK ===
let lastMoveCmd = '';
let moveInterval = null;

function initJoystickControl() {
    const joystick = new VirtualJoystick('joystick-zone', {
        color: '#00f3ff',
        size: 150,
        onMove: (pos) => handleJoystickMove(pos),
        onEnd: () => sendHardwareCommand('stop')
    });
}

function handleJoystickMove(pos) {
    // Convertir coordenadas X/Y a comandos direccionales simples
    // Threshold de 0.3 para evitar movimientos accidentales
    let cmd = '';
    
    if (pos.y > 0.5) cmd = 'move_forward';
    else if (pos.y < -0.5) cmd = 'move_back';
    else if (pos.x > 0.5) cmd = 'move_right';
    else if (pos.x < -0.5) cmd = 'move_left';
    
    // Solo enviar si cambia el comando y no es vacío
    if (cmd && cmd !== lastMoveCmd) {
        // Bloqueo de seguridad por colisión
        if (cmd === 'move_forward' && window.obstacleDetected) {
            console.warn("Movimiento bloqueado por obstáculo");
            return;
        }

        lastMoveCmd = cmd;
        sendHardwareCommand(cmd);
        
        // Repetir comando mientras se mantenga (para asegurar movimiento fluido en algunos hardwares)
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => {
            if (lastMoveCmd === cmd) sendHardwareCommand(cmd);
        }, 500);
    }
}

// === SENSORES Y TELEMETRÍA ===
window.obstacleDetected = false;

async function pollSensors() {
    if (!HW_CONFIG.ENABLED) return; // Solo si está activo

    try {
        const response = await fetch(`${HW_CONFIG.IP}/sensors`, { signal: AbortSignal.timeout(1000) });
        if (response.ok) {
            const data = await response.json();
            updateSensorUI(data.distance);
        }
    } catch (e) {
        // console.warn("Sensor offline");
    }
}

function updateSensorUI(distance) {
    const valEl = document.getElementById('distance-val');
    const barEl = document.getElementById('distance-bar');
    
    if (!valEl || !barEl) return;
    
    valEl.textContent = distance;
    
    // Normalizar barra (0 a 100cm)
    let percent = Math.min(100, (distance / 100) * 100);
    barEl.style.width = `${percent}%`;
    
    // Lógica de seguridad
    if (distance < 20) {
        barEl.style.background = '#ff0000'; // ROJO
        window.obstacleDetected = true;
        
        // Frenado de emergencia si estábamos avanzando
        if (lastMoveCmd === 'move_forward') {
            sendHardwareCommand('stop');
            lastMoveCmd = 'stop';
            fetchLocalAI("Obstáculo detectado. Frenando.");
            setEmotion('ALERTA');
        }
    } else if (distance < 50) {
        barEl.style.background = '#ffff00'; // AMARILLO
        window.obstacleDetected = false;
    } else {
        barEl.style.background = '#00ff00'; // VERDE
        window.obstacleDetected = false;
    }
}

async function uploadDocument() {
    const fileInput = document.getElementById('docUpload');
    const status = document.getElementById('uploadStatus');
    
    if (fileInput.files.length === 0) {
        status.innerText = "❌ Selecciona un archivo primero.";
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    status.innerText = "⏳ Subiendo...";
    
    try {
        const token = localStorage.getItem('nexa_token');
        const headers = {};
        if (token) headers['Authorization'] = token;

        const response = await fetch(`${API_URL}/upload_knowledge`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (response.ok) {
            status.innerText = "✅ Documento aprendido.";
            fileInput.value = "";
        } else {
            const errData = await response.json();
            status.innerText = "❌ " + (errData.error || "Error al subir.");
        }
    } catch (error) {
        status.innerText = "❌ Error de conexión.";
        console.error(error);
    }
}

// === SISTEMA DE AUTENTICACIÓN Y PAGOS ===
async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('auth-status');
    
    if (!email || !password) { status.innerText = "Faltan datos"; return; }
    
    status.innerText = "Registrando...";
    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (res.ok) {
            status.innerText = "✅ Registrado. Inicia sesión.";
        } else {
            status.innerText = "❌ " + data.error;
        }
    } catch (e) { status.innerText = "❌ Error red"; }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('auth-status');
    
    status.innerText = "Entrando...";
    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('nexa_token', data.token);
            localStorage.setItem('nexa_email', email);
            localStorage.setItem('nexa_plan', data.plan);
            updateAuthUI();
            status.innerText = "";
        } else {
            status.innerText = "❌ " + data.error;
        }
    } catch (e) { status.innerText = "❌ Error red"; }
}

function logout() {
    localStorage.removeItem('nexa_token');
    localStorage.removeItem('nexa_email');
    localStorage.removeItem('nexa_plan');
    updateAuthUI();
}

function updateAuthUI() {
    const token = localStorage.getItem('nexa_token');
    const email = localStorage.getItem('nexa_email');
    const plan = localStorage.getItem('nexa_plan');
    
    if (token) {
        document.getElementById('auth-forms').style.display = 'none';
        document.getElementById('user-profile').style.display = 'block';
        document.getElementById('user-email').innerText = email;
        document.getElementById('user-plan').innerText = plan.toUpperCase();
        
        if (plan === 'pro') {
            document.getElementById('upgrade-btn').style.display = 'none';
        } else {
            document.getElementById('upgrade-btn').style.display = 'inline-block';
        }
    } else {
        document.getElementById('auth-forms').style.display = 'block';
        document.getElementById('user-profile').style.display = 'none';
    }
}

async function upgradePro() {
    // Inicializar Stripe con tu clave pública
    // ⚠️ REEMPLAZA CON TU CLAVE PÚBLICA DE STRIPE
    const stripe = Stripe('pk_test_51P...'); 
    const status = document.getElementById('auth-status');
    status.innerText = "Iniciando pago...";
    
    try {
        const res = await fetch(`${API_URL}/api/create-checkout-session`, {
            method: 'POST',
        });
        const data = await res.json();
        if (data.id) {
            stripe.redirectToCheckout({ sessionId: data.id });
        } else {
            status.innerText = "❌ Error iniciando pago";
        }
    } catch (e) { status.innerText = "❌ Error red"; }
}

function setEmotion(emotion) {
    const particlesMaterial = particles ? particles.material : null;
    const logo3d = document.getElementById('logo-3d');
    
    // Cambios visuales según emoción
    switch(emotion) {
        case 'FELIZ':
            if(particlesMaterial) particlesMaterial.color.setHex(0x00ff00); // Verde
            if(logo3d) logo3d.style.filter = "drop-shadow(0 0 20px #00ff00)";
            break;
        case 'ALERTA':
            if(particlesMaterial) particlesMaterial.color.setHex(0xff0000); // Rojo
            if(logo3d) logo3d.style.filter = "drop-shadow(0 0 20px #ff0000)";
            break;
        case 'ANALIZANDO':
            if(particlesMaterial) particlesMaterial.color.setHex(0xffff00); // Amarillo
            if(logo3d) logo3d.style.filter = "drop-shadow(0 0 20px #ffff00)";
            break;
        case 'TRISTE':
            if(particlesMaterial) particlesMaterial.color.setHex(0x0000ff); // Azul
            if(logo3d) logo3d.style.filter = "drop-shadow(0 0 20px #0000ff)";
            break;
        case 'NEUTRO':
        default:
            if(particlesMaterial) particlesMaterial.color.setHex(0x00f3ff); // Cyan original
            if(logo3d) logo3d.style.filter = "drop-shadow(0 0 12px rgba(0,243,255,0.8))";
            break;
    }
}

// === INICIO === 
window.addEventListener('load', () => { 
  loadMemory(); 
  speechSynthesis.onvoiceschanged = initUI; 
  initUI(); 
  initNeuralField(); 
  initVoiceInterface(); 
  loadFaceModels(); // Cargar modelos de FaceID
  initJoystickControl(); // Iniciar Joystick
  
  // Polling de sensores cada 500ms
  setInterval(pollSensors, 500);

  if (chatHistory.length <= 1) {
      const greeting = `${getTimeBasedGreeting()}, ${userName}. Sistemas listos.`;
      fetchLocalAI(greeting); // Inicia conversación con saludo contextual
  } else {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.role === 'assistant') {
          document.getElementById('qwen-3d').innerHTML = `<strong>${TEXTS[LANG].qwen}</strong> ${lastMsg.content}`;
      }
  }
  
  simulateData(); 
  
  // === CICLO DE VIDA AUTÓNOMO (IDLE LOOP) ===
  setInterval(() => {
      // Si han pasado más de 45 segundos sin interacción, el robot "piensa"
      if (Date.now() - lastInteractionTime > 45000) {
          console.log("🤖 Robot en estado inactivo... generando pensamiento.");
          fetchLocalAI(null); // null triggers idle thought
      }
  }, 10000); // Check every 10s

  setTimeout(() => {
      // Efecto de carga inicial
      const overlay = document.getElementById('vision-overlay');
      if(overlay) {
          overlay.textContent = "NEXA OS V3.0 (ULTIMATE) - ONLINE";
          setTimeout(() => overlay.textContent = "", 3000);
      }
  }, 1000);
});

// === ACTUALIZACIÓN AUTOMÁTICA ===
const MANIFEST_URL = 'http://nexa-ai.dev/neuronex/manifest.json'; // URL DE PRODUCCIÓN
const CURRENT_VERSION = '2.0.0'; // ← ¡Actualiza esto en cada release! 

async function checkForUpdate() { 
  try { 
    // 1. Descargar manifiesto 
    const res = await fetch(MANIFEST_URL, { cache: 'no-cache' }); 
    if (!res.ok) throw new Error('Manifest no disponible'); 
     
    const manifest = await res.json(); 
     
    // 2. Verificar si hay nueva versión 
    if (manifest.version <= CURRENT_VERSION) return; 
     
    // 3. Verificar firma GPG (simulada aquí; en producción usa openpgp.js) 
    if (!verifySignature(manifest)) { 
      console.warn('⚠️ Actualización no firmada. Ignorando.'); 
      return; 
    } 
     
    // 4. Descargar y aplicar cambios 
    await applyUpdate(manifest); 
     
    // 5. Recargar suavemente 
    location.reload(); 
  } catch (err) { 
    console.log('🔄 Sin actualización disponible o offline.'); 
  } 
} 

function verifySignature(manifest) { 
  // En producción: usa openpgp.js para verificar manifest.signature 
  // Aquí simulamos verificación exitosa si hay versión 
  return manifest.version && manifest.files; 
} 

async function applyUpdate(manifest) { 
  const cache = caches.open('neuronex-v2'); 
  for (const [file, hash] of Object.entries(manifest.files)) { 
    const url = `http://nexa-ai.dev/neuronex/${file}`; 
    const res = await fetch(url); 
    if (res.ok) { 
      (await cache).put(file, res); 
      console.log(`✅ Actualizado: ${file}`); 
    } 
  } 
  localStorage.setItem('neuronex_version', manifest.version); 
} 

// Ejecutar al cargar (solo si hay conexión) 
if (navigator.onLine) { 
  setTimeout(checkForUpdate, 2000); // Espera 2s para no bloquear UI 
} 
