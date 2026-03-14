"""
Vastu Shastra Compliance Analyzer for Floor Plans
Analyzes floor plans based on traditional Vastu principles
"""

from typing import Dict, List, Tuple
from enum import Enum

class Direction(Enum):
    """Cardinal and intercardinal directions"""
    NORTH = "North"
    SOUTH = "South"
    EAST = "East"
    WEST = "West"
    NORTHEAST = "Northeast"
    NORTHWEST = "Northwest"
    SOUTHEAST = "Southeast"
    SOUTHWEST = "Southwest"
    CENTER = "Center"

class VastuRules:
    """
    Traditional Vastu Shastra principles for residential buildings
    Based on ancient Indian architectural science
    """
    
    # Ideal room placements by direction
    ROOM_PLACEMENTS = {
        Direction.NORTHEAST: {
            "ideal": ["Puja Room", "Study", "Safe/Locker"],
            "acceptable": ["Bedroom", "Living Room"],
            "avoid": ["Kitchen", "Toilet", "Staircase"],
            "importance": "Most auspicious - Water element zone"
        },
        Direction.EAST: {
            "ideal": ["Living Room", "Balcony", "Main Entrance"],
            "acceptable": ["Bedroom", "Study"],
            "avoid": ["Toilet", "Kitchen"],
            "importance": "Sunrise direction - Positive energy"
        },
        Direction.SOUTHEAST: {
            "ideal": ["Kitchen"],
            "acceptable": ["Electrical Room"],
            "avoid": ["Bedroom", "Puja Room", "Main Entrance"],
            "importance": "Fire element zone (Agni)"
        },
        Direction.SOUTH: {
            "ideal": ["Storage", "Heavy Furniture"],
            "acceptable": ["Bedroom"],
            "avoid": ["Main Entrance", "Kitchen"],
            "importance": "Yama direction - Use cautiously"
        },
        Direction.SOUTHWEST: {
            "ideal": ["Master Bedroom", "Heavy Storage"],
            "acceptable": ["Guest Room"],
            "avoid": ["Kitchen", "Toilet", "Main Entrance"],
            "importance": "Most stable - Earth element"
        },
        Direction.WEST: {
            "ideal": ["Children's Room", "Study", "Dining"],
            "acceptable": ["Bedroom", "Living Room"],
            "avoid": ["Main Entrance", "Toilet"],
            "importance": "Varun direction"
        },
        Direction.NORTHWEST: {
            "ideal": ["Guest Room", "Garage", "Cattle"],
            "acceptable": ["Storage"],
            "avoid": ["Master Bedroom", "Puja Room", "Kitchen"],
            "importance": "Air element - Movement zone"
        },
        Direction.NORTH: {
            "ideal": ["Living Room", "Cash Counter", "Safe"],
            "acceptable": ["Bedroom", "Balcony"],
            "avoid": ["Toilet", "Heavy Storage"],
            "importance": "Kuber direction - Wealth"
        },
        Direction.CENTER: {
            "ideal": ["Open Space", "Courtyard"],
            "acceptable": [],
            "avoid": ["Toilet", "Stairs", "Kitchen", "Heavy Pillars"],
            "importance": "Brahmasthan - Sacred center"
        }
    }
    
    # Floor plan characteristics
    GENERAL_RULES = {
        "main_entrance": {
            "ideal_directions": [Direction.NORTH, Direction.EAST, Direction.NORTHEAST],
            "avoid_directions": [Direction.SOUTH, Direction.SOUTHWEST],
            "weight": 0.20  # 20% of total score
        },
        "kitchen": {
            "ideal_directions": [Direction.SOUTHEAST],
            "acceptable_directions": [Direction.NORTHWEST],
            "avoid_directions": [Direction.NORTHEAST, Direction.SOUTHWEST],
            "weight": 0.15
        },
        "master_bedroom": {
            "ideal_directions": [Direction.SOUTHWEST],
            "acceptable_directions": [Direction.SOUTH, Direction.WEST],
            "avoid_directions": [Direction.NORTHEAST],
            "weight": 0.15
        },
        "toilet": {
            "ideal_directions": [Direction.NORTHWEST, Direction.WEST],
            "avoid_directions": [Direction.NORTHEAST, Direction.SOUTHWEST, Direction.CENTER],
            "weight": 0.10
        },
        "puja_room": {
            "ideal_directions": [Direction.NORTHEAST, Direction.EAST],
            "avoid_directions": [Direction.SOUTH, Direction.SOUTHWEST],
            "weight": 0.10
        },
        "living_room": {
            "ideal_directions": [Direction.NORTH, Direction.EAST, Direction.NORTHEAST],
            "acceptable_directions": [Direction.WEST],
            "weight": 0.10
        },
        "garage": {
            "ideal_directions": [Direction.NORTHWEST, Direction.SOUTHEAST],
            "avoid_directions": [Direction.NORTHEAST, Direction.SOUTHWEST],
            "weight": 0.08
        }
    }
    
    # Shape and proportion rules
    SHAPE_RULES = {
        "ideal_shapes": ["Square", "Rectangle"],
        "avoid_shapes": ["Irregular", "L-shaped", "T-shaped"],
        "ideal_ratio": (1, 2),  # Length:Width ideal ratio
        "weight": 0.07
    }
    
    # Additional guidelines
    GUIDELINES = {
        "floor_slope": "Should slope from South-West to North-East",
        "plot_extensions": "Northeast extension is auspicious",
        "corners": "All four corners should be properly built",
        "central_courtyard": "Open center (Brahmasthan) brings prosperity",
        "window_placement": "More windows in North and East",
        "heights": "South and West walls should be higher than North and East"
    }


class VastuAnalyzer:
    """Analyze floor plans for Vastu compliance"""
    
    def __init__(self):
        self.rules = VastuRules()
    
    def calculate_vastu_score(self, plan_features: Dict) -> Dict:
        """
        Calculate overall Vastu compliance score (0-100)
        
        Args:
            plan_features: Dictionary containing:
                - entrance_direction: Direction enum
                - kitchen_direction: Direction enum
                - master_bedroom_direction: Direction enum
                - toilet_directions: List[Direction]
                - shape: str
                - has_garage: bool
                - garage_direction: Direction (optional)
                - has_puja_room: bool
                - puja_direction: Direction (optional)
        
        Returns:
            Dictionary with score, compliance level, and recommendations
        """
        total_score = 0
        max_score = 0
        details = []
        recommendations = []
        
        # Check main entrance
        if 'entrance_direction' in plan_features:
            entrance_dir = plan_features['entrance_direction']
            entrance_rules = self.rules.GENERAL_RULES['main_entrance']
            weight = entrance_rules['weight']
            max_score += weight * 100
            
            if entrance_dir in entrance_rules['ideal_directions']:
                score = 100
                details.append({
                    "aspect": "Main Entrance",
                    "direction": entrance_dir.value,
                    "status": "Excellent",
                    "score": score,
                    "message": f"{entrance_dir.value} entrance is highly auspicious"
                })
            elif entrance_dir in entrance_rules['avoid_directions']:
                score = 30
                details.append({
                    "aspect": "Main Entrance",
                    "direction": entrance_dir.value,
                    "status": "Poor",
                    "score": score,
                    "message": f"{entrance_dir.value} entrance should be avoided"
                })
                recommendations.append(f"Consider relocating entrance to North or East")
            else:
                score = 60
                details.append({
                    "aspect": "Main Entrance",
                    "direction": entrance_dir.value,
                    "status": "Acceptable",
                    "score": score,
                    "message": f"{entrance_dir.value} entrance is acceptable"
                })
            
            total_score += score * weight
        
        # Check kitchen
        if 'kitchen_direction' in plan_features:
            kitchen_dir = plan_features['kitchen_direction']
            kitchen_rules = self.rules.GENERAL_RULES['kitchen']
            weight = kitchen_rules['weight']
            max_score += weight * 100
            
            if kitchen_dir in kitchen_rules['ideal_directions']:
                score = 100
                details.append({
                    "aspect": "Kitchen",
                    "direction": kitchen_dir.value,
                    "status": "Excellent",
                    "score": score,
                    "message": "Kitchen in fire zone (Agni) - Perfect!"
                })
            elif kitchen_dir in kitchen_rules.get('acceptable_directions', []):
                score = 70
                details.append({
                    "aspect": "Kitchen",
                    "direction": kitchen_dir.value,
                    "status": "Good",
                    "score": score,
                    "message": f"{kitchen_dir.value} kitchen is acceptable"
                })
            elif kitchen_dir in kitchen_rules['avoid_directions']:
                score = 20
                details.append({
                    "aspect": "Kitchen",
                    "direction": kitchen_dir.value,
                    "status": "Poor",
                    "score": score,
                    "message": f"{kitchen_dir.value} kitchen violates Vastu"
                })
                recommendations.append("Kitchen should ideally be in Southeast")
            else:
                score = 50
                details.append({
                    "aspect": "Kitchen",
                    "direction": kitchen_dir.value,
                    "status": "Fair",
                    "score": score,
                    "message": f"{kitchen_dir.value} kitchen needs improvement"
                })
            
            total_score += score * weight
        
        # Check master bedroom
        if 'master_bedroom_direction' in plan_features:
            bedroom_dir = plan_features['master_bedroom_direction']
            bedroom_rules = self.rules.GENERAL_RULES['master_bedroom']
            weight = bedroom_rules['weight']
            max_score += weight * 100
            
            if bedroom_dir in bedroom_rules['ideal_directions']:
                score = 100
                details.append({
                    "aspect": "Master Bedroom",
                    "direction": bedroom_dir.value,
                    "status": "Excellent",
                    "score": score,
                    "message": "Ideal placement for stability and health"
                })
            elif bedroom_dir in bedroom_rules.get('acceptable_directions', []):
                score = 75
                details.append({
                    "aspect": "Master Bedroom",
                    "direction": bedroom_dir.value,
                    "status": "Good",
                    "score": score,
                    "message": f"{bedroom_dir.value} placement is acceptable"
                })
            elif bedroom_dir in bedroom_rules['avoid_directions']:
                score = 30
                details.append({
                    "aspect": "Master Bedroom",
                    "direction": bedroom_dir.value,
                    "status": "Poor",
                    "score": score,
                    "message": f"Avoid {bedroom_dir.value} for master bedroom"
                })
                recommendations.append("Master bedroom should be in Southwest")
            else:
                score = 55
                details.append({
                    "aspect": "Master Bedroom",
                    "direction": bedroom_dir.value,
                    "status": "Fair",
                    "score": score,
                    "message": f"{bedroom_dir.value} is not ideal"
                })
            
            total_score += score * weight
        
        # Calculate final score
        if max_score > 0:
            final_score = round(total_score, 1)
        else:
            final_score = 0
        
        # Determine compliance level
        if final_score >= 85:
            compliance = "Excellent Vastu Compliance"
            emoji = "🟢"
        elif final_score >= 70:
            compliance = "Good Vastu Compliance"
            emoji = "🟡"
        elif final_score >= 50:
            compliance = "Moderate Vastu Compliance"
            emoji = "🟠"
        else:
            compliance = "Poor Vastu Compliance"
            emoji = "🔴"
        
        return {
            "score": final_score,
            "compliance_level": compliance,
            "emoji": emoji,
            "details": details,
            "recommendations": recommendations,
            "vastu_tips": self._get_general_tips()
        }
    
    def _get_general_tips(self) -> List[str]:
        """Get general Vastu tips for home buyers"""
        return [
            "Northeast should be kept light and clutter-free",
            "Heavy furniture should be in South or West",
            "Overhead water tank should be in Southwest",
            "Underground water source should be in Northeast",
            "Staircase should be in South, West, or Southwest",
            "Avoid sloped roofs in Northeast",
            "Main door should open clockwise (inward to right)",
            "Mirrors should not face the bed or main door"
        ]
    
    def get_direction_recommendations(self, direction: Direction) -> Dict:
        """Get recommendations for a specific direction"""
        if direction in self.rules.ROOM_PLACEMENTS:
            return self.rules.ROOM_PLACEMENTS[direction]
        return {}
    
    def validate_floor_plan(self, sq_ft: int, bedrooms: int, bathrooms: int, 
                           garage: int, **kwargs) -> Dict:
        """
        Quick validation for floor plans without detailed directional data
        Uses heuristics based on plan size and features
        """
        
        # For plans without directional data, provide general score
        # based on layout proportions and features
        score = 50  # Base score
        
        # Ideal square footage ranges
        if 1500 <= sq_ft <= 3500:
            score += 10
        
        # Bedroom balance
        if 2 <= bedrooms <= 4:
            score += 10
        
        # Bathroom to bedroom ratio (ideal: 1:1 or close)
        if abs(bedrooms - bathrooms) <= 1:
            score += 5
        
        # Garage presence (but not too many)
        if 1 <= garage <= 2:
            score += 5
        
        return {
            "score": min(score, 75),  # Without directional data, max 75
            "compliance_level": "Partial Analysis - Directional data needed",
            "emoji": "⚪",
            "message": "Enable detailed Vastu analysis by adding directional information",
            "quick_tips": self._get_general_tips()[:3]
        }


# Helper function to generate sample directional data for existing plans
def generate_sample_vastu_data(filename: str) -> Dict:
    """
    Generate sample directional data based on filename hash
    This is a placeholder - in production, this data should come from actual floor plan analysis
    """
    import hashlib
    
    # Use filename to deterministically assign directions
    hash_val = int(hashlib.md5(filename.encode()).hexdigest(), 16)
    
    directions = list(Direction)
    
    return {
        "entrance_direction": directions[hash_val % len(directions)],
        "kitchen_direction": directions[(hash_val + 1) % len(directions)],
        "master_bedroom_direction": directions[(hash_val + 2) % len(directions)]
    }
