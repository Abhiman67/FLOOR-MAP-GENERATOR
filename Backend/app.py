import os
import csv
import logging
import uuid
import traceback
from collections import OrderedDict
from flask import Flask, request, jsonify, send_file, send_from_directory, session
from flask_cors import CORS
from pydantic import BaseModel, Field, ValidationError
from vastu_analyzer import VastuAnalyzer, generate_sample_vastu_data
from database import FloorPlanDatabase, migrate_csv_to_db
from semantic_search import get_search_engine
from ml_recommender import get_recommender
from ai_generator import get_ai_generator
from floorplan_recognizer import get_recognizer
from image_search import get_image_search_engine

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# --- SECRET KEY ---
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
if os.environ.get('FLASK_ENV') == 'production' and app.secret_key == 'dev-secret-key-change-in-production':
    logger.error("❌ SECURITY: SECRET_KEY must be set in production. Using default is not allowed.")
    raise RuntimeError("SECRET_KEY environment variable must be set in production mode.")

# --- CORS ---
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*')
if ALLOWED_ORIGINS == '*':
    CORS(app, supports_credentials=True)
else:
    CORS(app, origins=ALLOWED_ORIGINS.split(','), supports_credentials=True)

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_FOLDER = os.path.join(BASE_DIR, "dataset", "images", "images")
CSV_FILE = os.path.join(BASE_DIR, "dataset", "house_plans_details.csv")
MAX_UPLOAD_SIZE = int(os.environ.get('MAX_UPLOAD_SIZE', 10 * 1024 * 1024))  # 10MB default
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}

# --- MAX QUERY HISTORY ---
MAX_QUERY_HISTORY = 1000

# --- INPUT VALIDATION ---
class FloorPlanRequest(BaseModel):
    sq_ft: int = Field(ge=500, le=10000, description="Square footage between 500-10000")
    bedrooms: int = Field(ge=1, le=10, description="Number of bedrooms 1-10")
    bathrooms: int = Field(ge=1, le=8, description="Number of bathrooms 1-8")
    garage: int = Field(ge=0, le=5, description="Number of garage spaces 0-5")
    vastu_compliant: bool = Field(default=False, description="Filter for Vastu compliant plans")
    min_vastu_score: int = Field(default=0, ge=0, le=100, description="Minimum Vastu score")
    query_text: str = Field(default="", description="Natural language search query")

# --- SMART HISTORY TRACKER (bounded to prevent memory leak) ---
class BoundedDict(OrderedDict):
    """Dictionary with a maximum size, evicting oldest entries."""
    def __init__(self, max_size=MAX_QUERY_HISTORY, *args, **kwargs):
        self.max_size = max_size
        super().__init__(*args, **kwargs)

    def __setitem__(self, key, value):
        if key not in self and len(self) >= self.max_size:
            self.popitem(last=False)
        super().__setitem__(key, value)

query_history = BoundedDict()

# --- VASTU ANALYZER ---
vastu_analyzer = VastuAnalyzer()

# --- DATABASE ---
db = FloorPlanDatabase(os.path.join(BASE_DIR, "floorplans.db"))

# --- SEMANTIC SEARCH ---
search_engine = get_search_engine()

# --- ML RECOMMENDER ---
recommender = get_recommender()

# --- AI GENERATOR ---
# We don't initialize it here to save memory. It will lazy-load on first request.
ai_gen = get_ai_generator()

# --- AI RECOGNIZER & REVERSE SEARCH ---
recognizer = get_recognizer()
image_search = get_image_search_engine()

# --- HELPER: CLEAN NUMBERS ---
def clean_int(value):
    if not value: return 0
    try:
        return int(float(str(value).replace(',', '').strip()))
    except ValueError:
        return None

def _build_image_url(filename):
    """Build image URL using request context or environment variable."""
    base_url = os.environ.get('BASE_URL')
    if base_url:
        return f"{base_url.rstrip('/')}/image/{filename}"
    if request:
        return f"{request.host_url.rstrip('/')}/image/{filename}"
    return f"/image/{filename}"

def _validate_upload_file(file):
    """Validate an uploaded file for size and type. Returns (ok, error_message)."""
    if not file or not file.filename:
        return False, "No file provided"

    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return False, f"File type '{ext}' not allowed. Accepted: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"

    # Check file size by reading into memory (Flask doesn't expose content-length reliably)
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_UPLOAD_SIZE:
        max_mb = MAX_UPLOAD_SIZE / (1024 * 1024)
        return False, f"File too large ({size / (1024*1024):.1f}MB). Maximum allowed: {max_mb:.0f}MB"

    return True, None

# --- LOAD DATASET ---
def load_dataset():
    data = []
    if not os.path.exists(CSV_FILE):
        logger.error(f"❌ CRITICAL ERROR: '{CSV_FILE}' not found.")
        return []
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames:
                reader.fieldnames = [name.strip() for name in reader.fieldnames]
            
            logger.info(f"🔍 CSV Headers: {reader.fieldnames}")
            
            required = ['Image Path', 'Square Feet', 'Beds', 'Baths', 'Garages']
            for col in required:
                if col not in reader.fieldnames:
                    logger.error(f"❌ ERROR: Missing column '{col}'")
                    return []

            for row in reader:
                try:
                    raw_path = row.get('Image Path', '').strip()
                    if not raw_path: continue 
                    filename = os.path.basename(raw_path) 
                    
                    sq_ft = clean_int(row.get('Square Feet'))
                    beds = clean_int(row.get('Beds'))
                    baths = clean_int(row.get('Baths'))
                    garage = clean_int(row.get('Garages'))

                    if None in [sq_ft, beds, baths, garage]: continue

                    data.append({
                        "filename": filename,
                        "sq_ft": sq_ft,
                        "bedrooms": beds,
                        "bathrooms": baths,
                        "garage": garage
                    })
                except Exception as e:
                    logger.warning(f"Skipping invalid row: {e}")
                    continue
        logger.info(f"✅ LOADED: {len(data)} entries")
        return data
    except Exception as e:
        logger.error(f"❌ Read Error: {e}")
        return []

# Load dataset once at startup
dataset = load_dataset()
logger.info(f"🚀 Dataset loaded with {len(dataset)} floor plans")

# Check if database is empty and migrate CSV data
db_stats = db.get_statistics()
if db_stats['total_plans'] == 0 and len(dataset) > 0:
    logger.info("📊 Database is empty, migrating CSV data...")
    migrate_csv_to_db(CSV_FILE, db, vastu_analyzer)
    logger.info("✅ Migration complete!")

# Initialize semantic search (lazy loading)
search_engine.initialize()

# Train ML recommender on the loaded dataset
if dataset:
    recommender.fit(dataset)
    logger.info(f"🤖 ML Recommender trained on {len(dataset)} plans")

# Initialize Image Search Index (in background / eager load)
# image_search.build_index(IMAGE_FOLDER)  # Uncomment in production to rebuild index
# image_search.initialize()

@app.route('/generate', methods=['POST'])
def generate():
    global query_history
    
    if not dataset:
        return jsonify({"error": "Dataset not available", "success": False}), 500

    if not recommender.is_fitted:
        return jsonify({"error": "ML model not ready", "success": False}), 503

    # Validate input data
    try:
        request_data = FloorPlanRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": "Invalid input parameters", "details": e.errors(), "success": False}), 400
    except Exception as e:
        return jsonify({"error": "Invalid request format", "success": False}), 400

    sq_ft = request_data.sq_ft
    beds = request_data.bedrooms
    baths = request_data.bathrooms
    garage = request_data.garage

    # Get number of results to return (default 6)
    num_results = request.json.get('num_results', 6)
    num_results = min(max(num_results, 1), 20)  # Clamp between 1-20
    
    # Get Vastu preferences
    vastu_compliant = request_data.vastu_compliant
    min_vastu_score = request_data.min_vastu_score

    request_key = f"{sq_ft}_{beds}_{baths}_{garage}_{vastu_compliant}_{min_vastu_score}"
    
    if request_key not in query_history:
        query_history[request_key] = 0

    logger.info(f"🎯 ML Request: {sq_ft} sqft | {beds} beds | {baths} baths | {garage} garage (Attempt #{query_history[request_key] + 1})")

    # --- ML-POWERED RECOMMENDATION ---
    # KNN finds the closest plans in normalized feature space
    ml_results = recommender.recommend(
        sq_ft=sq_ft,
        bedrooms=beds,
        bathrooms=baths,
        garage=garage,
        top_n=num_results * 3,  # Get extra candidates for Vastu filtering
        vastu_min_score=min_vastu_score if (vastu_compliant or min_vastu_score > 0) else 0
    )

    # Apply Vastu filtering on ML results
    if vastu_compliant or min_vastu_score > 0:
        vastu_filtered = []
        for plan in ml_results:
            vastu_features = generate_sample_vastu_data(plan['filename'])
            vastu_result = vastu_analyzer.calculate_vastu_score(vastu_features)
            plan['vastu_score'] = vastu_result['score']
            plan['vastu_data'] = vastu_result
            
            if plan['vastu_score'] >= min_vastu_score:
                if not vastu_compliant or plan['vastu_score'] >= 70:
                    vastu_filtered.append(plan)
        
        ml_results = vastu_filtered
        logger.info(f"🕉️ Vastu filter: {len(vastu_filtered)} plans meet criteria")

    # Take top N after filtering
    results_to_return = ml_results[:num_results]
    
    # Format results with metadata
    results = []
    for idx, plan in enumerate(results_to_return):
        # Add Vastu score if not already present
        if 'vastu_score' not in plan:
            vastu_features = generate_sample_vastu_data(plan['filename'])
            vastu_result = vastu_analyzer.calculate_vastu_score(vastu_features)
            plan['vastu_score'] = vastu_result['score']
            plan['vastu_data'] = vastu_result
        
        results.append({
            "image_url": _build_image_url(plan['filename']),
            "details": {
                "filename": plan['filename'],
                "sq_ft": plan['sq_ft'],
                "bedrooms": plan['bedrooms'],
                "bathrooms": plan['bathrooms'],
                "garage": plan['garage']
            },
            "metadata": {
                "match_quality": plan.get('match_quality', 'fair'),
                "sq_ft_difference": plan.get('sq_ft_difference', 0),
                "ml_distance": round(plan.get('ml_distance', 0), 3),
                "rank": idx + 1
            },
            "vastu": {
                "score": plan['vastu_score'],
                "compliance_level": plan['vastu_data']['compliance_level'],
                "emoji": plan['vastu_data']['emoji'],
                "details": plan['vastu_data']['details'],
                "recommendations": plan['vastu_data']['recommendations']
            }
        })
    
    query_history[request_key] += 1

    logger.info(f"✅ ML returned {len(results)} results")

    return jsonify({
        "success": True,
        "results": results,
        "summary": {
            "total_candidates": len(ml_results),
            "returned": len(results),
            "best_match_diff": results_to_return[0].get('sq_ft_difference', 0) if results_to_return else 0,
            "engine": "knn-ml-v1"
        }
    })

@app.route('/image/<filename>')
def get_image(filename):
    # Security: prevent directory traversal
    if '..' in filename or '/' in filename or '\\' in filename:
        return jsonify({"error": "Invalid filename"}), 400

    # Resolve and validate the path is within the allowed directory
    file_path = os.path.realpath(os.path.join(IMAGE_FOLDER, filename))
    allowed_dir = os.path.realpath(IMAGE_FOLDER)
    if not file_path.startswith(allowed_dir + os.sep) and file_path != allowed_dir:
        return jsonify({"error": "Invalid filename"}), 400

    if os.path.exists(file_path):
        mimetype = 'image/jpeg' if filename.lower().endswith(('.jpg', '.jpeg')) else 'image/png'
        return send_file(file_path, mimetype=mimetype)
    else:
        logger.warning(f"❌ Missing Image: {file_path}")
        return jsonify({"error": "Image not found"}), 404

@app.route('/api/stats')
def get_stats():
    """Get dataset statistics including Vastu analysis"""
    if not dataset:
        return jsonify({"error": "Dataset not available"}), 500
    
    bedroom_counts = {}
    bathroom_counts = {}
    garage_counts = {}
    vastu_excellent = 0
    vastu_good = 0
    vastu_fair = 0
    vastu_poor = 0
    
    for plan in dataset:
        bedroom_counts[plan['bedrooms']] = bedroom_counts.get(plan['bedrooms'], 0) + 1
        bathroom_counts[plan['bathrooms']] = bathroom_counts.get(plan['bathrooms'], 0) + 1
        garage_counts[plan['garage']] = garage_counts.get(plan['garage'], 0) + 1
        
        # Calculate Vastu score for statistics (sample first 100 for performance)
    
    # Sample 100 plans for Vastu distribution
    import random
    sample_plans = random.sample(dataset, min(100, len(dataset)))
    for plan in sample_plans:
        vastu_features = generate_sample_vastu_data(plan['filename'])
        vastu_result = vastu_analyzer.calculate_vastu_score(vastu_features)
        score = vastu_result['score']
        
        if score >= 85:
            vastu_excellent += 1
        elif score >= 70:
            vastu_good += 1
        elif score >= 50:
            vastu_fair += 1
        else:
            vastu_poor += 1
    
    return jsonify({
        "success": True,
        "total_plans": len(dataset),
        "bedroom_distribution": bedroom_counts,
        "bathroom_distribution": bathroom_counts,
        "garage_distribution": garage_counts,
        "sq_ft_range": {
            "min": min(plan['sq_ft'] for plan in dataset),
            "max": max(plan['sq_ft'] for plan in dataset),
            "avg": sum(plan['sq_ft'] for plan in dataset) / len(dataset)
        },
        "vastu_distribution": {
            "excellent": vastu_excellent,
            "good": vastu_good,
            "fair": vastu_fair,
            "poor": vastu_poor,
            "total_analyzed": len(sample_plans)
        }
    })

@app.route('/api/vastu/info')
def vastu_info():
    """Get Vastu principles and guidelines"""
    from vastu_analyzer import VastuRules
    
    rules = VastuRules()
    
    return jsonify({
        "success": True,
        "guidelines": rules.GUIDELINES,
        "room_placements": {
            direction.value: {
                "ideal": info["ideal"],
                "avoid": info["avoid"],
                "importance": info["importance"]
            }
            for direction, info in rules.ROOM_PLACEMENTS.items()
        },
        "general_tips": vastu_analyzer._get_general_tips()
    })

@app.route('/api/search/semantic', methods=['POST'])
def semantic_search():
    """Natural language search for floor plans"""
    data = request.json
    query = data.get('query', '')
    limit = min(data.get('limit', 10), 20)
    
    if not query:
        return jsonify({"error": "Query text required", "success": False}), 400
    
    # Get session ID
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    logger.info(f"🔍 Semantic search: '{query}'")
    
    # Get all plans from database
    all_plans = db.get_all_plans()
    
    if not search_engine.is_available():
        logger.warning("Semantic search not available, falling back to basic search")
        return jsonify({
            "success": False,
            "error": "Semantic search not available. Install sentence-transformers.",
            "fallback": True
        }), 503
    
    # Perform semantic search
    results = search_engine.search_by_text(query, all_plans, limit)
    
    # Format results
    formatted_results = []
    for plan, similarity in results:
        formatted_results.append({
            "image_url": _build_image_url(plan['filename']),
            "details": {
                "filename": plan['filename'],
                "sq_ft": plan['sq_ft'],
                "bedrooms": plan['bedrooms'],
                "bathrooms": plan['bathrooms'],
                "garage": plan.get('garages', 0),
                "style": plan.get('style')
            },
            "similarity": round(similarity, 3),
            "vastu": {
                "score": plan.get('vastu_score', 0)
            }
        })
    
    # Log search
    db.log_search(session['session_id'], {'query_text': query}, len(formatted_results))
    
    return jsonify({
        "success": True,
        "results": formatted_results,
        "query": query,
        "count": len(formatted_results)
    })

@app.route('/api/similar/<filename>', methods=['GET'])
def find_similar(filename):
    """Find similar floor plans to the given plan"""
    limit = min(int(request.args.get('limit', 6)), 20)
    
    logger.info(f"🔍 Find similar to: {filename}")
    
    # Get reference plan
    reference_plan = db.get_plan_by_filename(filename)
    if not reference_plan:
        return jsonify({"error": "Plan not found", "success": False}), 404
    
    # Get all plans
    all_plans = db.get_all_plans()
    
    if not search_engine.is_available():
        # Fallback: use basic similarity (sq_ft + bedrooms)
        similar = sorted(
            [p for p in all_plans if p['filename'] != filename],
            key=lambda x: abs(x['sq_ft'] - reference_plan['sq_ft']) + abs(x['bedrooms'] - reference_plan['bedrooms']) * 200
        )[:limit]
        
        results = [{
            "image_url": _build_image_url(p['filename']),
            "details": {
                "filename": p['filename'],
                "sq_ft": p['sq_ft'],
                "bedrooms": p['bedrooms'],
                "bathrooms": p['bathrooms'],
                "garage": p.get('garages', 0)
            },
            "similarity": 0.5  # Default similarity
        } for p in similar]
    else:
        # Use semantic similarity
        similar_plans = search_engine.find_similar(reference_plan, all_plans, limit)
        
        results = [{
            "image_url": _build_image_url(plan['filename']),
            "details": {
                "filename": plan['filename'],
                "sq_ft": plan['sq_ft'],
                "bedrooms": plan['bedrooms'],
                "bathrooms": plan['bathrooms'],
                "garage": plan.get('garages', 0),
                "style": plan.get('style')
            },
            "similarity": round(similarity, 3)
        } for plan, similarity in similar_plans]
    
    return jsonify({
        "success": True,
        "reference": {
            "filename": reference_plan['filename'],
            "sq_ft": reference_plan['sq_ft'],
            "bedrooms": reference_plan['bedrooms']
        },
        "results": results,
        "count": len(results)
    })

@app.route('/api/favorites', methods=['GET', 'POST', 'DELETE'])
def manage_favorites():
    """Manage user favorites"""
    # Get or create session ID
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    session_id = session['session_id']
    
    if request.method == 'GET':
        # Get all favorites
        favorites = db.get_favorites(session_id)
        
        results = [{
            "image_url": _build_image_url(plan['filename']),
            "details": {
                "id": plan['id'],
                "filename": plan['filename'],
                "sq_ft": plan['sq_ft'],
                "bedrooms": plan['bedrooms'],
                "bathrooms": plan['bathrooms'],
                "garage": plan.get('garages', 0),
                "style": plan.get('style')
            }
        } for plan in favorites]
        
        return jsonify({
            "success": True,
            "favorites": results,
            "count": len(results)
        })
    
    elif request.method == 'POST':
        # Add to favorites
        data = request.json
        filename = data.get('filename')
        
        if not filename:
            return jsonify({"error": "Filename required", "success": False}), 400
        
        plan = db.get_plan_by_filename(filename)
        if not plan:
            return jsonify({"error": "Plan not found", "success": False}), 404
        
        added = db.add_favorite(session_id, plan['id'])
        
        return jsonify({
            "success": True,
            "added": added,
            "message": "Added to favorites" if added else "Already in favorites"
        })
    
    elif request.method == 'DELETE':
        # Remove from favorites
        data = request.json
        filename = data.get('filename')
        
        if not filename:
            return jsonify({"error": "Filename required", "success": False}), 400
        
        plan = db.get_plan_by_filename(filename)
        if not plan:
            return jsonify({"error": "Plan not found", "success": False}), 404
        
        removed = db.remove_favorite(session_id, plan['id'])
        
        return jsonify({
            "success": True,
            "removed": removed,
            "message": "Removed from favorites" if removed else "Not in favorites"
        })

@app.route('/api/generate/ai', methods=['POST'])
def generate_ai_floorplan():
    """
    Generate a brand new floor plan from a text prompt using Stable Diffusion.
    """
    try:
        data = request.json
        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt is required", "success": False}), 400
            
        prompt = data['prompt']
        
        # Optional parameters
        style = data.get('style', 'modern')
        width = int(data.get('width', 512))
        height = int(data.get('height', 512))
        
        # Enhance prompt with style keyword
        enhanced_prompt = f"{style} style, {prompt}"
        
        logger.info(f"🎨 API Request: Generate AI Floor Plan -> '{enhanced_prompt}'")
        
        # This will take several seconds to run
        result = ai_gen.generate_from_text(enhanced_prompt, width=width, height=height)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error generating AI floor plan: {traceback.format_exc()}")
        return jsonify({"error": str(e), "success": False}), 500

@app.route('/api/generate/from-sketch', methods=['POST'])
def generate_sketch_floorplan():
    """
    Transform a rough sketch into a professional floor plan using ControlNet.
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Sketch image is required", "success": False}), 400
            
        file = request.files['image']
        valid, error_msg = _validate_upload_file(file)
        if not valid:
            return jsonify({"error": error_msg, "success": False}), 400

        prompt = request.form.get('prompt', 'standard floor plan')
        
        # Read the image
        from PIL import Image
        image = Image.open(file.stream).convert("RGB")
        
        logger.info(f"🎨 API Request: Generate from Sketch -> '{prompt}'")
        
        # Run ControlNet
        result = ai_gen.generate_from_sketch(image, prompt)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error generating from sketch: {traceback.format_exc()}")
        return jsonify({"error": str(e), "success": False}), 500

@app.route('/api/upload/recognize', methods=['POST'])
def recognize_floorplan():
    """
    Upload a floor plan image and use AI to recognize rooms and dimensions.
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Image is required", "success": False}), 400
            
        file = request.files['image']
        valid, error_msg = _validate_upload_file(file)
        if not valid:
            return jsonify({"error": error_msg, "success": False}), 400
        
        from PIL import Image
        image = Image.open(file.stream).convert("RGB")
        
        logger.info(f"🔍 API Request: Recognize Floor Plan structure")
        
        result = recognizer.recognize(image)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error recognizing floor plan: {traceback.format_exc()}")
        return jsonify({"error": str(e), "success": False}), 500

@app.route('/api/search/image', methods=['POST'])
def search_by_image():
    """
    Reverse image search to find similar floor plans in the dataset.
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Image is required", "success": False}), 400
            
        file = request.files['image']
        valid, error_msg = _validate_upload_file(file)
        if not valid:
            return jsonify({"error": error_msg, "success": False}), 400
        
        from PIL import Image
        image = Image.open(file.stream).convert("RGB")
        
        logger.info(f"🔍 API Request: Reverse Image Search")
        
        results = image_search.search_by_image(image)
        return jsonify({"success": True, "results": results})
        
    except Exception as e:
        logger.error(f"Error in reverse image search: {traceback.format_exc()}")
        return jsonify({"error": str(e), "success": False}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint for monitoring and Docker health checks."""
    return jsonify({
        "status": "healthy",
        "dataset_loaded": len(dataset) > 0,
        "dataset_size": len(dataset),
        "ml_model_ready": recommender.is_fitted,
        "semantic_search_available": search_engine.is_available()
    })

if __name__ == '__main__':
    if not os.path.exists(IMAGE_FOLDER): 
        os.makedirs(IMAGE_FOLDER)
        logger.warning(f"Created missing image folder: {IMAGE_FOLDER}")
    
    # Check if we have data
    if not dataset:
        logger.error("❌ No dataset loaded - check CSV file and image paths")
    
    logger.info("🚀 Floor Plan Generator Backend Started")
    logger.info(f"📁 Serving images from: {IMAGE_FOLDER}")
    logger.info(f"📊 Dataset: {len(dataset)} plans loaded")
    
    host = os.environ.get('HOST', '127.0.0.1')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 'yes')
    app.run(debug=debug, port=port, host=host)