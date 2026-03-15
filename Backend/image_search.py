"""
Reverse Image Search for Floor Plans
Uses Multimodal CLIP embeddings to find similar structural floor plans
based on an uploaded sketch or photo.
"""

import os
import torch
import logging
import numpy as np
from PIL import Image
from typing import List, Dict, Optional
from sklearn.metrics.pairwise import cosine_similarity
import pickle

# By default sentence-transformers handles CLIP multimodal models
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class ImageSearchEngine:
    def __init__(self):
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        if torch.cuda.is_available(): self.device = "cuda"
            
        self.model = None
        # We use a standard CLIP model to start. In production, this would be 
        # the model fine-tuned in Colab (finetune_colab.py)
        self.model_name = "clip-ViT-B-32"
        self.is_initialized = False
        
        self.embeddings_path = os.path.join(os.path.dirname(__file__), "models", "image_embeddings.pkl")
        self.embeddings = None
        self.filenames = None

    def initialize(self):
        """Lazy load the CLIP model."""
        if not self.is_initialized:
            logger.info(f"Loading CLIP Vision Model: {self.model_name}...")
            self.model = SentenceTransformer(self.model_name, device=self.device)
            self._load_vector_db()
            self.is_initialized = True
            logger.info("✅ CLIP Vision Model loaded successfully")

    def _load_vector_db(self):
        """Load pre-computed image embeddings."""
        if os.path.exists(self.embeddings_path):
            with open(self.embeddings_path, 'rb') as f:
                data = pickle.load(f)
                self.embeddings = data['embeddings']
                self.filenames = data['filenames']
            logger.info(f"Loaded {len(self.filenames)} image embeddings into memory")
        else:
            logger.warning("Image embeddings database not found. Call build_index() first.")

    def search_by_image(self, query_image: Image.Image, top_k: int = 6) -> List[Dict]:
        """
        Find the most structurally similar floor plans to the uploaded image.
        Uses pure mathematical Cosine Similarity on the latent pixel features.
        """
        self.initialize()
        
        if self.embeddings is None or len(self.embeddings) == 0:
            logger.error("No image embeddings available to search against.")
            return []
            
        logger.info(f"🔍 Reverse Image Search initiated")
        
        # 1. Encode the user's uploaded image into a high-dimensional vector
        query_embedding = self.model.encode(query_image)
        
        # 2. Reshape for scikit-learn
        query_embedding = query_embedding.reshape(1, -1)
        dataset_embeddings = np.array(self.embeddings)
        
        # 3. Calculate Cosine Similarity across the entire dataset instantly
        similarities = cosine_similarity(query_embedding, dataset_embeddings)[0]
        
        # 4. Get Top K results
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for rank, idx in enumerate(top_indices):
            score = float(similarities[idx])
            filename = self.filenames[idx]
            
            # Match quality heuristic based on CLIP similarities
            if score > 0.85: match_quality = "excellent"
            elif score > 0.70: match_quality = "good" 
            elif score > 0.50: match_quality = "fair"
            else: match_quality = "poor"
            
            results.append({
                "filename": filename,
                "image_url": f"http://127.0.0.1:5000/image/{filename}",
                "metadata": {
                    "similarity_score": round(score, 3),
                    "match_quality": match_quality,
                    "search_type": "reverse-image",
                    "rank": rank + 1
                }
            })
            
        logger.info(f"✅ Found {len(results)} matches (Best score: {results[0]['metadata']['similarity_score']})")
        return results

    def build_index(self, image_dir: str):
        """
        Utility to pre-compute embeddings for the entire dataset.
        Run this once to build the vector index.
        """
        self.initialize()
        logger.info(f"Building Image Vector Index from {image_dir}...")
        
        filenames = []
        images = []
        
        for file in os.listdir(image_dir):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                try:
                    path = os.path.join(image_dir, file)
                    img = Image.open(path).convert('RGB')
                    images.append(img)
                    filenames.append(file)
                except Exception as e:
                    logger.warning(f"Failed to read {file}: {e}")
                    
        if not images:
            logger.error("No images found to index.")
            return
            
        logger.info(f"Encoding {len(images)} images (this may take a while)...")
        # Encode in batches to save RAM
        embeddings = self.model.encode(images, batch_size=32, show_progress_bar=True)
        
        os.makedirs(os.path.dirname(self.embeddings_path), exist_ok=True)
        with open(self.embeddings_path, 'wb') as f:
            pickle.dump({
                'embeddings': embeddings,
                'filenames': filenames
            }, f)
            
        self.embeddings = embeddings
        self.filenames = filenames
        logger.info(f"✅ Successfully built and saved Vector DB with {len(filenames)} images")

# --- Singleton ---
_image_search_engine = None

def get_image_search_engine() -> ImageSearchEngine:
    global _image_search_engine
    if _image_search_engine is None:
        _image_search_engine = ImageSearchEngine()
    return _image_search_engine
