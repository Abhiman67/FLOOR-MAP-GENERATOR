# 🚀 Quick Start Guide - Floor Plan Generator v2.0

## What's New in v2.0?

🎯 **Multiple Results** - See 6 floor plans at once, not just 1  
📊 **Live Statistics** - Dataset insights displayed on the homepage  
🌙 **Dark Mode** - Toggle between light and dark themes  
⚡ **Instant Speed** - Removed artificial delays  
✨ **Better UX** - Grid view, tooltips, animations

---

## Installation (5 minutes)

### Option 1: Quick Start (Recommended)
```bash
# Install dependencies and run
npm install
npm run setup
npm run dev
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:5000

### Option 2: Docker (One Command)
```bash
docker-compose up --build
```

---

## Using the New Features

### 1️⃣ View Multiple Results

**Before (v1.0):** You saw 1 floor plan at a time  
**Now (v2.0):** See 6 plans in a beautiful grid!

1. Enter your requirements (sqft, beds, baths, garage)
2. Click "Generate Floor Plan"
3. Browse 6 ranked results
4. Each card shows:
   - Match quality badge (excellent/good/fair)
   - Rank (#1, #2, #3)
   - Quick specs
   - Size difference from your request

### 2️⃣ Quick Actions on Each Card

- **👁️ View** - Click to see full-size preview
- **💾 Save** - Download with descriptive filename
- **🖼️ Full Preview** - Click image or "View" for modal

### 3️⃣ Dataset Statistics

See live insights on the homepage:
- Total plans available
- Most common bedroom count
- Most common bathroom count
- Most common garage size
- Average square footage

### 4️⃣ Dark Mode

Click the **🌙/☀️ icon** in the top-right corner to toggle themes.
Your preference is saved automatically!

---

## API Usage

### Get Multiple Results
```bash
curl -X POST http://127.0.0.1:5000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "sq_ft": 2500,
    "bedrooms": 3,
    "bathrooms": 2,
    "garage": 2,
    "num_results": 10
  }'
```

### Get Dataset Statistics
```bash
curl http://127.0.0.1:5000/api/stats
```

Response:
```json
{
  "success": true,
  "total_plans": 2640,
  "bedroom_distribution": {"3": 980, "4": 750, ...},
  "bathroom_distribution": {"2": 1200, "3": 890, ...},
  "garage_distribution": {"2": 1500, "1": 800, ...},
  "sq_ft_range": {
    "min": 784,
    "max": 8500,
    "avg": 2450
  }
}
```

---

## Configuration

### Backend (.env)
```bash
# Backend/. env
FLASK_ENV=development
FLASK_DEBUG=True
HOST=127.0.0.1
PORT=5000
```

### Frontend (.env.local)
```bash
# Frontend/.env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
NEXT_PUBLIC_APP_NAME=Floor Plan Generator
```

---

## Keyboard Shortcuts

- **ESC** - Close full-screen preview modal
- **Tab** - Navigate between floor plan cards

---

## Tips & Tricks

### 🎯 Finding the Perfect Plan
1. Start with approximate specs
2. Browse the 6 results
3. Click "View" on interesting plans
4. Download your favorites

### 📊 Understanding Match Quality
- **Excellent** (Green): Within 200 sqft of your request
- **Good** (Blue): Within 500 sqft
- **Fair** (Yellow): Best available match

### 🔍 Exploring the Dataset
Check the statistics dashboard to see:
- What sizes are most common
- Typical configurations
- Available range

---

## Troubleshooting

### Backend won't start
```bash
cd Backend
pip install -r requirements.txt
python app.py
```

### Frontend shows errors
```bash
cd Frontend
rm -rf .next node_modules
pnpm install
pnpm dev
```

### Dark mode not working
Clear browser cache and refresh.

### No images showing
Verify `Backend/dataset/images/images/` contains JPG files.

---

## What's Next?

Check out [ROADMAP.md](ROADMAP.md) for upcoming features:
- AI-powered generation
- Vector search
- 3D visualization
- User accounts
- Custom editing

---

**Need Help?** Check the full [README.md](README.md) or [CHANGELOG.md](CHANGELOG.md)
