"""
Embedding Service - For vector search and similarity
"""
import numpy as np
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import json

from app.core.config import settings


class EmbeddingService:
    """Service for generating embeddings and vector search"""
    
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Lazy load the embedding model"""
        try:
            self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        except Exception as e:
            print(f"Error loading embedding model: {e}")
            self.model = None
    
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a text"""
        if not self.model:
            return None
        
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts"""
        if not self.model:
            return [None] * len(texts)
        
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            return [None] * len(texts)
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))

