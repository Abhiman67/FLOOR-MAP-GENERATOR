# Changelog

All notable changes to the Floor Plan Generator project.

## [2.0.0] - 2026-02-15

### 🎉 Major Features Added

#### Backend Improvements
- **Multiple Results API**: Backend now returns 6 floor plans instead of 1
  - Configurable via `num_results` parameter (1-20 plans)
  - Smart ranking by square footage similarity
  - Match quality indicators (excellent/good/fair)
- **Statistics Endpoint**: New `/api/stats` endpoint providing:
  - Total plans in dataset
  - Distribution of bedrooms, bathrooms, garages
  - Square footage ranges and averages
- **Input Validation**: Pydantic-based validation
  - Square footage: 500-10,000
  - Bedrooms: 1-10
  - Bathrooms: 1-8
  - Garage: 0-5
- **Performance**: Removed artificial delays, instant responses
- **Logging**: Proper structured logging with Python's logging module
- **Security**: Directory traversal protection on image serving

#### Frontend Enhancements
- **Results Grid View**: Beautiful grid displaying 6 plans at once
  - Hover effects and animations
  - Rank badges for top 3 matches
  - Quality badges (excellent/good/fair)
  - Quick view and download actions
- **Full-Screen Preview Modal**: Click any plan to view in detail
- **Statistics Dashboard**: Live dataset insights displayed on home page
  - Total plans available
  - Most common configurations
  - Average sizes
- **Dark Mode Support**: Full dark mode theme
  - Theme toggle in top-right corner
  - Smooth transitions
  - Persists across sessions
- **Toast Notifications**: Real-time feedback for actions
- **Enhanced Error Handling**: User-friendly error messages
- **Better Downloads**: Filenames include plan specifications

### 🛠️ Developer Experience
- **Environment Variables**: `.env` files for both backend and frontend
- **Docker Support**: Complete Docker & Docker Compose setup
- **Requirements File**: `requirements.txt` for Python dependencies
- **Root Scripts**: `npm run dev`, `npm run setup` for easy development
- **Tailwind Config**: Proper dark mode configuration
- **Type Safety**: Enhanced TypeScript interfaces

### 📊 API Changes

#### Before (v1.0):
```json
// Request
POST /generate
{ "sq_ft": 2500, "bedrooms": 3, "bathrooms": 2, "garage": 2 }

// Response
{
  "image_url": "...",
  "details": { ... }
}
```

#### After (v2.0):
```json
// Request
POST /generate
{ 
  "sq_ft": 2500, 
  "bedrooms": 3, 
  "bathrooms": 2, 
  "garage": 2,
  "num_results": 6 
}

// Response
{
  "success": true,
  "results": [
    {
      "image_url": "...",
      "details": { ... },
      "metadata": {
        "match_quality": "excellent",
        "sq_ft_difference": 0,
        "rank": 1
      }
    },
    // ... 5 more results
  ],
  "summary": {
    "total_candidates": 245,
    "returned": 6,
    "best_match_diff": 0
  }
}
```

### 🎨 UI/UX Improvements
- Interactive grid cards with hover states
- Smooth animations on all state transitions
- Responsive design for mobile/tablet/desktop
- Dark mode for reduced eye strain
- Quick actions (view, download) on each card
- Real-time statistics display

### 🚀 Performance
- **Instant responses** (removed 7-10s fake delay)
- **Dataset loaded once** at startup (not per request)
- **Efficient matching** algorithm
- **Optimized images** with proper MIME types

### 📝 Documentation
- Updated README with new features
- Added PROJECT_REVAMP_VISION.md
- Added ROADMAP.md for future development
- Comprehensive CHANGELOG
- Environment variable documentation

---

## [1.0.0] - 2026-02-09

### Initial Release
- Basic Flask backend with CSV dataset
- Simple Next.js frontend
- Single result generation
- Basic filtering by bedrooms, bathrooms, garage
- Artificial loading delays for UX
