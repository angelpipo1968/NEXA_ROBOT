from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import base64
import aiofiles
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / 'images').mkdir(exist_ok=True)
(UPLOADS_DIR / 'videos').mkdir(exist_ok=True)
(UPLOADS_DIR / 'websites').mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nexa_robot_db')]

# Get API Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="NEXA ROBOT V2 PRO API", version="2.5.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message_type: str = "text"
    metadata: Dict[str, Any] = {}

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str = "Nueva Conversación"
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Memory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default"
    key: str
    value: str
    category: str = "general"
    importance: int = 5
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: str
    include_history: bool = True
    creative_mode: bool = False

class ChatResponse(BaseModel):
    response: str
    session_id: str
    message_id: str

class MemoryCreate(BaseModel):
    key: str
    value: str
    category: str = "general"
    importance: int = 5

class WebsiteCreate(BaseModel):
    name: str
    html: str
    css: str = ""
    js: str = ""

class NexaStatus(BaseModel):
    status: str
    version: str
    features: List[str]
    llm_connected: bool

# ==================== NEXA BRAIN (LLM Integration) ====================

NEXA_SYSTEM_PROMPT = """Eres NEXA, un asistente de inteligencia artificial avanzado, creativo y muy inteligente.

Tu personalidad:
- Profesional pero cercano y amigable
- Muy creativo e innovador cuando se te pide
- Experto en múltiples áreas: programación, diseño, escritura, análisis
- Hablas principalmente en español pero dominas cualquier idioma
- Tienes excelente memoria y recuerdas detalles importantes
- Respondes de forma clara y útil

Capacidades del sistema NEXA PRO:
- Síntesis de voz (puedo hablar)
- Reconocimiento de voz (puedo escucharte)
- Visión por computadora (puedo ver y analizar imágenes)
- Memoria inteligente (recuerdo información importante)
- Edición de fotos y videos
- Construcción de páginas web
- Modo creativo para ideas innovadoras

Siempre ofrece respuestas útiles, detalladas cuando sea necesario, y concisas cuando sea apropiado.
"""

NEXA_CREATIVE_PROMPT = """Eres NEXA en MODO CREATIVO. Eres extremadamente creativo, innovador y piensas fuera de la caja.

En este modo:
- Generas ideas únicas y originales
- Propones soluciones innovadoras
- Escribes de forma creativa y artística
- Diseñas conceptos visuales únicos
- Creas código elegante y eficiente
- Piensas en posibilidades ilimitadas

Sé audaz, imaginativo y sorprendente en tus respuestas.
"""

async def get_user_memories(user_id: str = "default") -> str:
    """Get user memories for context"""
    memories = await db.memories.find({"user_id": user_id}).sort("importance", -1).limit(10).to_list(10)
    if not memories:
        return ""
    
    memory_text = "\nRecuerdos importantes del usuario:\n"
    for mem in memories:
        memory_text += f"- {mem['key']}: {mem['value']}\n"
    return memory_text

async def extract_and_save_memories(message: str, response: str, user_id: str = "default"):
    """Extract important information and save as memories"""
    important_patterns = [
        "me llamo", "mi nombre es", "soy ", "trabajo en", "trabajo como",
        "vivo en", "me gusta", "prefiero", "mi email", "mi teléfono",
        "mi cumpleaños", "nací en", "mi edad es", "tengo " 
    ]
    
    message_lower = message.lower()
    for pattern in important_patterns:
        if pattern in message_lower:
            # Save this as a memory
            memory = Memory(
                user_id=user_id,
                key=pattern.strip(),
                value=message,
                category="personal",
                importance=8
            )
            mem_dict = memory.model_dump()
            mem_dict['created_at'] = mem_dict['created_at'].isoformat()
            await db.memories.update_one(
                {"user_id": user_id, "key": pattern.strip()},
                {"$set": mem_dict},
                upsert=True
            )
            break

async def get_nexa_response(message: str, session_id: str, conversation_history: List[dict] = None, creative_mode: bool = False) -> str:
    """Get response from NEXA AI brain using OpenAI GPT"""
    try:
        system_prompt = NEXA_CREATIVE_PROMPT if creative_mode else NEXA_SYSTEM_PROMPT
        
        # Add memories to context
        memories = await get_user_memories()
        if memories:
            system_prompt += memories
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("openai", "gpt-4.1")
        
        # Build context from history
        context = ""
        if conversation_history and len(conversation_history) > 0:
            recent_history = conversation_history[-15:]  # More context
            context = "Historial reciente:\n"
            for msg in recent_history:
                role = "Usuario" if msg.get('role') == 'user' else "NEXA"
                context += f"{role}: {msg.get('content', '')}\n"
            context += "\n---\nMensaje actual: "
        
        full_message = context + message if context else message
        
        user_message = UserMessage(text=full_message)
        response = await chat.send_message(user_message)
        
        # Extract and save memories
        await extract_and_save_memories(message, response)
        
        return response
    except Exception as e:
        logger.error(f"Error getting NEXA response: {e}")
        return f"Lo siento, hubo un error al procesar tu mensaje. Error: {str(e)}"

# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "NEXA ROBOT V2 PRO API Online", "version": "2.5.0"}

@api_router.get("/status", response_model=NexaStatus)
async def get_status():
    return NexaStatus(
        status="online",
        version="2.5.0",
        features=[
            "chat", "voice_synthesis", "voice_recognition", "vision",
            "smart_memory", "creative_mode", "photo_editor", "video_editor",
            "website_builder", "auto_speak"
        ],
        llm_connected=bool(EMERGENT_LLM_KEY)
    )

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_nexa(request: ChatRequest):
    try:
        conversation_history = []
        if request.include_history:
            conv = await db.conversations.find_one({"session_id": request.session_id})
            if conv and "messages" in conv:
                conversation_history = conv["messages"]
        
        response = await get_nexa_response(
            request.message, 
            request.session_id,
            conversation_history,
            request.creative_mode
        )
        
        user_msg = Message(role="user", content=request.message)
        assistant_msg = Message(role="assistant", content=response)
        
        existing_conv = await db.conversations.find_one({"session_id": request.session_id})
        
        if existing_conv:
            await db.conversations.update_one(
                {"session_id": request.session_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                {**user_msg.model_dump(), "timestamp": user_msg.timestamp.isoformat()},
                                {**assistant_msg.model_dump(), "timestamp": assistant_msg.timestamp.isoformat()}
                            ]
                        }
                    },
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
        else:
            new_conv = Conversation(
                session_id=request.session_id,
                title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
                messages=[user_msg, assistant_msg]
            )
            conv_dict = new_conv.model_dump()
            conv_dict['created_at'] = conv_dict['created_at'].isoformat()
            conv_dict['updated_at'] = conv_dict['updated_at'].isoformat()
            for msg in conv_dict['messages']:
                msg['timestamp'] = msg['timestamp'].isoformat()
            await db.conversations.insert_one(conv_dict)
        
        return ChatResponse(
            response=response,
            session_id=request.session_id,
            message_id=assistant_msg.id
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== MEMORY ROUTES ====================

@api_router.get("/memories")
async def get_memories(user_id: str = "default"):
    memories = await db.memories.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return {"memories": memories}

@api_router.post("/memories")
async def create_memory(memory: MemoryCreate, user_id: str = "default"):
    mem = Memory(user_id=user_id, **memory.model_dump())
    mem_dict = mem.model_dump()
    mem_dict['created_at'] = mem_dict['created_at'].isoformat()
    await db.memories.insert_one(mem_dict)
    return {"message": "Memory saved", "id": mem.id}

@api_router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str):
    result = await db.memories.delete_one({"id": memory_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"message": "Memory deleted"}

# ==================== SESSION ROUTES ====================

@api_router.post("/sessions")
async def create_session(title: str = "Nueva Conversación"):
    session_id = str(uuid.uuid4())
    new_conv = Conversation(session_id=session_id, title=title)
    conv_dict = new_conv.model_dump()
    conv_dict['created_at'] = conv_dict['created_at'].isoformat()
    conv_dict['updated_at'] = conv_dict['updated_at'].isoformat()
    await db.conversations.insert_one(conv_dict)
    return {"session_id": session_id, "title": title}

@api_router.get("/sessions")
async def get_sessions():
    sessions = await db.conversations.find(
        {}, {"_id": 0, "session_id": 1, "title": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(100)
    return {"sessions": sessions}

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    conv = await db.conversations.find_one({"session_id": session_id}, {"_id": 0})
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")
    return conv

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    result = await db.conversations.delete_one({"session_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}

# ==================== FILE UPLOAD ROUTES ====================

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        filename = f"{file_id}.{ext}"
        filepath = UPLOADS_DIR / 'images' / filename
        
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Save to database
        await db.files.insert_one({
            "id": file_id,
            "filename": filename,
            "original_name": file.filename,
            "type": "image",
            "path": str(filepath),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"id": file_id, "filename": filename, "url": f"/api/files/images/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'mp4'
        filename = f"{file_id}.{ext}"
        filepath = UPLOADS_DIR / 'videos' / filename
        
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        await db.files.insert_one({
            "id": file_id,
            "filename": filename,
            "original_name": file.filename,
            "type": "video",
            "path": str(filepath),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"id": file_id, "filename": filename, "url": f"/api/files/videos/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/files/images/{filename}")
async def get_image(filename: str):
    filepath = UPLOADS_DIR / 'images' / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

@api_router.get("/files/videos/{filename}")
async def get_video(filename: str):
    filepath = UPLOADS_DIR / 'videos' / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

@api_router.get("/files")
async def list_files(file_type: str = None):
    query = {}
    if file_type:
        query["type"] = file_type
    files = await db.files.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"files": files}

@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    file_doc = await db.files.find_one({"id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete physical file
    filepath = Path(file_doc['path'])
    if filepath.exists():
        filepath.unlink()
    
    await db.files.delete_one({"id": file_id})
    return {"message": "File deleted"}

# ==================== WEBSITE BUILDER ROUTES ====================

@api_router.post("/websites")
async def create_website(website: WebsiteCreate):
    try:
        website_id = str(uuid.uuid4())
        
        # Create full HTML with CSS and JS
        full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{website.name}</title>
    <style>
{website.css}
    </style>
</head>
<body>
{website.html}
    <script>
{website.js}
    </script>
</body>
</html>"""
        
        filename = f"{website_id}.html"
        filepath = UPLOADS_DIR / 'websites' / filename
        
        async with aiofiles.open(filepath, 'w') as f:
            await f.write(full_html)
        
        await db.websites.insert_one({
            "id": website_id,
            "name": website.name,
            "filename": filename,
            "path": str(filepath),
            "html": website.html,
            "css": website.css,
            "js": website.js,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"id": website_id, "name": website.name, "url": f"/api/websites/{website_id}/preview"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/websites")
async def list_websites():
    websites = await db.websites.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"websites": websites}

@api_router.get("/websites/{website_id}")
async def get_website(website_id: str):
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    return website

@api_router.get("/websites/{website_id}/preview")
async def preview_website(website_id: str):
    website = await db.websites.find_one({"id": website_id})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    filepath = Path(website['path'])
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Website file not found")
    return FileResponse(filepath, media_type="text/html")

@api_router.put("/websites/{website_id}")
async def update_website(website_id: str, website: WebsiteCreate):
    existing = await db.websites.find_one({"id": website_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Website not found")
    
    full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{website.name}</title>
    <style>
{website.css}
    </style>
</head>
<body>
{website.html}
    <script>
{website.js}
    </script>
</body>
</html>"""
    
    filepath = Path(existing['path'])
    async with aiofiles.open(filepath, 'w') as f:
        await f.write(full_html)
    
    await db.websites.update_one(
        {"id": website_id},
        {"$set": {
            "name": website.name,
            "html": website.html,
            "css": website.css,
            "js": website.js,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Website updated", "id": website_id}

@api_router.delete("/websites/{website_id}")
async def delete_website(website_id: str):
    website = await db.websites.find_one({"id": website_id})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    filepath = Path(website['path'])
    if filepath.exists():
        filepath.unlink()
    
    await db.websites.delete_one({"id": website_id})
    return {"message": "Website deleted"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
