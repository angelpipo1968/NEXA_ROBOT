import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== ICONS ====================
const MicIcon = ({ active }) => (
  <svg className={`w-6 h-6 ${active ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const VolumeIcon = ({ muted }) => (
  <svg className={`w-6 h-6 ${muted ? 'text-gray-500' : 'text-cyan-400'}`} fill="currentColor" viewBox="0 0 24 24">
    {muted ? (
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    ) : (
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    )}
  </svg>
);

const SendIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const ImageIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);

// ==================== NEXA AVATAR ====================
const NexaAvatar = ({ speaking, thinking }) => (
  <div className={`nexa-avatar ${speaking ? 'speaking' : ''} ${thinking ? 'thinking' : ''}`}>
    <div className="avatar-ring"></div>
    <div className="avatar-core">
      <div className="avatar-face">
        <div className="eye left"></div>
        <div className="eye right"></div>
        <div className={`mouth ${speaking ? 'speaking' : ''}`}></div>
      </div>
    </div>
    <div className="avatar-glow"></div>
  </div>
);

// ==================== MESSAGE COMPONENT ====================
const MessageBubble = ({ message, onSpeak }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`message-container ${isUser ? 'user' : 'assistant'}`} data-testid={`message-${message.id}`}>
      {!isUser && (
        <div className="message-avatar">
          <div className="mini-avatar">
            <span>N</span>
          </div>
        </div>
      )}
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <p className="message-text">{message.content}</p>
        <div className="message-footer">
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && (
            <button 
              onClick={() => onSpeak(message.content)}
              className="speak-btn"
              title="Escuchar mensaje"
              data-testid="speak-message-btn"
            >
              🔊
            </button>
          )}
        </div>
      </div>
      {isUser && (
        <div className="message-avatar user-avatar">
          <span>👤</span>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN APP ====================
function App() {
  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [nexaStatus, setNexaStatus] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setSpeechSupported(true);
      
      // Load voices (some browsers need this event)
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      };
      
      // Load voices immediately and on change
      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      setRecognitionSupported(true);
    }
  }, []);

  // Check NEXA status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API}/status`);
        setNexaStatus(response.data);
      } catch (error) {
        console.error('Error checking NEXA status:', error);
      }
    };
    checkStatus();
  }, []);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const storedSessionId = localStorage.getItem('nexa_session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
        await loadSession(storedSessionId);
      } else {
        await createNewSession();
      }
      await loadSessions();
    };
    initSession();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sessions list
  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // Load specific session
  const loadSession = async (sid) => {
    try {
      const response = await axios.get(`${API}/sessions/${sid}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading session:', error);
      await createNewSession();
    }
  };

  // Create new session
  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/sessions`, { title: 'Nueva Conversación' });
      const newSessionId = response.data.session_id;
      setSessionId(newSessionId);
      localStorage.setItem('nexa_session_id', newSessionId);
      setMessages([]);
      await loadSessions();
      return newSessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      const fallbackId = `local-${Date.now()}`;
      setSessionId(fallbackId);
      localStorage.setItem('nexa_session_id', fallbackId);
      return fallbackId;
    }
  };

  // Switch session
  const switchSession = async (sid) => {
    setSessionId(sid);
    localStorage.setItem('nexa_session_id', sid);
    await loadSession(sid);
    setShowSidebar(false);
  };

  // Delete session
  const deleteSession = async (sid, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/sessions/${sid}`);
      if (sid === sessionId) {
        await createNewSession();
      }
      await loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Text-to-speech
  const speak = useCallback((text) => {
    if (!speechSupported || !voiceEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Clean text: remove asterisks, markdown formatting and emojis
    const cleanText = text
      .replace(/\*\*/g, '')  // Remove double asterisks
      .replace(/\*/g, '')    // Remove single asterisks
      .replace(/_/g, '')     // Remove underscores
      .replace(/`/g, '')     // Remove backticks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emoticons
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport symbols
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove flags
      .replace(/\s+/g, ' ')  // Clean multiple spaces
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    
    // Try to find a Spanish FEMALE voice
    const voices = synthRef.current.getVoices();
    console.log('All voices:', voices.map(v => v.name + ' - ' + v.lang));
    
    // Female voice names in Spanish (common across browsers)
    const femaleNames = [
      'mónica', 'monica', 'paulina', 'helena', 'elvira', 'conchita', 
      'lucia', 'lucía', 'penelope', 'penélope', 'lupe', 'rosa', 
      'female', 'mujer', 'woman', 'google español', 'microsoft helena',
      'microsoft sabina', 'microsoft laura', 'cortana', 'siri female'
    ];
    
    // Find Spanish female voice
    let selectedVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return lang.includes('es') && femaleNames.some(fn => name.includes(fn));
    });
    
    // If no specific female voice, try any voice with "es" that's not obviously male
    if (!selectedVoice) {
      const maleNames = ['jorge', 'diego', 'carlos', 'pablo', 'male', 'hombre', 'man'];
      selectedVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return lang.includes('es') && !maleNames.some(mn => name.includes(mn));
      });
    }
    
    // Last fallback: any Spanish voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('es'));
    }
    
    // Original voice settings
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Selected voice:', selectedVoice.name);
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [speechSupported, voiceEnabled]);

  // Speech-to-text
  const toggleListening = () => {
    if (!recognitionSupported) {
      alert('El reconocimiento de voz no está soportado en este navegador.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage.content,
        session_id: sessionId,
        include_history: true
      });
      
      const assistantMessage = {
        id: response.data.message_id || `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak response if voice is enabled
      if (voiceEnabled) {
        speak(response.data.response);
      }
      
      await loadSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result.split(',')[1];
      
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `[Imagen enviada: ${file.name}]`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      try {
        const response = await axios.post(`${API}/vision`, {
          image_base64: base64,
          prompt: 'Describe esta imagen en detalle.',
          session_id: sessionId
        });
        
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.analysis,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (voiceEnabled) {
          speak(response.data.analysis);
        }
      } catch (error) {
        console.error('Error analyzing image:', error);
        const errorMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Lo siento, hubo un error al analizar la imagen.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="nexa-app" data-testid="nexa-app">
      {/* Sidebar */}
      <div className={`sidebar ${showSidebar ? 'open' : ''}`} data-testid="sidebar">
        <div className="sidebar-header">
          <h2>💬 Conversaciones</h2>
          <button 
            onClick={() => createNewSession()}
            className="new-chat-btn"
            data-testid="new-chat-btn"
          >
            <PlusIcon /> Nueva
          </button>
        </div>
        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className={`session-item ${session.session_id === sessionId ? 'active' : ''}`}
              onClick={() => switchSession(session.session_id)}
              data-testid={`session-${session.session_id}`}
            >
              <span className="session-title">{session.title || 'Sin título'}</span>
              <button
                onClick={(e) => deleteSession(session.session_id, e)}
                className="delete-btn"
                data-testid={`delete-session-${session.session_id}`}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="nexa-header" data-testid="nexa-header">
          <button 
            className="menu-btn"
            onClick={() => setShowSidebar(!showSidebar)}
            data-testid="menu-btn"
          >
            <MenuIcon />
          </button>
          <div className="header-center">
            <NexaAvatar speaking={isSpeaking} thinking={isLoading} />
            <div className="header-info">
              <h1>NEXA ROBOT V2</h1>
              <div className="status-indicators">
                <span className={`status-dot ${nexaStatus?.llm_connected ? 'online' : 'offline'}`}></span>
                <span className="status-text">
                  {nexaStatus?.status === 'online' ? 'En línea' : 'Conectando...'}
                </span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`icon-btn ${voiceEnabled ? 'active' : ''}`}
              title={voiceEnabled ? 'Desactivar voz' : 'Activar voz'}
              data-testid="toggle-voice-btn"
            >
              <VolumeIcon muted={!voiceEnabled} />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="messages-container" data-testid="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-avatar">
                <NexaAvatar speaking={false} thinking={false} />
              </div>
              <h2>¡Hola! Soy NEXA 👋</h2>
              <p>Tu asistente de inteligencia artificial todo-en-uno</p>
              <div className="features-grid">
                <div className="feature-card">
                  <span className="feature-icon">🗣️</span>
                  <span>Síntesis de Voz</span>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">🎤</span>
                  <span>Reconocimiento de Voz</span>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">👁️</span>
                  <span>Análisis de Imágenes</span>
                </div>
                <div className="feature-card">
                  <span className="feature-icon">💾</span>
                  <span>Memoria Persistente</span>
                </div>
              </div>
              <p className="start-hint">Escribe un mensaje o usa el micrófono para comenzar</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onSpeak={speak}
                />
              ))}
              {isLoading && (
                <div className="message-container assistant">
                  <div className="message-avatar">
                    <div className="mini-avatar thinking">
                      <span>N</span>
                    </div>
                  </div>
                  <div className="message-bubble assistant-bubble typing">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-container" data-testid="input-container">
          <form onSubmit={sendMessage} className="input-form">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="icon-btn"
              title="Enviar imagen"
              data-testid="upload-image-btn"
            >
              <ImageIcon />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje o usa el micrófono..."
              className="message-input"
              disabled={isLoading}
              data-testid="message-input"
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`icon-btn ${isListening ? 'recording' : ''}`}
              title={isListening ? 'Detener grabación' : 'Iniciar grabación'}
              data-testid="mic-btn"
            >
              <MicIcon active={isListening} />
            </button>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="send-btn"
              data-testid="send-btn"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>

      {/* Overlay for sidebar on mobile */}
      {showSidebar && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setShowSidebar(false)}
          data-testid="sidebar-overlay"
        />
      )}
    </div>
  );
}

export default App;
