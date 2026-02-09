import os
import time
import csv
import random
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow the frontend to communicate with this backend

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_FOLDER = os.path.join(BASE_DIR, "dataset", "images", "images")
CSV_FILE = os.path.join(BASE_DIR, "dataset", "house_plans_details.csv")

# --- SMART HISTORY TRACKER ---
query_history = {}

# --- HELPER: CLEAN NUMBERS ---
def clean_int(value):
    if not value: return 0
    try:
        return int(float(str(value).replace(',', '').strip()))
    except ValueError:
        return None

# --- LOAD DATASET ---
def load_dataset():
    data = []
    if not os.path.exists(CSV_FILE):
        print(f"❌ CRITICAL ERROR: '{CSV_FILE}' not found.")
        return []
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames:
                reader.fieldnames = [name.strip() for name in reader.fieldnames]
            
            print(f"🔍 CSV Headers: {reader.fieldnames}")
            
            required = ['Image Path', 'Square Feet', 'Beds', 'Baths', 'Garages']
            for col in required:
                if col not in reader.fieldnames:
                    print(f"❌ ERROR: Missing column '{col}'")
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
                except: continue
        print(f"✅ LOADED: {len(data)} entries")
        return data
    except Exception as e:
        print(f"❌ Read Error: {e}")
        return []

dataset = load_dataset()

@app.route('/generate', methods=['POST'])
def generate():
    global dataset, query_history
    
    if not dataset:
        dataset = load_dataset()
        if not dataset: return jsonify({"error": "No Dataset"}), 500

    data = request.json
    sq_ft = int(data.get('sq_ft', 1500))
    beds = int(data.get('bedrooms', 3))
    baths = int(data.get('bathrooms', 2))
    garage = int(data.get('garage', 1))

    request_key = f"{sq_ft}_{beds}_{baths}_{garage}"
    
    if request_key not in query_history:
        query_history[request_key] = 0

    print(f"\n🎯 Request: {sq_ft} sqft | {beds} Beds (Attempt #{query_history[request_key] + 1})")

    # --- 1. LONGER COY DELAY ---
    # Old Formula: 4 + (sq_ft / 500)
    # NEW Formula: 7s Base + (sq_ft / 400) + Random
    # Example: 1500 sqft -> 7 + 3.75 = ~10.75 seconds
    fake_time = 7 + (sq_ft / 400) + random.uniform(0.5, 2.5)
    
    print(f"⏳ Processing (Extended): {fake_time:.2f}s...")
    time.sleep(fake_time)

    # --- 2. CYCLING RETRIEVAL LOGIC ---
    candidates = [d for d in dataset if d['bedrooms'] == beds]
    if not candidates:
        candidates = [d for d in dataset if abs(d['bedrooms'] - beds) <= 1]
    if not candidates:
        candidates = dataset

    ranked_candidates = sorted(candidates, key=lambda x: abs(x['sq_ft'] - sq_ft))

    current_index = query_history[request_key]
    final_index = current_index % len(ranked_candidates)
    
    best_match = ranked_candidates[final_index]
    
    query_history[request_key] += 1

    diff = abs(best_match['sq_ft'] - sq_ft)
    print(f"✅ Served Option #{final_index + 1}: {best_match['filename']} (Diff: {diff} sqft)")

    timestamp = int(time.time())
    return jsonify({
        "image_url": f"http://127.0.0.1:5000/image/{best_match['filename']}?t={timestamp}",
        "details": best_match
    })

@app.route('/image/<filename>')
def get_image(filename):
    file_path = os.path.join(IMAGE_FOLDER, filename)
    if os.path.exists(file_path):
        mimetype = 'image/jpeg' if filename.lower().endswith('.jpg') else 'image/png'
        return send_file(file_path, mimetype=mimetype)
    else:
        print(f"❌ Missing Image: {file_path}")
        return "Not found", 404

if __name__ == '__main__':
    if not os.path.exists(IMAGE_FOLDER): os.makedirs(IMAGE_FOLDER)
    print("🚀 Backend Running (Longer Loading Time)")
    app.run(debug=True, port=5000)