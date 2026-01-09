import os
try:
    import chromadb
except ImportError:
    chromadb = None

class SovereignRAG:
    def __init__(self):
        if chromadb:
            self.client = chromadb.Client()
            self.collection = self.client.get_or_create_collection("nexa_knowledge")
        else:
            self.client = None
            print("[⚠️] ChromaDB no instalado. RAG desactivado.")

    def ingest_text(self, text, metadata=None):
        if not self.client: return
        import uuid
        self.collection.add(
            documents=[text],
            metadatas=[metadata or {}],
            ids=[str(uuid.uuid4())]
        )

    def query(self, text, n_results=1):
        if not self.client: return []
        results = self.collection.query(
            query_texts=[text],
            n_results=n_results
        )
        return results['documents'][0] if results['documents'] else []

rag_system = SovereignRAG()
