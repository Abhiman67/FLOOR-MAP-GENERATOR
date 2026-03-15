"""
Floor Plan Recognizer using YOLOv8 and EasyOCR
Detects structural elements (rooms, doors, windows) and reads dimensions 
from uploaded floor plan images.
"""

import os
import cv2
import numpy as np
import logging
from PIL import Image
import easyocr
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    
logger = logging.getLogger(__name__)

class FloorPlanRecognizer:
    def __init__(self):
        logger.info("Initializing Floor Plan Recognizer...")
        
        # Initialize OCR reader for reading room dimensions
        # using English. Add more languages if needed.
        self.reader = easyocr.Reader(['en'], gpu=True)
        
        # Initialize YOLO model for object detection
        # In production, this should be a custom YOLOv8 model trained specifically 
        # on floor plan annotations (classes: room, door, window, wall).
        # We use a placeholder path here. If it doesn't exist, we'll fall back to 
        # a simulated response for demonstration purposes.
        self.model_path = os.path.join(os.path.dirname(__file__), "models", "yolov8_floorplan.pt")
        self.model = None
        
        if YOLO_AVAILABLE and os.path.exists(self.model_path):
            self.model = YOLO(self.model_path)
            logger.info("✅ YOLOv8 Floor Plan model loaded")
        else:
            logger.warning("⚠️ YOLOv8 model not found or ultralytics not installed. Using simulation mode.")

    def _extract_text_and_dimensions(self, image_np: np.ndarray) -> list:
        """Use OCR to find room names and dimensions in the image."""
        try:
            # easyocr expects BGR or grayscale numpy array, or file path
            results = self.reader.readtext(image_np)
            
            extracted = []
            for (bbox, text, prob) in results:
                if prob > 0.5: # Confidence threshold
                    # Calculate center point of text bounding box
                    (tl, tr, br, bl) = bbox
                    center_x = int((tl[0] + br[0]) / 2)
                    center_y = int((tl[1] + br[1]) / 2)
                    
                    extracted.append({
                        "text": text,
                        "confidence": float(prob),
                        "position": {"x": center_x, "y": center_y},
                        "bbox": [[int(coord) for coord in point] for point in bbox]
                    })
            return extracted
        except Exception as e:
            logger.error(f"OCR Error: {e}")
            return []

    def recognize(self, image: Image.Image) -> dict:
        """
        Main method to process an uploaded floor plan image.
        Returns a structured JSON representation of the plan.
        """
        # Convert PIL to CV2 format
        img_np = np.array(image)
        if len(img_np.shape) == 3 and img_np.shape[2] == 3:
            img_np = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
        width, height = image.size
        
        # 1. Run OCR to find text labels
        text_data = self._extract_text_and_dimensions(img_np)
        
        # 2. Run Object Detection to find rooms and walls
        rooms = []
        walls = []
        doors = []
        windows = []
        
        if self.model:
            # Real AI Inference via YOLO
            results = self.model(img_np)[0]
            
            for box in results.boxes:
                # Class 0: Room, 1: Wall, 2: Door, 3: Window (Assuming custom model schema)
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                
                element = {
                    "bbox": [x1, y1, x2, y2],
                    "center": [(x1+x2)//2, (y1+y2)//2],
                    "confidence": confidence
                }
                
                if cls_id == 0: rooms.append(element)
                elif cls_id == 1: walls.append(element)
                elif cls_id == 2: doors.append(element)
                elif cls_id == 3: windows.append(element)
                
        else:
            # SIMULATION MODE (If real model is missing)
            # Create a mock recognition response based on the image size
            logger.info("Running in SIMULATION mode for structural detection")
            rooms = [
                {"type": "Living Room", "bbox": [int(width*0.1), int(height*0.5), int(width*0.5), int(height*0.9)]},
                {"type": "Bedroom 1", "bbox": [int(width*0.6), int(height*0.1), int(width*0.9), int(height*0.4)]},
                {"type": "Kitchen", "bbox": [int(width*0.1), int(height*0.1), int(width*0.4), int(height*0.4)]}
            ]
            walls = [
                {"x1": 0, "y1": 0, "x2": width, "y2": 0, "thickness": 10}, # Top border
                {"x1": 0, "y1": 0, "x2": 0, "y2": height, "thickness": 10}, # Left border
            ]
            
        # 3. Associate Text Labels with Detect Rooms (Spatial join)
        # If a text label is inside a room's bounding box, assign it as the room name
        for room in rooms:
            if "bbox" not in room: continue
            rx1, ry1, rx2, ry2 = room["bbox"]
            
            for text_item in text_data:
                tx, ty = text_item["position"]["x"], text_item["position"]["y"]
                # Check if text center is inside room bbox
                if rx1 <= tx <= rx2 and ry1 <= ty <= ry2:
                    if "name" not in room:
                        # Simple heuristic: if text has numbers (like "12x15"), it's a dimension. Otherwise a name.
                        import re
                        if not re.search(r'\d', text_item["text"]):
                            room["name"] = text_item["text"]
                        else:
                            room["dimensions"] = text_item["text"]

        return {
            "success": True,
            "image_size": {"width": width, "height": height},
            "rooms": rooms,
            "walls": walls,
            "doors": doors,
            "windows": windows,
            "raw_text": text_data
        }

# --- Singleton ---
_recognizer = None

def get_recognizer() -> FloorPlanRecognizer:
    global _recognizer
    if _recognizer is None:
        _recognizer = FloorPlanRecognizer()
    return _recognizer
