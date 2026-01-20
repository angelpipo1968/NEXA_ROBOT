import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== ICONS ====================
const MicIcon = ({ active }) => (
  <svg className={`w-6 h-6 ${active ? 'text-red-500 animate-pulse' : ''}`} fill="currentColor" viewBox="0 0 24 24">
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

const SendIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>);
const ImageIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>);
const VideoIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>);
const WebIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>);
const BrainIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>);
const TrashIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>);
const PlusIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>);
const MenuIcon = () => (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>);
const SparkleIcon = () => (<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>);
const AutoIcon = ({ active }) => (<svg className={`w-5 h-5 ${active ? 'text-green-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>);

// ==================== NEXA AVATAR ====================
const NexaAvatar = ({ speaking, thinking, size = 'normal' }) => (
  <div className={`nexa-avatar ${speaking ? 'speaking' : ''} ${thinking ? 'thinking' : ''} ${size}`}>
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
    <div className={`message-container ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && <div className="message-avatar"><div className="mini-avatar"><span>N</span></div></div>}
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <p className="message-text">{message.content}</p>
        <div className="message-footer">
          <span className="message-time">{new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && <button onClick={() => onSpeak(message.content)} className="speak-btn">🔊</button>}
        </div>
      </div>
      {isUser && <div className="message-avatar user-avatar"><span>👤</span></div>}
    </div>
  );
};

// ==================== CHAT TAB ====================
const ChatTab = ({ messages, isLoading, inputText, setInputText, sendMessage, speak, isListening, toggleListening, fileInputRef, handleImageUpload, creativeMode, setCreativeMode, autoSpeak, setAutoSpeak, messagesEndRef }) => (
  <div className="tab-content chat-tab">
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="welcome-screen">
          <div className="welcome-avatar"><NexaAvatar speaking={false} thinking={false} size="large" /></div>
          <h2>¡Hola! Soy NEXA PRO</h2>
          <p>Tu asistente de IA todo-en-uno con generacion de contenido</p>
          <div className="features-grid">
            <div className="feature-card"><span className="feature-icon">🗣️</span><span>Voz</span></div>
            <div className="feature-card"><span className="feature-icon">🖼️</span><span>Crea Imagenes</span></div>
            <div className="feature-card"><span className="feature-icon">🌐</span><span>Crea Webs</span></div>
            <div className="feature-card"><span className="feature-icon">🎬</span><span>Crea Videos</span></div>
          </div>
        </div>
      ) : (
        <>{messages.map((msg) => <MessageBubble key={msg.id} message={msg} onSpeak={speak} />)}
          {isLoading && <div className="message-container assistant"><div className="message-avatar"><div className="mini-avatar thinking"><span>N</span></div></div><div className="message-bubble assistant-bubble typing"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
    <div className="chat-options">
      <button className={`option-btn ${creativeMode ? 'active' : ''}`} onClick={() => setCreativeMode(!creativeMode)}><BrainIcon /> Creativo</button>
      <button className={`option-btn ${autoSpeak ? 'active' : ''}`} onClick={() => setAutoSpeak(!autoSpeak)}><AutoIcon active={autoSpeak} /> Auto Voz</button>
    </div>
    <div className="input-container">
      <form onSubmit={sendMessage} className="input-form">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn"><ImageIcon /></button>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Escribe tu mensaje..." className="message-input" disabled={isLoading} />
        <button type="button" onClick={toggleListening} className={`icon-btn ${isListening ? 'recording' : ''}`}><MicIcon active={isListening} /></button>
        <button type="submit" disabled={!inputText.trim() || isLoading} className="send-btn"><SendIcon /></button>
      </form>
    </div>
  </div>
);

// ==================== AI IMAGE GENERATOR TAB ====================
const AIImageTab = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const response = await axios.post(`${API}/generate/image`, { prompt, style });
      if (response.data.success) {
        const imageData = `data:image/png;base64,${response.data.image_base64}`;
        setGeneratedImage(imageData);
        setHistory(prev => [{ prompt, style, image: imageData, timestamp: new Date() }, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generando imagen. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `nexa-ai-image-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  return (
    <div className="tab-content ai-generator-tab">
      <div className="generator-header">
        <h2>🖼️ Generador de Imagenes con IA</h2>
        <p>Describe la imagen que quieres crear</p>
      </div>
      
      <div className="generator-input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un gato astronauta en la luna, arte digital, colores vibrantes..."
          className="prompt-textarea"
          rows={3}
        />
        <div className="generator-options">
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="style-select">
            <option value="realistic">Realista</option>
            <option value="artistic">Artistico</option>
            <option value="cartoon">Cartoon</option>
            <option value="3d render">3D Render</option>
            <option value="watercolor">Acuarela</option>
            <option value="oil painting">Pintura al oleo</option>
            <option value="digital art">Arte Digital</option>
            <option value="anime">Anime</option>
          </select>
          <button onClick={generateImage} disabled={isGenerating || !prompt.trim()} className="generate-btn">
            {isGenerating ? '⏳ Generando...' : '✨ Generar Imagen'}
          </button>
        </div>
      </div>

      <div className="generator-result">
        {isGenerating && (
          <div className="generating-placeholder">
            <div className="spinner"></div>
            <p>Creando tu imagen con IA...</p>
            <p className="small-text">Esto puede tomar hasta 1 minuto</p>
          </div>
        )}
        {generatedImage && !isGenerating && (
          <div className="result-container">
            <img src={generatedImage} alt="Generated" className="generated-image" />
            <button onClick={downloadImage} className="action-btn success">📥 Descargar</button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <h3>Historial</h3>
          <div className="history-grid">
            {history.map((item, idx) => (
              <div key={idx} className="history-item" onClick={() => setGeneratedImage(item.image)}>
                <img src={item.image} alt={item.prompt} />
                <span>{item.prompt.slice(0, 30)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== AI WEBSITE BUILDER TAB ====================
const AIWebsiteTab = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern');
  const [websites, setWebsites] = useState([]);
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const [name, setName] = useState('Mi Pagina Web');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('html');

  useEffect(() => { loadWebsites(); }, []);

  const loadWebsites = async () => {
    try {
      const response = await axios.get(`${API}/websites`);
      setWebsites(response.data.websites || []);
    } catch (error) {
      console.error('Error loading websites:', error);
    }
  };

  const generateWithAI = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/generate/website`, { prompt, style });
      if (response.data.success) {
        setHtml(response.data.html);
        setCss(response.data.css);
        setJs(response.data.js);
        setName(prompt.slice(0, 30));
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error generating website:', error);
      alert('Error generando pagina web.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveWebsite = async () => {
    try {
      if (currentWebsite) {
        await axios.put(`${API}/websites/${currentWebsite.id}`, { name, html, css, js });
      } else {
        await axios.post(`${API}/websites`, { name, html, css, js });
      }
      loadWebsites();
      alert('Pagina guardada!');
    } catch (error) {
      console.error('Error saving website:', error);
    }
  };

  const loadWebsite = (website) => {
    setCurrentWebsite(website);
    setName(website.name);
    setHtml(website.html);
    setCss(website.css);
    setJs(website.js);
  };

  const newWebsite = () => {
    setCurrentWebsite(null);
    setName('Mi Pagina Web');
    setHtml('');
    setCss('');
    setJs('');
    setPrompt('');
  };

  const deleteWebsite = async (id) => {
    try {
      await axios.delete(`${API}/websites/${id}`);
      loadWebsites();
      if (currentWebsite?.id === id) newWebsite();
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  };

  const previewHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;

  return (
    <div className="tab-content builder-tab">
      <div className="builder-sidebar">
        <div className="sidebar-section">
          <h3>🤖 Generar con IA</h3>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe tu pagina web..." className="ai-prompt-input" rows={3} />
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="style-select-small">
            <option value="modern">Moderno</option>
            <option value="minimalist">Minimalista</option>
            <option value="colorful">Colorido</option>
            <option value="dark">Oscuro</option>
            <option value="corporate">Corporativo</option>
            <option value="creative">Creativo</option>
          </select>
          <button onClick={generateWithAI} disabled={isGenerating || !prompt.trim()} className="ai-generate-btn">
            {isGenerating ? '⏳ Generando...' : '✨ Crear con IA'}
          </button>
        </div>
        <div className="sidebar-section">
          <div className="section-header"><h3>Mis Paginas</h3><button onClick={newWebsite} className="icon-btn-small"><PlusIcon /></button></div>
          <div className="websites-list">
            {websites.map((w) => (
              <div key={w.id} className={`website-item ${currentWebsite?.id === w.id ? 'active' : ''}`}>
                <span onClick={() => loadWebsite(w)}>{w.name}</span>
                <button onClick={() => deleteWebsite(w.id)} className="delete-btn-small"><TrashIcon /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="builder-main">
        <div className="builder-header">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="website-name-input" placeholder="Nombre" />
          <div className="builder-actions">
            <button onClick={() => setShowPreview(!showPreview)} className="action-btn">{showPreview ? '✏️ Editar' : '👁️ Vista Previa'}</button>
            <button onClick={saveWebsite} className="action-btn primary">💾 Guardar</button>
          </div>
        </div>
        
        {showPreview ? (
          <div className="preview-frame"><iframe srcDoc={previewHtml} title="Preview" className="website-preview" /></div>
        ) : (
          <div className="code-editor">
            <div className="code-tabs">
              <button className={`code-tab ${activeCodeTab === 'html' ? 'active' : ''}`} onClick={() => setActiveCodeTab('html')}>HTML</button>
              <button className={`code-tab ${activeCodeTab === 'css' ? 'active' : ''}`} onClick={() => setActiveCodeTab('css')}>CSS</button>
              <button className={`code-tab ${activeCodeTab === 'js' ? 'active' : ''}`} onClick={() => setActiveCodeTab('js')}>JS</button>
            </div>
            <div className="code-area">
              {activeCodeTab === 'html' && <textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder="HTML..." />}
              {activeCodeTab === 'css' && <textarea value={css} onChange={(e) => setCss(e.target.value)} placeholder="CSS..." />}
              {activeCodeTab === 'js' && <textarea value={js} onChange={(e) => setJs(e.target.value)} placeholder="JavaScript..." />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== AI VIDEO CREATOR TAB ====================
const AIVideoTab = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('30 seconds');
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedScripts, setSavedScripts] = useState([]);

  const generateScript = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/generate/video-script`, { prompt, duration });
      if (response.data.success) {
        setScript(response.data.script);
        setSavedScripts(prev => [{ prompt, duration, script: response.data.script, timestamp: new Date() }, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Error generating script:', error);
      alert('Error generando guion.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    alert('Guion copiado!');
  };

  return (
    <div className="tab-content ai-generator-tab">
      <div className="generator-header">
        <h2>🎬 Creador de Videos con IA</h2>
        <p>Genera guiones y storyboards para tus videos</p>
      </div>
      
      <div className="generator-input-section">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ej: Un video tutorial sobre como hacer cafe, con tips profesionales..." className="prompt-textarea" rows={3} />
        <div className="generator-options">
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="style-select">
            <option value="15 seconds">15 segundos (Reel/TikTok)</option>
            <option value="30 seconds">30 segundos (Short)</option>
            <option value="1 minute">1 minuto</option>
            <option value="3 minutes">3 minutos</option>
            <option value="5 minutes">5 minutos</option>
            <option value="10 minutes">10 minutos</option>
          </select>
          <button onClick={generateScript} disabled={isGenerating || !prompt.trim()} className="generate-btn">
            {isGenerating ? '⏳ Creando guion...' : '🎬 Generar Guion'}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="generating-placeholder">
          <div className="spinner"></div>
          <p>Creando tu guion de video...</p>
        </div>
      )}

      {script && !isGenerating && (
        <div className="script-result">
          <div className="script-header">
            <h3>📝 Tu Guion</h3>
            <button onClick={copyScript} className="action-btn">📋 Copiar</button>
          </div>
          <div className="script-content">
            <pre>{script}</pre>
          </div>
        </div>
      )}

      {savedScripts.length > 0 && (
        <div className="history-section">
          <h3>Guiones Anteriores</h3>
          <div className="scripts-list">
            {savedScripts.map((item, idx) => (
              <div key={idx} className="script-item" onClick={() => setScript(item.script)}>
                <span className="script-title">{item.prompt.slice(0, 40)}...</span>
                <span className="script-duration">{item.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== PHOTO EDITOR TAB ====================
const PhotoEditorTab = () => {
  const [image, setImage] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageLoad = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetFilters = () => { setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); setRotation(0); };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.download = 'nexa-edited-image.png';
    link.href = image;
    link.click();
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
    transform: `rotate(${rotation}deg)`
  };

  return (
    <div className="tab-content editor-tab">
      <div className="editor-header">
        <h2>📷 Editor de Fotos</h2>
        <div className="editor-actions">
          <button onClick={() => fileInputRef.current?.click()} className="action-btn primary">Subir Foto</button>
          <button onClick={resetFilters} className="action-btn">Resetear</button>
          <button onClick={downloadImage} className="action-btn success" disabled={!image}>Descargar</button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageLoad} accept="image/*" className="hidden" />
      </div>
      <div className="editor-workspace">
        <div className="preview-area">
          {image ? <img src={image} alt="Preview" style={filterStyle} className="preview-image" /> : <div className="placeholder"><ImageIcon /><p>Sube una imagen</p></div>}
        </div>
        <div className="controls-panel">
          <div className="control-group"><label>Brillo: {brightness}%</label><input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(e.target.value)} /></div>
          <div className="control-group"><label>Contraste: {contrast}%</label><input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(e.target.value)} /></div>
          <div className="control-group"><label>Saturacion: {saturation}%</label><input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(e.target.value)} /></div>
          <div className="control-group"><label>Desenfoque: {blur}px</label><input type="range" min="0" max="20" value={blur} onChange={(e) => setBlur(e.target.value)} /></div>
          <div className="control-group"><label>Rotacion: {rotation}°</label><input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
};

// ==================== MEMORY TAB ====================
const MemoryTab = () => {
  const [memories, setMemories] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => { loadMemories(); }, []);

  const loadMemories = async () => {
    try {
      const response = await axios.get(`${API}/memories`);
      setMemories(response.data.memories || []);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const addMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    try {
      await axios.post(`${API}/memories?key=${encodeURIComponent(newKey)}&value=${encodeURIComponent(newValue)}`);
      setNewKey(''); setNewValue('');
      loadMemories();
    } catch (error) {
      console.error('Error adding memory:', error);
    }
  };

  const deleteMemory = async (id) => {
    try {
      await axios.delete(`${API}/memories/${id}`);
      loadMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  return (
    <div className="tab-content memory-tab">
      <div className="memory-header"><h2>🧠 Memoria de NEXA</h2><p>NEXA recuerda informacion importante</p></div>
      <div className="add-memory">
        <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Tipo (ej: mi nombre)" className="memory-input" />
        <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Valor (ej: Juan)" className="memory-input" />
        <button onClick={addMemory} className="action-btn primary">Agregar</button>
      </div>
      <div className="memories-list">
        {memories.length === 0 ? <p className="empty-text">No hay memorias guardadas.</p> : memories.map((mem) => (
          <div key={mem.id} className="memory-item">
            <div className="memory-content"><strong>{mem.key}:</strong> {mem.value}</div>
            <button onClick={() => deleteMemory(mem.id)} className="delete-btn-small"><TrashIcon /></button>
          </div>
        ))}
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
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [creativeMode, setCreativeMode] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [nexaStatus, setNexaStatus] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const fileInputRef = useRef(null);

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
    const checkStatus = async () => {
      try { const response = await axios.get(`${API}/status`); setNexaStatus(response.data); } catch (error) { console.error('Error:', error); }
    };
    checkStatus();
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
      await loadSessions();
      return newSessionId;
    } catch (error) {
      const fallbackId = `local-${Date.now()}`;
      setSessionId(fallbackId);
      localStorage.setItem('nexa_session_id', fallbackId);
      return fallbackId;
    }
  };

  const switchSession = async (sid) => { setSessionId(sid); localStorage.setItem('nexa_session_id', sid); await loadSession(sid); setShowSidebar(false); };
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

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const userMessage = { id: `user-${Date.now()}`, role: 'user', content: inputText.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/chat`, { message: userMessage.content, session_id: sessionId, include_history: true, creative_mode: creativeMode });
      const assistantMessage = { id: response.data.message_id || `assistant-${Date.now()}`, role: 'assistant', content: response.data.response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);
      if (autoSpeak) speak(response.data.response);
      await loadSessions();
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: 'Error al procesar tu mensaje.', timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: `[Imagen: ${file.name}]`, timestamp: new Date().toISOString() }]);
    setIsLoading(true);
    try {
      const formData = new FormData(); formData.append('file', file);
      await axios.post(`${API}/upload/image`, formData);
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: 'Imagen recibida.', timestamp: new Date().toISOString() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: 'Error al subir imagen.', timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
    e.target.value = '';
  };

  return (
    <div className="nexa-app">
      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header"><h2>💬 Chats</h2><button onClick={() => createNewSession()} className="new-chat-btn"><PlusIcon /> Nueva</button></div>
        <div className="sessions-list">
          {sessions.map((session) => (
            <div key={session.session_id} className={`session-item ${session.session_id === sessionId ? 'active' : ''}`} onClick={() => switchSession(session.session_id)}>
              <span className="session-title">{session.title || 'Sin titulo'}</span>
              <button onClick={(e) => deleteSession(session.session_id, e)} className="delete-btn"><TrashIcon /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <header className="nexa-header">
          <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}><MenuIcon /></button>
          <div className="header-center">
            <NexaAvatar speaking={isSpeaking} thinking={isLoading} />
            <div className="header-info"><h1>NEXA PRO</h1><div className="status-indicators"><span className={`status-dot ${nexaStatus?.llm_connected ? 'online' : 'offline'}`}></span><span className="status-text">{nexaStatus?.status === 'online' ? 'En linea' : 'Conectando...'}</span></div></div>
          </div>
          <div className="header-actions"><button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`icon-btn ${voiceEnabled ? 'active' : ''}`}><VolumeIcon muted={!voiceEnabled} /></button></div>
        </header>

        <div className="tab-nav">
          <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat</button>
          <button className={`tab-btn ${activeTab === 'ai-image' ? 'active' : ''}`} onClick={() => setActiveTab('ai-image')}>🖼️ Crear Imagen</button>
          <button className={`tab-btn ${activeTab === 'ai-web' ? 'active' : ''}`} onClick={() => setActiveTab('ai-web')}>🌐 Crear Web</button>
          <button className={`tab-btn ${activeTab === 'ai-video' ? 'active' : ''}`} onClick={() => setActiveTab('ai-video')}>🎬 Crear Video</button>
          <button className={`tab-btn ${activeTab === 'photo' ? 'active' : ''}`} onClick={() => setActiveTab('photo')}>📷 Editar Foto</button>
          <button className={`tab-btn ${activeTab === 'memory' ? 'active' : ''}`} onClick={() => setActiveTab('memory')}>🧠 Memoria</button>
        </div>

        {activeTab === 'chat' && <ChatTab messages={messages} isLoading={isLoading} inputText={inputText} setInputText={setInputText} sendMessage={sendMessage} speak={speak} isListening={isListening} toggleListening={toggleListening} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} creativeMode={creativeMode} setCreativeMode={setCreativeMode} autoSpeak={autoSpeak} setAutoSpeak={setAutoSpeak} messagesEndRef={messagesEndRef} />}
        {activeTab === 'ai-image' && <AIImageTab />}
        {activeTab === 'ai-web' && <AIWebsiteTab />}
        {activeTab === 'ai-video' && <AIVideoTab />}
        {activeTab === 'photo' && <PhotoEditorTab />}
        {activeTab === 'memory' && <MemoryTab />}
      </div>

      {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />}
    </div>
  );
}

export default App;
