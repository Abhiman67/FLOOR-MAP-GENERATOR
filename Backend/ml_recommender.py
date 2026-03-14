"""
ML-Powered Floor Plan Recommendation Engine
Uses K-Nearest Neighbors with feature scaling for intelligent plan matching.
Replaces the rigid if/else filtering logic with a trained ML model.
"""

import numpy as np
import logging
from typing import List, Dict, Tuple, Optional
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import pickle
import os

logger = logging.getLogger(__name__)


class FloorPlanRecommender:
    """
    ML-based recommendation engine for floor plans.
    
    Uses KNN in normalized feature space so that square footage (range: 500-10000)
    doesn't overpower bedrooms (range: 1-10). StandardScaler ensures each feature
    contributes proportionally to the distance calculation.
    """

    def __init__(self):
        self.model: Optional[NearestNeighbors] = None
        self.scaler: Optional[StandardScaler] = None
        self.dataset: List[Dict] = []
        self.feature_matrix: Optional[np.ndarray] = None
        self.is_fitted = False
        self.model_path = os.path.join(os.path.dirname(__file__), "models")

    def fit(self, dataset: List[Dict]) -> None:
        """
        Train the KNN model on the floor plan dataset.

        Args:
            dataset: List of floor plan dicts with keys:
                     'sq_ft', 'bedrooms', 'bathrooms', 'garage', 'filename'
        """
        if not dataset:
            logger.error("Cannot fit model: empty dataset")
            return

        self.dataset = dataset

        # Extract numerical features
        features = []
        for plan in dataset:
            features.append([
                plan['sq_ft'],
                plan['bedrooms'],
                plan['bathrooms'],
                plan['garage']
            ])

        self.feature_matrix = np.array(features, dtype=np.float64)

        # Normalize features so sq_ft (500-10000) doesn't overpower beds (1-10)
        self.scaler = StandardScaler()
        scaled_features = self.scaler.fit_transform(self.feature_matrix)

        # Train KNN model
        # Using cosine distance works well for "preference similarity"
        # n_neighbors = min(20, len(dataset)) so we have enough candidates to rank
        n_neighbors = min(20, len(dataset))
        self.model = NearestNeighbors(
            n_neighbors=n_neighbors,
            metric='euclidean',
            algorithm='ball_tree'
        )
        self.model.fit(scaled_features)
        self.is_fitted = True

        logger.info(f"✅ ML Recommender fitted on {len(dataset)} floor plans "
                     f"(features: sq_ft, beds, baths, garage)")

    def recommend(
        self,
        sq_ft: int,
        bedrooms: int,
        bathrooms: int,
        garage: int,
        top_n: int = 6,
        vastu_min_score: int = 0,
        vastu_data: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Recommend floor plans based on user requirements using KNN.

        Args:
            sq_ft: Desired square footage
            bedrooms: Number of bedrooms
            bathrooms: Number of bathrooms
            garage: Number of garage spaces
            top_n: Number of results to return
            vastu_min_score: Minimum Vastu score filter (0 = no filter)
            vastu_data: Optional dict mapping filename -> vastu_score

        Returns:
            List of recommended plans with distances and match quality
        """
        if not self.is_fitted:
            logger.error("Model not fitted. Call fit() first.")
            return []

        # Create the user's requirement vector
        user_vector = np.array([[sq_ft, bedrooms, bathrooms, garage]], dtype=np.float64)

        # Scale using the same scaler that was fitted on the dataset
        user_scaled = self.scaler.transform(user_vector)

        # Find nearest neighbors
        distances, indices = self.model.kneighbors(user_scaled)

        # Build results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            plan = self.dataset[idx].copy()

            # Calculate match quality based on normalized distance
            # Lower distance = better match
            if dist < 0.5:
                match_quality = "excellent"
            elif dist < 1.0:
                match_quality = "good"
            elif dist < 2.0:
                match_quality = "fair"
            else:
                match_quality = "poor"

            plan['ml_distance'] = float(dist)
            plan['match_quality'] = match_quality
            plan['sq_ft_difference'] = abs(plan['sq_ft'] - sq_ft)

            # Apply Vastu filter if requested
            if vastu_min_score > 0 and vastu_data:
                plan_vastu = vastu_data.get(plan['filename'], 0)
                if plan_vastu < vastu_min_score:
                    continue

            results.append(plan)

            if len(results) >= top_n:
                break

        logger.info(
            f"🤖 ML Recommendation: {len(results)} results for "
            f"[{sq_ft} sqft, {bedrooms}br, {bathrooms}ba, {garage}gar] "
            f"(best distance: {results[0]['ml_distance']:.3f})" if results else
            f"🤖 ML Recommendation: No results found"
        )

        return results

    def get_similar_plans(
        self,
        filename: str,
        top_n: int = 6
    ) -> List[Dict]:
        """
        Find plans similar to a given plan (by filename).
        Useful for "Find Similar" feature.
        """
        if not self.is_fitted:
            return []

        # Find the reference plan in the dataset
        ref_idx = None
        for i, plan in enumerate(self.dataset):
            if plan['filename'] == filename:
                ref_idx = i
                break

        if ref_idx is None:
            logger.warning(f"Plan '{filename}' not found in dataset")
            return []

        # Get the reference plan's scaled features
        ref_scaled = self.scaler.transform(
            self.feature_matrix[ref_idx:ref_idx + 1]
        )

        distances, indices = self.model.kneighbors(ref_scaled)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == ref_idx:
                continue  # Skip the reference plan itself

            plan = self.dataset[idx].copy()
            plan['ml_distance'] = float(dist)
            plan['similarity'] = max(0, 1.0 - (dist / 5.0))  # Normalize to 0-1
            results.append(plan)

            if len(results) >= top_n:
                break

        return results

    def save_model(self, path: Optional[str] = None) -> None:
        """Save the trained model to disk."""
        save_path = path or self.model_path
        os.makedirs(save_path, exist_ok=True)

        model_file = os.path.join(save_path, "knn_model.pkl")
        with open(model_file, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler,
                'feature_matrix': self.feature_matrix
            }, f)

        logger.info(f"💾 Model saved to {model_file}")

    def load_model(self, path: Optional[str] = None) -> bool:
        """Load a previously trained model from disk."""
        load_path = path or self.model_path
        model_file = os.path.join(load_path, "knn_model.pkl")

        if not os.path.exists(model_file):
            return False

        try:
            with open(model_file, 'rb') as f:
                data = pickle.load(f)

            self.model = data['model']
            self.scaler = data['scaler']
            self.feature_matrix = data['feature_matrix']
            self.is_fitted = True

            logger.info(f"📂 Model loaded from {model_file}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False


# --- Singleton instance ---
_recommender = None


def get_recommender() -> FloorPlanRecommender:
    """Get or create the global recommender instance."""
    global _recommender
    if _recommender is None:
        _recommender = FloorPlanRecommender()
    return _recommender
