# 🏠 Floor Plan Generator v3.0 - AI-Powered Platform

> **From Static Search to Architectural Intelligence**

A revolutionary floor plan discovery and generation platform powered by semantic AI, Vastu Shastra analysis, and intelligent recommendations.

---

## 🚀 New in Version 3.0

### ✨ **Major Features**

#### 1. **Semantic Search Engine** 🧠
- **Natural Language Queries**: Describe your dream home in plain English
  - *"cozy 3 bedroom house with modern kitchen"*
  - *"spacious family home with good vastu"*
  - *"luxury home with pool and patio"*
- Powered by sentence transformers and vector embeddings
- Context-aware results that understand architectural concepts

#### 2. **SQLite Database Migration** 💾
- Migrated from CSV to proper relational database
- Auto-tagging with architectural styles
- Vector embeddings for semantic search
- Lightning-fast queries with proper indexing

#### 3. **Find Similar Plans** 🔍
- Click "Find Similar" on any floor plan
- AI-powered similarity matching
- Discover plans with similar layouts and features

#### 4. **Favorites System** ❤️
- Save your favorite floor plans
- Session-based persistence
- Quick access to saved plans

#### 5. **Vastu Shastra Integration** 🕉️
- Comprehensive Vastu compliance scoring (0-100%)
- Directional analysis for rooms (Kitchen, Master Bedroom, etc.)
- Filter plans by Vastu compliance level
- Traditional Indian architectural wisdom

#### 6. **Auto-Style Detection** 🎨
- Automatic categorization: Cottage, Modern, Luxury, Traditional, etc.
- Intelligent tagging: "spacious", "compact", "multi-bath", etc.
- Enhanced searchability

---

## 📋 Technical Stack

### **Backend** (Python)
```
├── Flask 3.0.0              # Web framework
├── SQLite                   # Database
├── Sentence Transformers    # Semantic search
├── NumPy                    # Vector operations
├── Pydantic                 # Data validation
└── CORS                     # Cross-origin requests
```

### **Frontend** (TypeScript/React)
```
├── Next.js 14               # React framework
├── Tailwind CSS             # Styling
├── Framer Motion            # Animations
├── Lucide Icons             # Icon library
└── shadcn/ui                # Component library
```

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- pnpm (or npm)

### **Quick Start**

```bash
# Clone the repository
cd "FLOOR MAP GENERATOR"

# Backend setup
cd Backend
python -m venv ../venv
source ../.venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../Frontend
pnpm install

# Run the application
# Terminal 1 - Backend
cd Backend
python app.py

# Terminal 2 - Frontend
cd Frontend
pnpm dev
```

Open http://localhost:3000

---

## 📊 Database Schema

### **floor_plans** Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| filename | TEXT | Image filename |
| sq_ft | INTEGER | Square footage |
| bedrooms | INTEGER | Number of bedrooms |
| bathrooms | REAL | Number of bathrooms |
| garages | INTEGER | Garage spaces |
| style | TEXT | Architectural style |
| stories | INTEGER | Number of floors |
| has_basement | BOOLEAN | Basement feature |
| has_pool | BOOLEAN | Pool feature |
| has_patio | BOOLEAN | Patio feature |
| tags | TEXT | JSON array of tags |
| vastu_score | REAL | Vastu compliance (0-100) |
| vastu_data | TEXT | JSON vastu details |
| embedding | BLOB | Vector embedding |
| created_at | TIMESTAMP | Creation timestamp |

### **user_favorites** Table
Stores user-saved floor plans (session-based)

### **search_history** Table
Analytics and search logging

---

## 🎯 API Endpoints

### **Core Search**
- `POST /generate` - Traditional filter-based search
- `POST /api/search/semantic` - Natural language search
- `GET /api/similar/<filename>` - Find similar plans

### **User Features**
- `GET /api/favorites` - Get saved favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites` - Remove from favorites

### **Analytics & Info**
- `GET /api/stats` - Database statistics
- `GET /api/vastu/info` - Vastu principles
- `GET /image/<filename>` - Serve floor plan images

---

## 🔮 Feature Highlights

### **Semantic Search Example**
```typescript
// Frontend
const response = await fetch(`${API_URL}/api/search/semantic`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "modern 3 bedroom with open kitchen",
    limit: 10
  })
})
```

### **Vastu Filtering**
```typescript
// Filter for Vastu-compliant homes
const response = await fetch(`${API_URL}/generate`, {
  method: 'POST',
  body: JSON.stringify({
    bedrooms: 3,
    bathrooms: 2,
    sq_ft: 2500,
    vastu_compliant: true,  // Only 70%+ Vastu score
    min_vastu_score: 85     // Excellent Vastu (optional)
  })
})
```

### **Find Similar Plans**
```typescript
// Find 6 similar plans to a reference
const response = await fetch(
  `${API_URL}/api/similar/plan_12345.jpg?limit=6`
)
```

---

## 📈 Performance Metrics

- **Database Migration**: 2,640+ plans migrated automatically
- **Search Speed**: < 100ms for filtered search
- **Semantic Search**: < 500ms with embeddings
- **Auto-tagging**: 100% coverage on migration
- **Vastu Analysis**: Real-time scoring

---

## 🎨 User Interface Components

### **New Components**
1. `SemanticSearch` - Natural language search bar
2. `VastuBadge` - Vastu score display with tooltips
3. `ActionButtons` - Favorite/View/Download/Find Similar
4. `ResultsGrid` - Enhanced with Vastu info

### **Enhanced Features**
- Expandable Vastu filter section
- Toggle for Vastu-compliant only
- Minimum Vastu score slider
- Semantic similarity scores
- Interactive tooltips

---

## 🔧 Configuration

### **Backend (.env)**
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_PATH=floorplans.db
IMAGE_FOLDER=dataset/images/images
```

### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

---

## 📚 Implementation Details

### **Semantic Search Engine**
- Uses `sentence-transformers` library
- Model: `all-MiniLM-L6-v2` (384-dimensional embeddings)
- Cosine similarity for matching
- Fallback to basic search if unavailable

### **Auto-Style Detection Algorithm**
```python
if sq_ft < 1200: return "Cottage"
elif sq_ft > 4000: return "Luxury"
elif bedrooms == 1: return "Studio"
elif sq_ft > 3000 and bathrooms >= 3: return "Executive"
elif bedrooms >= 4: return "Family"
else: return "Modern" or "Traditional"
```

### **Vastu Scoring**
- Analyzes entrance direction (North/East ideal)
- Kitchen placement (Southeast/Agni zone)
- Master bedroom (Southwest ideal)
- Toilet locations (avoid Northeast/Southwest)
- Weighted scoring (100-point scale)

---

## 🚀 Next Steps (Future Enhancements)

### **Phase 4 - Generative AI**
- [ ] Sketch-to-Plan conversion with ControlNet
- [ ] Text-to-Plan generation with Stable Diffusion
- [ ] Interactive canvas for plan editing (Fabric.js)

### **Phase 5 - 3D Visualization**
- [ ] 2D to 3D conversion (Three.js)
- [ ] Virtual walkthrough
- [ ] AR mobile view

### **Phase 6 - Platform Features**
- [ ] User authentication (NextAuth/Clerk)
- [ ] Cloud storage for user projects
- [ ] Export to CAD format
- [ ] Cost estimation calculator

---

## 🤝 Contributing

This is a revolutionary platform transforming floor plan discovery. Contributions welcome!

### **Areas to Contribute**
- Additional architectural styles
- More Vastu principles
- Image-to-image search
- Real-time plan editing
- Mobile app

---

## 📄 License

MIT License - See LICENSE file

---

## 🏆 Credits

**Version 3.0 - AI Platform Upgrade**
- Semantic search implementation
- Database migration
- Vastu integration
- Favorites system
- Find similar feature

**Original Concept**: Floor plan matching and discovery

---

## 📞 Support

Having issues? Check:
1. Python dependencies installed: `pip install -r requirements.txt`
2. Frontend dependencies: `pnpm install`
3. Database migrated (happens automatically on first run)
4. Ports 3000 and 5000 available

**Note**: Semantic search requires `sentence-transformers`. If not installed, the app falls back to traditional search.

---

**Built with ❤️ using AI and Traditional Wisdom**

*Combining modern machine learning with ancient Vastu Shastra principles*
