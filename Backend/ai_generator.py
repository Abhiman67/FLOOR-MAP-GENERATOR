"""
AI Floor Plan Generator
Uses HuggingFace Diffusers (Stable Diffusion + ControlNet) to generate 
floor plans from text prompts or rough sketches.
"""

import torch
import logging
import os
from io import BytesIO
from PIL import Image
from diffusers import StableDiffusionPipeline, StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
from typing import Optional, Dict

logger = logging.getLogger(__name__)

class AIFloorPlanGenerator:
    def __init__(self):
        try:
            self.device = "cpu"
            if torch.cuda.is_available():
                self.device = "cuda"
            elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                self.device = "mps"
        except Exception:
            self.device = "cpu"
            
        logger.info(f"🚀 AI Generator initializing on device: {self.device}")
        
        self.txt2img_pipe = None
        self.controlnet_pipe = None
        
        # Default models (These are standard SD models. In production, 
        # these would be replaced with models fine-tuned specifically on floor plans)
        self.base_model_id = "runwayml/stable-diffusion-v1-5"
        self.controlnet_id = "lllyasviel/sd-controlnet-canny"
        
        self.output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset", "generated")
        os.makedirs(self.output_dir, exist_ok=True)

    def _load_txt2img_pipeline(self):
        """Lazy load the text-to-image pipeline to save memory until needed."""
        if self.txt2img_pipe is None:
            logger.info(f"Loading Stable Diffusion Base Model: {self.base_model_id}...")
            # Use float16 on Mac/GPU to save memory, float32 on CPU
            dtype = torch.float32 if self.device == "cpu" else torch.float16
            
            self.txt2img_pipe = StableDiffusionPipeline.from_pretrained(
                self.base_model_id, 
                torch_dtype=dtype,
                safety_checker=None # Disable safety checker for architecture plans
            )
            self.txt2img_pipe.scheduler = UniPCMultistepScheduler.from_config(self.txt2img_pipe.scheduler.config)
            self.txt2img_pipe.to(self.device)
            
            # Enable memory efficient attention if on Mac
            if self.device == "mps":
                self.txt2img_pipe.enable_attention_slicing()
                
            logger.info("✅ txt2img pipeline loaded successfully")

    def _load_controlnet_pipeline(self):
        """Lazy load the ControlNet pipeline for sketch-to-plan."""
        if self.controlnet_pipe is None:
            logger.info(f"Loading ControlNet Model: {self.controlnet_id}...")
            dtype = torch.float32 if self.device == "cpu" else torch.float16
            
            controlnet = ControlNetModel.from_pretrained(
                self.controlnet_id, 
                torch_dtype=dtype
            )
            
            self.controlnet_pipe = StableDiffusionControlNetPipeline.from_pretrained(
                self.base_model_id,
                controlnet=controlnet,
                torch_dtype=dtype,
                safety_checker=None
            )
            self.controlnet_pipe.scheduler = UniPCMultistepScheduler.from_config(self.controlnet_pipe.scheduler.config)
            self.controlnet_pipe.to(self.device)
            
            if self.device == "mps":
                self.controlnet_pipe.enable_attention_slicing()
                
            logger.info("✅ ControlNet pipeline loaded successfully")

    def generate_from_text(self, prompt: str, negative_prompt: str = "", width: int = 512, height: int = 512) -> Dict:
        """
        Generate a brand new floor plan from a text description.
        """
        self._load_txt2img_pipeline()
        
        # Enhance the prompt with architectural keywords
        enhanced_prompt = f"professional architectural floor plan blueprint, 2D layout, top down view, perfectly straight lines, {prompt}, highly detailed, clear text labels, white background"
        
        if not negative_prompt:
            negative_prompt = "3d render, isometric, perspective, messy lines, blurry, photograph, artistic, colorful, gradients"
        
        logger.info(f"🎨 Generating AI Floor Plan from prompt: {prompt}")
        
        # Set generator for reproducibility if needed, but here we want random
        generator = torch.Generator(device=self.device)
        
        # Inference
        # Note: num_inference_steps=20 is chosen for speed. Production could use 30-50.
        image = self.txt2img_pipe(
            prompt=enhanced_prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            num_inference_steps=20,
            guidance_scale=7.5,
            generator=generator
        ).images[0]
        
        # Save the image
        filename = f"ai_gen_{torch.randint(1000, 9999, (1,)).item()}.jpg"
        filepath = os.path.join(self.output_dir, filename)
        image.save(filepath)
        
        logger.info(f"✅ AI Generation complete: Saved to {filename}")
        
        return {
            "success": True,
            "filename": filename,
            "image_url": f"/generated/{filename}",
            "prompt": prompt
        }

    def generate_from_sketch(self, sketch_image: Image.Image, prompt: str) -> Dict:
        """
        Transform a rough sketch into a professional floor plan using ControlNet.
        """
        self._load_controlnet_pipeline()
        
        # Pre-process the sketch for ControlNet Canny Edge Detection
        import cv2
        import numpy as np
        
        # Convert PIL to CV2 format
        sketch_cv2 = np.array(sketch_image)
        # Convert RGB to BGR
        sketch_cv2 = sketch_cv2[:, :, ::-1].copy() 
        
        # Get edges
        low_threshold = 100
        high_threshold = 200
        edges = cv2.Canny(sketch_cv2, low_threshold, high_threshold)
        
        # Convert back to PIL for Diffusers
        edges = edges[:, :, None]
        edges = np.concatenate([edges, edges, edges], axis=2)
        canny_image = Image.fromarray(edges)
        
        enhanced_prompt = f"professional architectural floor plan blueprint, 2D layout, top down view, straight lines, clean edges, {prompt}"
        negative_prompt = "messy, sketch, jagged lines, hand drawn, 3d, realistic photograph"
        
        logger.info("🎨 Generating AI Floor Plan from SKETCH")
        
        image = self.controlnet_pipe(
            prompt=enhanced_prompt,
            image=canny_image,
            negative_prompt=negative_prompt,
            num_inference_steps=20,
            guidance_scale=7.5,
        ).images[0]
        
        filename = f"ai_sketch_{torch.randint(1000, 9999, (1,)).item()}.jpg"
        filepath = os.path.join(self.output_dir, filename)
        image.save(filepath)
        
        return {
            "success": True,
            "filename": filename,
            "image_url": f"/generated/{filename}",
            "prompt": prompt
        }

# --- Singleton ---
_generator = None

def get_ai_generator() -> AIFloorPlanGenerator:
    global _generator
    if _generator is None:
        _generator = AIFloorPlanGenerator()
    return _generator
