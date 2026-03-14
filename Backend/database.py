"""
Database models and initialization for Floor Plan Generator
Migrating from CSV to SQLite with vector search capabilities
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import numpy as np

class FloorPlanDatabase:
    """SQLite database manager with vector search support"""
    
    def __init__(self, db_path: str = "floorplans.db"):
        self.db_path = db_path
        self.conn = None
        self.initialize_database()
    
    def initialize_database(self):
        """Create database schema"""
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        
        cursor = self.conn.cursor()
        
        # Main floor plans table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS floor_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE NOT NULL,
                sq_ft INTEGER NOT NULL,
                bedrooms INTEGER NOT NULL,
                bathrooms REAL NOT NULL,
                garages INTEGER NOT NULL,
                style TEXT,
                stories INTEGER DEFAULT 1,
                has_basement BOOLEAN DEFAULT 0,
                has_pool BOOLEAN DEFAULT 0,
                has_patio BOOLEAN DEFAULT 0,
                description TEXT,
                tags TEXT,  -- JSON array of tags
                vastu_score REAL DEFAULT 0,
                vastu_data TEXT,  -- JSON object
                embedding BLOB,  -- Vector embedding for semantic search
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User favorites table (session-based for now)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                plan_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (plan_id) REFERENCES floor_plans(id),
                UNIQUE(session_id, plan_id)
            )
        """)
        
        # Search history for analytics
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS search_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                query_text TEXT,
                sq_ft INTEGER,
                bedrooms INTEGER,
                bathrooms INTEGER,
                garages INTEGER,
                vastu_filter BOOLEAN,
                min_vastu_score INTEGER,
                results_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Indexes for faster queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bedrooms ON floor_plans(bedrooms)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sqft ON floor_plans(sq_ft)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_style ON floor_plans(style)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_vastu_score ON floor_plans(vastu_score)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_favorites_session ON user_favorites(session_id)")
        
        self.conn.commit()
    
    def insert_plan(self, plan_data: Dict) -> int:
        """Insert a new floor plan"""
        cursor = self.conn.cursor()
        
        # Prepare embedding as binary blob
        embedding_blob = None
        if 'embedding' in plan_data and plan_data['embedding'] is not None:
            embedding_blob = np.array(plan_data['embedding']).tobytes()
        
        # Convert tags and vastu_data to JSON strings
        tags_json = json.dumps(plan_data.get('tags', []))
        vastu_json = json.dumps(plan_data.get('vastu_data', {}))
        
        cursor.execute("""
            INSERT OR REPLACE INTO floor_plans 
            (filename, sq_ft, bedrooms, bathrooms, garages, style, stories, 
             has_basement, has_pool, has_patio, description, tags, vastu_score, 
             vastu_data, embedding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            plan_data['filename'],
            plan_data['sq_ft'],
            plan_data['bedrooms'],
            plan_data['bathrooms'],
            plan_data['garages'],
            plan_data.get('style'),
            plan_data.get('stories', 1),
            plan_data.get('has_basement', 0),
            plan_data.get('has_pool', 0),
            plan_data.get('has_patio', 0),
            plan_data.get('description'),
            tags_json,
            plan_data.get('vastu_score', 0),
            vastu_json,
            embedding_blob
        ))
        
        self.conn.commit()
        return cursor.lastrowid
    
    def search_plans(
        self,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[int] = None,
        garages: Optional[int] = None,
        min_sqft: Optional[int] = None,
        max_sqft: Optional[int] = None,
        style: Optional[str] = None,
        min_vastu_score: int = 0,
        tags: Optional[List[str]] = None,
        limit: int = 20
    ) -> List[Dict]:
        """Search floor plans with filters"""
        cursor = self.conn.cursor()
        
        query = "SELECT * FROM floor_plans WHERE 1=1"
        params = []
        
        if bedrooms is not None:
            query += " AND bedrooms = ?"
            params.append(bedrooms)
        
        if bathrooms is not None:
            query += " AND bathrooms = ?"
            params.append(bathrooms)
        
        if garages is not None:
            query += " AND garages = ?"
            params.append(garages)
        
        if min_sqft is not None:
            query += " AND sq_ft >= ?"
            params.append(min_sqft)
        
        if max_sqft is not None:
            query += " AND sq_ft <= ?"
            params.append(max_sqft)
        
        if style is not None:
            query += " AND style = ?"
            params.append(style)
        
        if min_vastu_score > 0:
            query += " AND vastu_score >= ?"
            params.append(min_vastu_score)
        
        query += " LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        return [dict(row) for row in rows]
    
    def get_plan_by_id(self, plan_id: int) -> Optional[Dict]:
        """Get a single floor plan by ID"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM floor_plans WHERE id = ?", (plan_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    def get_plan_by_filename(self, filename: str) -> Optional[Dict]:
        """Get a floor plan by filename"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM floor_plans WHERE filename = ?", (filename,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    def add_favorite(self, session_id: str, plan_id: int) -> bool:
        """Add a plan to user favorites"""
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO user_favorites (session_id, plan_id) VALUES (?, ?)",
                (session_id, plan_id)
            )
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False  # Already favorited
    
    def remove_favorite(self, session_id: str, plan_id: int) -> bool:
        """Remove a plan from user favorites"""
        cursor = self.conn.cursor()
        cursor.execute(
            "DELETE FROM user_favorites WHERE session_id = ? AND plan_id = ?",
            (session_id, plan_id)
        )
        self.conn.commit()
        return cursor.rowcount > 0
    
    def get_favorites(self, session_id: str) -> List[Dict]:
        """Get all favorited plans for a user"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT fp.* FROM floor_plans fp
            INNER JOIN user_favorites uf ON fp.id = uf.plan_id
            WHERE uf.session_id = ?
            ORDER BY uf.created_at DESC
        """, (session_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def log_search(self, session_id: str, search_params: Dict, results_count: int):
        """Log search for analytics"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO search_history 
            (session_id, query_text, sq_ft, bedrooms, bathrooms, garages, 
             vastu_filter, min_vastu_score, results_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            search_params.get('query_text'),
            search_params.get('sq_ft'),
            search_params.get('bedrooms'),
            search_params.get('bathrooms'),
            search_params.get('garages'),
            search_params.get('vastu_compliant', False),
            search_params.get('min_vastu_score', 0),
            results_count
        ))
        self.conn.commit()
    
    def get_all_plans(self) -> List[Dict]:
        """Get all floor plans"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM floor_plans")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def get_statistics(self) -> Dict:
        """Get database statistics"""
        cursor = self.conn.cursor()
        
        # Total plans
        cursor.execute("SELECT COUNT(*) as count FROM floor_plans")
        total = cursor.fetchone()['count']
        
        # Bedroom distribution
        cursor.execute("""
            SELECT bedrooms, COUNT(*) as count 
            FROM floor_plans 
            GROUP BY bedrooms 
            ORDER BY bedrooms
        """)
        bedroom_dist = {row['bedrooms']: row['count'] for row in cursor.fetchall()}
        
        # Style distribution
        cursor.execute("""
            SELECT style, COUNT(*) as count 
            FROM floor_plans 
            WHERE style IS NOT NULL
            GROUP BY style 
            ORDER BY count DESC
        """)
        style_dist = {row['style']: row['count'] for row in cursor.fetchall()}
        
        # Vastu score distribution
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN vastu_score >= 85 THEN 1 ELSE 0 END) as excellent,
                SUM(CASE WHEN vastu_score >= 70 AND vastu_score < 85 THEN 1 ELSE 0 END) as good,
                SUM(CASE WHEN vastu_score >= 50 AND vastu_score < 70 THEN 1 ELSE 0 END) as fair,
                SUM(CASE WHEN vastu_score < 50 THEN 1 ELSE 0 END) as poor
            FROM floor_plans
        """)
        vastu_dist = dict(cursor.fetchone())
        
        # Square footage range
        cursor.execute("SELECT MIN(sq_ft) as min, MAX(sq_ft) as max, AVG(sq_ft) as avg FROM floor_plans")
        sqft_stats = dict(cursor.fetchone())
        
        return {
            'total_plans': total,
            'bedroom_distribution': bedroom_dist,
            'style_distribution': style_dist,
            'vastu_distribution': vastu_dist,
            'sqft_range': sqft_stats
        }
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()


# Utility function to migrate CSV to database
def migrate_csv_to_db(csv_path: str, db: FloorPlanDatabase, vastu_analyzer=None):
    """Migrate existing CSV data to SQLite database"""
    import csv
    
    print(f"📊 Starting migration from {csv_path}...")
    
    migrated = 0
    skipped = 0
    
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            try:
                # Clean data
                sq_ft = int(float(str(row.get('Square Feet', 0)).replace(',', '')))
                bedrooms = int(float(row.get('Beds', 0)))
                bathrooms = float(row.get('Baths', 0))
                garages = int(float(row.get('Garages', 0)))
                filename = os.path.basename(row.get('Image Path', '').strip())
                
                if not filename or sq_ft == 0:
                    skipped += 1
                    continue
                
                # Auto-generate style based on characteristics
                style = auto_detect_style(sq_ft, bedrooms, bathrooms)
                
                # Generate Vastu score if analyzer provided
                vastu_score = 0
                vastu_data = {}
                if vastu_analyzer:
                    from vastu_analyzer import generate_sample_vastu_data
                    vastu_features = generate_sample_vastu_data(filename)
                    vastu_result = vastu_analyzer.calculate_vastu_score(vastu_features)
                    vastu_score = vastu_result['score']
                    vastu_data = vastu_result
                
                # Auto-generate tags
                tags = generate_tags(sq_ft, bedrooms, bathrooms, garages, style)
                
                plan_data = {
                    'filename': filename,
                    'sq_ft': sq_ft,
                    'bedrooms': bedrooms,
                    'bathrooms': bathrooms,
                    'garages': garages,
                    'style': style,
                    'stories': 2 if sq_ft > 3000 else 1,
                    'tags': tags,
                    'vastu_score': vastu_score,
                    'vastu_data': vastu_data,
                    'description': f"{bedrooms}BR/{bathrooms}BA {style} home with {sq_ft} sqft"
                }
                
                db.insert_plan(plan_data)
                migrated += 1
                
                if migrated % 100 == 0:
                    print(f"  ✓ Migrated {migrated} plans...")
                    
            except Exception as e:
                print(f"  ⚠️  Skipped row: {e}")
                skipped += 1
                continue
    
    print(f"✅ Migration complete! {migrated} plans migrated, {skipped} skipped.")
    return migrated, skipped


def auto_detect_style(sq_ft: int, bedrooms: int, bathrooms: float) -> str:
    """Auto-detect architectural style based on characteristics"""
    if sq_ft < 1200:
        return "Cottage"
    elif sq_ft > 4000:
        return "Luxury"
    elif bedrooms == 1 and sq_ft < 1000:
        return "Studio"
    elif sq_ft > 3000 and bathrooms >= 3:
        return "Executive"
    elif bedrooms >= 4:
        return "Family"
    elif 1500 <= sq_ft <= 2500:
        return "Modern"
    else:
        return "Traditional"


def generate_tags(sq_ft: int, bedrooms: int, bathrooms: float, garages: int, style: str) -> List[str]:
    """Generate searchable tags for a floor plan"""
    tags = [style]
    
    if sq_ft < 1500:
        tags.append("compact")
    elif sq_ft > 3500:
        tags.append("spacious")
    
    if bedrooms >= 4:
        tags.append("large-family")
    
    if bathrooms >= 3:
        tags.append("multi-bath")
    
    if garages >= 2:
        tags.append("ample-parking")
    
    if sq_ft > 2500 and bedrooms >= 3:
        tags.append("luxury")
    
    return tags
