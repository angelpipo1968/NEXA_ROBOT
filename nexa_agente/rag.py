import os
import uuid
import logging

# Configuración de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NEXA_RAG")

try:
    import chromadb
    from chromadb.config import Settings
except ImportError:
    chromadb = None

class SovereignRAG:
    def __init__(self, persistence_path="nexa_knowledge_db"):
        self.enabled = False
        if chromadb:
            try:
                # Usar cliente persistente para guardar datos entre reinicios
                self.client = chromadb.PersistentClient(path=persistence_path)
                self.collection = self.client.get_or_create_collection(name="nexa_knowledge")
                self.enabled = True
                logger.info(f"[🧠] Sistema RAG inicializado en: {persistence_path}")
            except Exception as e:
                logger.error(f"[❌] Error iniciando ChromaDB: {e}")
                self.client = None
        else:
            logger.warning("[⚠️] ChromaDB no instalado. RAG desactivado.")

    def ingest_text(self, text, source="unknown"):
        """Ingesta un texto crudo en la base de datos vectorial."""
        if not self.enabled: return False

        # Dividir texto en chunks (simple)
        chunks = self._split_text(text)
        
        ids = [str(uuid.uuid4()) for _ in chunks]
        metadatas = [{"source": source, "chunk_index": i} for i in range(len(chunks))]

        try:
            self.collection.add(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"[📥] Ingestados {len(chunks)} fragmentos de: {source}")
            return True
        except Exception as e:
            logger.error(f"[❌] Error ingestando texto: {e}")
            return False

    def ingest_file(self, file_path):
        """Lee e ingesta un archivo de texto."""
        if not os.path.exists(file_path):
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            return self.ingest_text(content, source=os.path.basename(file_path))
        except Exception as e:
            logger.error(f"[❌] Error leyendo archivo {file_path}: {e}")
            return False

    def query(self, query_text, n_results=3):
        """Busca información relevante para la consulta."""
        if not self.enabled: return []

        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results
            )
            
            # Formatear resultados
            documents = results['documents'][0] if results['documents'] else []
            metadatas = results['metadatas'][0] if results['metadatas'] else []
            
            knowledge = []
            for doc, meta in zip(documents, metadatas):
                knowledge.append({
                    "content": doc,
                    "source": meta.get("source", "unknown")
                })
            
            return knowledge
        except Exception as e:
            logger.error(f"[❌] Error consultando RAG: {e}")
            return []

    def _split_text(self, text, chunk_size=500, overlap=50):
        """Divide el texto en fragmentos solapados."""
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunks.append(text[i:i + chunk_size])
        return chunks

# Instancia Global
rag_system = SovereignRAG()
