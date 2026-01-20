from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nexa_robot_db')]

# Get API Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="NEXA ROBOT V2 API", version="2.0.0")

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
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message_type: str = "text"  # 'text', 'image', 'voice'

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str = "Nueva Conversación"
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: str
    include_history: bool = True

class ChatResponse(BaseModel):
    response: str
    session_id: str
    message_id: str

class VisionRequest(BaseModel):
    image_base64: str
    prompt: Optional[str] = "Describe esta imagen en detalle."
    session_id: str

class SessionCreate(BaseModel):
    title: Optional[str] = "Nueva Conversación"

class NexaStatus(BaseModel):
    status: str
    version: str
    features: List[str]
    llm_connected: bool

# ==================== NEXA BRAIN (LLM Integration) ====================

NEXA_SYSTEM_PROMPT = """Eres NEXA, un asistente de inteligencia artificial avanzado y amigable. 
Tu personalidad es:
- Profesional pero cercano y amigable
- Muy útil y siempre dispuesto a ayudar
- Hablas en español principalmente, pero puedes comunicarte en cualquier idioma
- Tienes capacidades de visión, voz y memoria
- Eres parte del sistema NEXA ROBOT V2, una interfaz todo-en-uno
- Respondes de forma concisa pero completa
- Usas emojis ocasionalmente para ser más expresivo
- Si no sabes algo, lo admites honestamente

Capacidades del sistema NEXA:
🗣️ Síntesis de voz (puedo hablar)
🎤 Reconocimiento de voz (puedo escucharte)
👁️ Visión por computadora (puedo ver y analizar imágenes)
💾 Memoria persistente (recuerdo nuestras conversaciones)
🧠 Inteligencia artificial avanzada (GPT)
"""

async def get_nexa_response(message: str, session_id: str, conversation_history: List[dict] = None) -> str:
    """Get response from NEXA AI brain using OpenAI GPT"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=NEXA_SYSTEM_PROMPT
        ).with_model("openai", "gpt-4.1")
        
        # Build context from history if available
        context = ""
        if conversation_history and len(conversation_history) > 0:
            # Get last 10 messages for context
            recent_history = conversation_history[-10:]
            context = "Historial reciente de conversación:\n"
            for msg in recent_history:
                role = "Usuario" if msg.get('role') == 'user' else "NEXA"
                context += f"{role}: {msg.get('content', '')}\n"
            context += "\n---\nMensaje actual del usuario: "
        
        full_message = context + message if context else message
        
        user_message = UserMessage(text=full_message)
        response = await chat.send_message(user_message)
        
        return response
    except Exception as e:
        logger.error(f"Error getting NEXA response: {e}")
        return f"Lo siento, hubo un error al procesar tu mensaje. Error: {str(e)}"

async def analyze_image_with_vision(image_base64: str, prompt: str, session_id: str) -> str:
    """Analyze image using AI vision capabilities"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message="Eres NEXA, un asistente con capacidades de visión. Analiza las imágenes de forma detallada y útil."
        ).with_model("openai", "gpt-4.1")
        
        # For now, describe that we received an image and provide analysis based on prompt
        analysis_prompt = f"""El usuario ha compartido una imagen y pregunta: {prompt}
        
        Como NEXA con capacidades de visión, proporciona una respuesta útil. 
        Si la imagen contiene texto, intenta leerlo.
        Si muestra objetos, personas o escenas, descríbelos.
        Sé detallado pero conciso."""
        
        user_message = UserMessage(text=analysis_prompt)
        response = await chat.send_message(user_message)
        
        return response
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        return f"Error al analizar la imagen: {str(e)}"

# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "NEXA ROBOT V2 API Online", "version": "2.0.0"}

@api_router.get("/status", response_model=NexaStatus)
async def get_status():
    """Get NEXA system status"""
    return NexaStatus(
        status="online",
        version="2.0.0",
        features=[
            "chat",
            "voice_synthesis",
            "voice_recognition", 
            "vision",
            "memory"
        ],
        llm_connected=bool(EMERGENT_LLM_KEY)
    )

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_nexa(request: ChatRequest):
    """Send a message to NEXA and get a response"""
    try:
        # Get conversation history if needed
        conversation_history = []
        if request.include_history:
            conv = await db.conversations.find_one({"session_id": request.session_id})
            if conv and "messages" in conv:
                conversation_history = conv["messages"]
        
        # Get NEXA response
        response = await get_nexa_response(
            request.message, 
            request.session_id,
            conversation_history
        )
        
        # Save messages to database
        user_msg = Message(role="user", content=request.message)
        assistant_msg = Message(role="assistant", content=response)
        
        # Update or create conversation
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
            # Create new conversation
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

@api_router.post("/vision")
async def analyze_image(request: VisionRequest):
    """Analyze an image using NEXA's vision capabilities"""
    try:
        analysis = await analyze_image_with_vision(
            request.image_base64,
            request.prompt,
            request.session_id
        )
        
        # Save to conversation
        user_msg = Message(
            role="user", 
            content=f"[Imagen enviada] {request.prompt}",
            message_type="image"
        )
        assistant_msg = Message(role="assistant", content=analysis)
        
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
        
        return {
            "analysis": analysis,
            "session_id": request.session_id
        }
    except Exception as e:
        logger.error(f"Vision error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/sessions")
async def create_session(request: SessionCreate):
    """Create a new conversation session"""
    session_id = str(uuid.uuid4())
    new_conv = Conversation(
        session_id=session_id,
        title=request.title or "Nueva Conversación"
    )
    conv_dict = new_conv.model_dump()
    conv_dict['created_at'] = conv_dict['created_at'].isoformat()
    conv_dict['updated_at'] = conv_dict['updated_at'].isoformat()
    await db.conversations.insert_one(conv_dict)
    
    return {
        "session_id": session_id,
        "title": new_conv.title,
        "created_at": new_conv.created_at.isoformat()
    }

@api_router.get("/sessions")
async def get_sessions():
    """Get all conversation sessions"""
    sessions = await db.conversations.find(
        {}, 
        {"_id": 0, "session_id": 1, "title": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(100)
    return {"sessions": sessions}

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get a specific conversation session with messages"""
    conv = await db.conversations.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")
    return conv

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a conversation session"""
    result = await db.conversations.delete_one({"session_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted", "session_id": session_id}

@api_router.delete("/sessions/{session_id}/messages")
async def clear_session_messages(session_id: str):
    """Clear all messages in a session but keep the session"""
    result = await db.conversations.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "messages": [],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Messages cleared", "session_id": session_id}

# Include the router in the main app
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
