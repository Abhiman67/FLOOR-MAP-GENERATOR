# 🏠 Floor Map Generator

An intelligent floor plan generation system that matches user requirements with a curated dataset of house plans. The application uses smart matching algorithms to provide relevant floor plans based on square footage, bedrooms, bathrooms, and garage spaces.

## ✨ Features

- **Smart Matching Algorithm**: Intelligently matches user requirements with available floor plans
- **Cycling Results**: Shows different options on subsequent requests with the same parameters
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Real-time Generation**: Simulates realistic processing times for better UX
- **Flexible Search**: Falls back to similar options when exact matches aren't available
- **Image Serving**: Optimized image delivery with proper MIME types

## 🛠️ Tech Stack

### Backend
- **Flask**: Python web framework for the REST API
- **Flask-CORS**: Handle cross-origin requests from frontend
- **CSV Processing**: Dataset management and matching logic
- **Python 3.x**: Core backend language

### Frontend
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations
- **shadcn/ui**: Beautiful UI components
- **Lucide React**: Icon library

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **pnpm** (or npm/yarn)

## 🚀 Getting Started

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install flask flask-cors
   ```

4. **Verify dataset structure**
   Ensure the following structure exists:
   ```
   Backend/
   ├── app.py
   └── dataset/
       ├── house_plans_details.csv
       └── images/
           └── images/
               └── [floor plan images]
   ```

5. **Run the backend server**
   ```bash
   python app.py
   ```
   The server will start on `http://127.0.0.1:5000`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or: npm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   # or: npm run dev
   ```
   The app will be available at `http://localhost:3000`

## 📖 Usage

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`

2. **Input Your Requirements**
   - Square Feet: Enter desired floor space
   - Bedrooms: Number of bedrooms needed
   - Bathrooms: Number of bathrooms required
   - Garage Spaces: Number of garage spots

3. **Generate Floor Plan**
   - Click the generate button
   - Wait for the processing animation
   - View your matched floor plan

4. **Get More Options**
   - Use the "Generate Again" button with the same parameters to see alternative floor plans
   - Modify parameters to explore different layouts

## 📁 Project Structure

```
FLOOR MAP GENERATOR/
│
├── Backend/
│   ├── app.py                    # Flask API server
│   └── dataset/
│       ├── house_plans_details.csv  # Floor plan metadata
│       └── images/
│           └── images/           # Floor plan images
│
├── Frontend/
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Main page component
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── hero-section.tsx      # Hero/header component
│   │   ├── input-panel.tsx       # User input form
│   │   ├── loading-state.tsx     # Loading animation
│   │   ├── result-section.tsx    # Results display
│   │   └── ui/                   # Reusable UI components
│   ├── lib/
│   │   └── utils.ts              # Helper functions
│   └── package.json              # Frontend dependencies
│
└── README.md                     # This file
```

## 🗃️ Dataset Format

The `house_plans_details.csv` should contain the following columns:

| Column | Description | Type |
|--------|-------------|------|
| Image Path | Filename of the floor plan image | String |
| Square Feet | Total square footage | Integer |
| Beds | Number of bedrooms | Integer |
| Baths | Number of bathrooms | Integer |
| Garages | Number of garage spaces | Integer |

Example:
```csv
Image Path,Square Feet,Beds,Baths,Garages
floor_plan_001.jpg,2500,3,2,2
floor_plan_002.jpg,1800,2,2,1
```

## 🔍 How It Works

1. **User Input**: Frontend collects user requirements
2. **API Request**: Sends POST request to `/generate` endpoint
3. **Smart Matching**: Backend algorithm:
   - Filters plans by exact bedroom match
   - Falls back to ±1 bedroom if no exact match
   - Ranks by square footage similarity
   - Cycles through top matches on repeated requests
4. **Image Delivery**: Returns image URL and plan details
5. **Display**: Frontend shows the matched floor plan

## 🎨 Customization

### Modify Processing Time
Edit the delay formula in [Backend/app.py](Backend/app.py):
```python
fake_time = 7 + (sq_ft / 400) + random.uniform(0.5, 2.5)
```

### Update Matching Logic
Adjust the ranking criteria in the `generate()` function to prioritize different parameters.

### Styling
- Update Tailwind configuration in `tailwind.config.js`
- Modify component styles in the `components/` directory

## 🐛 Troubleshooting

**Backend Issues:**
- Ensure CSV file exists at the correct path
- Check that image files are in `dataset/images/images/`
- Verify Flask and Flask-CORS are installed

**Frontend Issues:**
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `pnpm install --force`
- Check backend is running on port 5000

**CORS Errors:**
- Verify Flask-CORS is properly configured
- Check frontend is making requests to `http://127.0.0.1:5000`

## 📝 API Endpoints

### `POST /generate`
Generate a floor plan based on requirements.

**Request Body:**
```json
{
  "sq_ft": 2500,
  "bedrooms": 3,
  "bathrooms": 2,
  "garage": 2
}
```

**Response:**
```json
{
  "image_url": "http://127.0.0.1:5000/image/floor_plan_001.jpg?t=1234567890",
  "details": {
    "filename": "floor_plan_001.jpg",
    "sq_ft": 2500,
    "bedrooms": 3,
    "bathrooms": 2,
    "garage": 2
  }
}
```

### `GET /image/<filename>`
Retrieve a specific floor plan image.

## 🚧 Future Enhancements

- [ ] Add user authentication
- [ ] Save favorite floor plans
- [ ] Advanced filtering options
- [ ] AI-powered plan generation
- [ ] Export plans to PDF
- [ ] Mobile app version
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Image upload for custom plans

## 📄 License

This project is available for personal and educational use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for home design enthusiasts**
