"""
Semantic Search Engine for Floor Plans
Uses sentence transformers for text-to-image and image-to-image search
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class SemanticSearchEngine:
    """
    Semantic search using embeddings for natural language queries
    Enables: "Show me a cozy 3-bedroom house with a large kitchen"
    """
    
    def __init__(self):
        self.model = None
        self.embeddings_cache = {}
        self.initialized = False
        
    def initialize(self):
        """Lazy initialization of the embedding model"""
        if self.initialized:
            return
        
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("🔧 Loading sentence transformer model...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.initialized = True
            logger.info("✅ Semantic search engine initialized")
        except ImportError:
            logger.warning("⚠️  sentence-transformers not installed. Semantic search disabled.")
            logger.warning("   Install with: pip install sentence-transformers")
            self.initialized = False
        except Exception as e:
            logger.error(f"❌ Failed to initialize semantic search: {e}")
            self.initialized = False
    
    def is_available(self) -> bool:
        """Check if semantic search is available"""
        return self.initialized
    
    def encode_text(self, text: str) -> Optional[np.ndarray]:
        """Convert text to embedding vector"""
        if not self.initialized:
            self.initialize()
        
        if not self.initialized:
            return None
        
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            logger.error(f"Failed to encode text: {e}")
            return None
    
    def encode_floor_plan_features(self, plan: Dict) -> Optional[np.ndarray]:
        """
        Generate embedding from floor plan features
        Creates a natural language description and encodes it
        """
        if not self.initialized:
            self.initialize()
        
        if not self.initialized:
            return None
        
        # Create rich textual description
        description_parts = []
        
        # Basic features
        description_parts.append(f"{plan['sq_ft']} square feet")
        description_parts.append(f"{plan['bedrooms']} bedroom")
        description_parts.append(f"{plan['bathrooms']} bathroom")
        
        if plan.get('garages', 0) > 0:
            description_parts.append(f"{plan['garages']} car garage")
        
        # Style
        if plan.get('style'):
            description_parts.append(f"{plan['style']} style")
        
        # Stories
        if plan.get('stories', 1) > 1:
            description_parts.append(f"{plan['stories']} story")
        else:
            description_parts.append("single story")
        
        # Special features
        if plan.get('has_basement'):
            description_parts.append("with basement")
        if plan.get('has_pool'):
            description_parts.append("with pool")
        if plan.get('has_patio'):
            description_parts.append("with patio")
        
        # Tags
        if plan.get('tags'):
            import json
            try:
                tags = json.loads(plan['tags']) if isinstance(plan['tags'], str) else plan['tags']
                description_parts.extend(tags)
            except:
                pass
        
        # Vastu information
        vastu_score = plan.get('vastu_score', 0)
        if vastu_score >= 85:
            description_parts.append("excellent vastu compliance")
        elif vastu_score >= 70:
            description_parts.append("good vastu compliance")
        
        # Combine into natural sentence
        description = "floor plan: " + ", ".join(description_parts)
        
        return self.encode_text(description)
    
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    def search_by_text(
        self, 
        query: str, 
        plans: List[Dict], 
        top_k: int = 10
    ) -> List[Tuple[Dict, float]]:
        """
        Semantic search using natural language query
        
        Examples:
        - "cozy 3 bedroom house with modern kitchen"
        - "spacious family home with good vastu"
        - "compact 2 bedroom with garage"
        """
        if not self.initialized:
            self.initialize()
        
        if not self.initialized:
            logger.warning("Semantic search not available, returning empty results")
            return []
        
        # Encode query
        query_embedding = self.encode_text(query)
        if query_embedding is None:
            return []
        
        results = []
        
        for plan in plans:
            # Get or generate plan embedding
            plan_embedding = None
            
            # Try to use cached/stored embedding
            if 'embedding' in plan and plan['embedding']:
                try:
                    if isinstance(plan['embedding'], bytes):
                        plan_embedding = np.frombuffer(plan['embedding'], dtype=np.float32)
                    else:
                        plan_embedding = np.array(plan['embedding'])
                except:
                    pass
            
            # Generate embedding if not available
            if plan_embedding is None:
                plan_embedding = self.encode_floor_plan_features(plan)
            
            if plan_embedding is not None:
                similarity = self.cosine_similarity(query_embedding, plan_embedding)
                results.append((plan, similarity))
        
        # Sort by similarity (highest first)
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results[:top_k]
    
    def find_similar(
        self, 
        reference_plan: Dict, 
        all_plans: List[Dict], 
        top_k: int = 6
    ) -> List[Tuple[Dict, float]]:
        """
        Find similar floor plans to a reference plan
        Enables "Find Similar" feature
        """
        if not self.initialized:
            self.initialize()
        
        if not self.initialized:
            return []
        
        # Get reference embedding
        ref_embedding = None
        if 'embedding' in reference_plan and reference_plan['embedding']:
            try:
                if isinstance(reference_plan['embedding'], bytes):
                    ref_embedding = np.frombuffer(reference_plan['embedding'], dtype=np.float32)
                else:
                    ref_embedding = np.array(reference_plan['embedding'])
            except:
                pass
        
        if ref_embedding is None:
            ref_embedding = self.encode_floor_plan_features(reference_plan)
        
        if ref_embedding is None:
            return []
        
        results = []
        ref_filename = reference_plan.get('filename')
        
        for plan in all_plans:
            # Skip the reference plan itself
            if plan.get('filename') == ref_filename:
                continue
            
            # Get plan embedding
            plan_embedding = None
            if 'embedding' in plan and plan['embedding']:
                try:
                    if isinstance(plan['embedding'], bytes):
                        plan_embedding = np.frombuffer(plan['embedding'], dtype=np.float32)
                    else:
                        plan_embedding = np.array(plan['embedding'])
                except:
                    pass
            
            if plan_embedding is None:
                plan_embedding = self.encode_floor_plan_features(plan)
            
            if plan_embedding is not None:
                similarity = self.cosine_similarity(ref_embedding, plan_embedding)
                results.append((plan, similarity))
        
        # Sort by similarity
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results[:top_k]
    
    def enhance_search_results(
        self,
        query: str,
        basic_results: List[Dict],
        boost_factor: float = 0.3
    ) -> List[Dict]:
        """
        Re-rank basic search results using semantic similarity
        Combines traditional filtering with semantic understanding
        """
        if not self.initialized or not query:
            return basic_results
        
        # Get semantic scores
        semantic_results = self.search_by_text(query, basic_results, len(basic_results))
        
        if not semantic_results:
            return basic_results
        
        # Create lookup for semantic scores
        semantic_scores = {
            plan['filename']: score 
            for plan, score in semantic_results
        }
        
        # Boost scores
        enhanced = []
        for plan in basic_results:
            plan_copy = dict(plan)
            sem_score = semantic_scores.get(plan['filename'], 0)
            
            # Add semantic score to plan metadata
            plan_copy['semantic_score'] = sem_score
            enhanced.append(plan_copy)
        
        # Sort by semantic score
        enhanced.sort(key=lambda x: x.get('semantic_score', 0), reverse=True)
        
        return enhanced


# Initialize global instance
_search_engine = None

def get_search_engine() -> SemanticSearchEngine:
    """Get or create the global search engine instance"""
    global _search_engine
    if _search_engine is None:
        _search_engine = SemanticSearchEngine()
    return _search_engine
