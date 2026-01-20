import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== ICONS ====================
const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const ImageGenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>);
const WebDevIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>);
const VideoIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>);
const BrainIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2"/><path d="M12 8a4 4 0 0 0-4 4c0 1.1.9 2 2 2"/><path d="M12 14a4 4 0 0 1 4 4c0 1.1-.9 2-2 2"/><path d="M12 22v-2"/><path d="M12 2v2"/></svg>);
const SendIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>);
const MicIcon = ({ active }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>);
const AttachIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>);
const PlusIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const MenuIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const SpeakerIcon = ({ muted }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{muted ? <><path d="M11 5 6 9H2v6h4l5 4V5Z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></> : <><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>}</svg>);
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>);
const HistoryIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>);
const SettingsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>);
const SidebarOpenIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>);
const SidebarCloseIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m16 9-3 3 3 3"/></svg>);

// ==================== NEXA LOGO ====================
const NexaLogo = ({ size = 40 }) => (
  <div className="nexa-logo" style={{ width: size, height: size }}>
    <div className="logo-inner">
      <span>N</span>
    </div>
  </div>
);

// ==================== FEATURE CARD ====================
const FeatureCard = ({ icon, title, onClick, active }) => (
  <button className={`feature-card ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="feature-icon">{icon}</div>
    <span className="feature-title">{title}</span>
  </button>
);

// ==================== MESSAGE COMPONENT ====================
const Message = ({ message, onSpeak }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="message-avatar">
          <NexaLogo size={32} />
        </div>
      )}
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        {!isUser && (
          <div className="message-actions">
            <button onClick={() => onSpeak(message.content)} className="action-btn" title="Escuchar">
              <SpeakerIcon muted={false} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeFeature, setActiveFeature] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize speech
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setSpeechSupported(true);
      synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.onresult = (event) => { setInputText(event.results[0][0].transcript); setIsListening(false); };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
      setRecognitionSupported(true);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const storedSessionId = localStorage.getItem('nexa_session_id');
      if (storedSessionId) { setSessionId(storedSessionId); await loadSession(storedSessionId); } else { await createNewSession(); }
      await loadSessions();
    };
    initSession();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadSessions = async () => { try { const response = await axios.get(`${API}/sessions`); setSessions(response.data.sessions || []); } catch (error) { console.error('Error:', error); } };
  const loadSession = async (sid) => { try { const response = await axios.get(`${API}/sessions/${sid}`); setMessages(response.data.messages || []); } catch (error) { await createNewSession(); } };
  
  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/sessions`);
      const newSessionId = response.data.session_id;
      setSessionId(newSessionId);
      localStorage.setItem('nexa_session_id', newSessionId);
      setMessages([]);
      setActiveFeature(null);
      await loadSessions();
      return newSessionId;
    } catch (error) {
      const fallbackId = `local-${Date.now()}`;
      setSessionId(fallbackId);
      localStorage.setItem('nexa_session_id', fallbackId);
      return fallbackId;
    }
  };

  const switchSession = async (sid) => { setSessionId(sid); localStorage.setItem('nexa_session_id', sid); await loadSession(sid); };
  const deleteSession = async (sid, e) => { e.stopPropagation(); try { await axios.delete(`${API}/sessions/${sid}`); if (sid === sessionId) await createNewSession(); await loadSessions(); } catch (error) { console.error('Error:', error); } };

  const speak = useCallback((text) => {
    if (!speechSupported || !voiceEnabled) return;
    synthRef.current.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/_/g, '').replace(/`/g, '').replace(/#{1,6}\s/g, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[\u{2600}-\u{26FF}]/gu, '').replace(/[\u{2700}-\u{27BF}]/gu, '').replace(/[\u{1F600}-\u{1F64F}]/gu, '').replace(/[\u{1F680}-\u{1F6FF}]/gu, '').replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES'; utterance.pitch = 1.0; utterance.rate = 1.0;
    const voices = synthRef.current.getVoices();
    const spanishVoice = voices.find(v => v.lang.includes('es'));
    if (spanishVoice) utterance.voice = spanishVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, [speechSupported, voiceEnabled]);

  const toggleListening = () => {
    if (!recognitionSupported) { alert('Reconocimiento de voz no soportado.'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); } else { try { recognitionRef.current.start(); setIsListening(true); } catch (error) { console.error('Error:', error); } }
  };

  const handleFeatureClick = (feature) => {
    setActiveFeature(activeFeature === feature ? null : feature);
    if (feature === 'image') setInputText('Genera una imagen de ');
    else if (feature === 'web') setInputText('Crea una pagina web sobre ');
    else if (feature === 'video') setInputText('Crea un guion de video sobre ');
    else if (feature === 'search') setInputText('Busca informacion sobre ');
    else if (feature === 'thinking') setInputText('');
    inputRef.current?.focus();
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: inputText.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);
    
    try {
      // Check if it's a special feature request
      let endpoint = `${API}/chat`;
      let payload = { message: currentInput, session_id: sessionId, include_history: true, creative_mode: activeFeature === 'thinking' };
      
      if (activeFeature === 'image' && currentInput.toLowerCase().includes('genera') && currentInput.toLowerCase().includes('imagen')) {
        endpoint = `${API}/generate/image`;
        payload = { prompt: currentInput.replace(/genera una imagen de/i, '').trim(), style: 'realistic' };
        const response = await axios.post(endpoint, payload);
        if (response.data.success && response.data.image_base64) {
          setMessages(prev => [...prev, { 
            id: `assistant-${Date.now()}`, role: 'assistant', 
            content: `He generado esta imagen para ti:\n\n![Imagen generada](data:image/png;base64,${response.data.image_base64})`, 
            timestamp: new Date().toISOString(),
            image: `data:image/png;base64,${response.data.image_base64}`
          }]);
        }
      } else if (activeFeature === 'web' && currentInput.toLowerCase().includes('crea') && currentInput.toLowerCase().includes('pagina')) {
        endpoint = `${API}/generate/website`;
        payload = { prompt: currentInput.replace(/crea una pagina web sobre/i, '').trim(), style: 'modern' };
        const response = await axios.post(endpoint, payload);
        if (response.data.success) {
          setMessages(prev => [...prev, { 
            id: `assistant-${Date.now()}`, role: 'assistant', 
            content: `He creado tu pagina web! Aqui esta el codigo:\n\n**HTML:**\n\`\`\`html\n${response.data.html}\n\`\`\`\n\n**CSS:**\n\`\`\`css\n${response.data.css}\n\`\`\``, 
            timestamp: new Date().toISOString()
          }]);
        }
      } else if (activeFeature === 'video' && currentInput.toLowerCase().includes('guion')) {
        endpoint = `${API}/generate/video-script`;
        payload = { prompt: currentInput.replace(/crea un guion de video sobre/i, '').trim(), duration: '1 minute' };
        const response = await axios.post(endpoint, payload);
        if (response.data.success) {
          setMessages(prev => [...prev, { 
            id: `assistant-${Date.now()}`, role: 'assistant', 
            content: response.data.script, 
            timestamp: new Date().toISOString()
          }]);
        }
      } else {
        const response = await axios.post(endpoint, payload);
        setMessages(prev => [...prev, { id: response.data.message_id || `assistant-${Date.now()}`, role: 'assistant', content: response.data.response, timestamp: new Date().toISOString() }]);
      }
      
      await loadSessions();
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: 'Error al procesar tu mensaje. Intenta de nuevo.', timestamp: new Date().toISOString() }]);
    } finally { 
      setIsLoading(false); 
      setActiveFeature(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: `[Archivo adjunto: ${file.name}]`, timestamp: new Date().toISOString() }]);
    e.target.value = '';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={createNewSession}>
            <PlusIcon />
            <span>Nueva conversacion</span>
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="sessions-section">
            <div className="section-title">
              <HistoryIcon />
              <span>Historial</span>
            </div>
            <div className="sessions-list">
              {sessions.slice(0, 20).map((session) => (
                <div
                  key={session.session_id}
                  className={`session-item ${session.session_id === sessionId ? 'active' : ''}`}
                  onClick={() => switchSession(session.session_id)}
                >
                  <span className="session-title">{session.title || 'Nueva conversacion'}</span>
                  <button className="delete-session-btn" onClick={(e) => deleteSession(session.session_id, e)}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button className="settings-btn">
            <SettingsIcon />
            <span>Configuracion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <button className="toggle-sidebar-btn" onClick={() => setShowSidebar(!showSidebar)}>
            <MenuIcon />
          </button>
          <div className="header-title">
            <NexaLogo size={32} />
            <span>NEXA</span>
          </div>
          <div className="header-actions">
            <button className={`voice-toggle ${voiceEnabled ? 'active' : ''}`} onClick={() => setVoiceEnabled(!voiceEnabled)}>
              <SpeakerIcon muted={!voiceEnabled} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <div className="welcome-content">
                <NexaLogo size={80} />
                <h1 className="welcome-title">Donde quieres empezar?</h1>
                
                <div className="features-grid">
                  <FeatureCard icon={<BrainIcon />} title="Pensamiento" onClick={() => handleFeatureClick('thinking')} active={activeFeature === 'thinking'} />
                  <FeatureCard icon={<SearchIcon />} title="Buscar" onClick={() => handleFeatureClick('search')} active={activeFeature === 'search'} />
                  <FeatureCard icon={<ImageGenIcon />} title="Crear Imagen" onClick={() => handleFeatureClick('image')} active={activeFeature === 'image'} />
                  <FeatureCard icon={<WebDevIcon />} title="Crear Web" onClick={() => handleFeatureClick('web')} active={activeFeature === 'web'} />
                  <FeatureCard icon={<VideoIcon />} title="Crear Video" onClick={() => handleFeatureClick('video')} active={activeFeature === 'video'} />
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((msg) => (
                <Message key={msg.id} message={msg} onSpeak={speak} />
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar"><NexaLogo size={32} /></div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          {messages.length > 0 && (
            <div className="quick-features">
              <button className={`quick-feature ${activeFeature === 'thinking' ? 'active' : ''}`} onClick={() => handleFeatureClick('thinking')}><BrainIcon /> Pensamiento</button>
              <button className={`quick-feature ${activeFeature === 'image' ? 'active' : ''}`} onClick={() => handleFeatureClick('image')}><ImageGenIcon /> Imagen</button>
              <button className={`quick-feature ${activeFeature === 'web' ? 'active' : ''}`} onClick={() => handleFeatureClick('web')}><WebDevIcon /> Web</button>
              <button className={`quick-feature ${activeFeature === 'video' ? 'active' : ''}`} onClick={() => handleFeatureClick('video')}><VideoIcon /> Video</button>
            </div>
          )}
          
          <form className="input-form" onSubmit={sendMessage}>
            <button type="button" className="input-action-btn" onClick={() => fileInputRef.current?.click()}>
              <AttachIcon />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="chat-input"
              disabled={isLoading}
            />
            
            <button type="button" className={`input-action-btn ${isListening ? 'recording' : ''}`} onClick={toggleListening}>
              <MicIcon active={isListening} />
            </button>
            
            <button type="submit" className="send-btn" disabled={!inputText.trim() || isLoading}>
              <SendIcon />
            </button>
          </form>
          
          <p className="input-hint">NEXA puede cometer errores. Verifica la informacion importante.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
