# 🗺️ Floor Map Generator — Project Roadmap

> A comprehensive roadmap to transform this project from a dataset-matching tool into a production-grade, AI-powered floor plan generation platform.

---

## 📊 Current State Assessment

### What We Have (V1.0)
- ✅ Flask backend with CSV-based dataset matching
- ✅ Next.js frontend with animations and modern UI
- ✅ Smart cycling logic (different results on repeated queries)
- ✅ Floor plan image serving and download
- ✅ Input parameters: square footage, bedrooms, bathrooms, garages

### Current Limitations
- ❌ No real AI/ML generation — only dataset matching
- ❌ No database — relies on CSV files
- ❌ No user authentication or saved sessions
- ❌ No error handling UI (errors silently reset to input)
- ❌ Hardcoded backend URL (`127.0.0.1:5000`)
- ❌ Artificial delay (`time.sleep`) instead of real processing
- ❌ No input validation on the backend
- ❌ No testing infrastructure
- ❌ No deployment pipeline

---

## 🚀 Roadmap Phases

---

## Phase 1: Foundation & Code Quality (Weeks 1–2)
> **Goal**: Stabilize the codebase, add error handling, and establish best practices.

### 1.1 Backend Improvements
- [ ] **Add input validation** — Validate all incoming request data with proper error messages
  ```python
  # Example: Use pydantic or marshmallow for schema validation
  from pydantic import BaseModel, Field

  class FloorPlanRequest(BaseModel):
      sq_ft: int = Field(ge=500, le=10000)
      bedrooms: int = Field(ge=1, le=10)
      bathrooms: int = Field(ge=1, le=8)
      garage: int = Field(ge=0, le=5)
  ```
- [ ] **Remove artificial delay** — Replace `time.sleep()` with real processing or a configurable flag
- [ ] **Add proper logging** — Replace `print()` statements with Python's `logging` module
- [ ] **Environment variables** — Use `.env` file for configuration (port, host, debug mode, paths)
- [ ] **Error handling middleware** — Centralized error responses with proper HTTP status codes
- [ ] **Add `requirements.txt`** or `pyproject.toml` for dependency management

### 1.2 Frontend Improvements
- [ ] **Environment variables** — Move API URL to `.env.local`
  ```env
  NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
  ```
- [ ] **Error state UI** — Show user-friendly error messages instead of silently resetting
- [ ] **Toast notifications** — Use the existing toast component for success/error feedback
- [ ] **Form validation** — Client-side validation before API calls
- [ ] **Loading progress** — Show estimated time or progress percentage

### 1.3 Developer Experience
- [ ] **Monorepo setup** — Add root `package.json` with scripts to run both services
- [ ] **Docker Compose** — Single command to spin up the entire stack
- [ ] **ESLint + Prettier** — Enforce consistent code formatting
- [ ] **Pre-commit hooks** — Lint and format on commit (Husky + lint-staged)

---

## Phase 2: Database & API Overhaul (Weeks 3–4)
> **Goal**: Replace CSV with a real database and build a proper REST API.

### 2.1 Database Migration
- [ ] **Choose a database**:
  - **SQLite** (simplest, good for local dev)
  - **PostgreSQL** (recommended for production)
  - **MongoDB** (if you want flexible schemas for floor plan metadata)
- [ ] **Design schema**:
  ```sql
  CREATE TABLE floor_plans (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      sq_ft INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      garages INTEGER NOT NULL,
      stories INTEGER,
      style VARCHAR(100),         -- e.g., "Modern", "Colonial", "Ranch"
      has_basement BOOLEAN,
      has_pool BOOLEAN,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **ORM Integration** — Use SQLAlchemy (Flask) for type-safe database queries
- [ ] **Data migration script** — Automatically import existing CSV data into the database
- [ ] **Seed script** — Easily populate database for development/testing

### 2.2 API Restructuring
- [ ] **RESTful endpoints**:
  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | `GET` | `/api/plans` | List all plans with pagination & filters |
  | `GET` | `/api/plans/:id` | Get a specific plan |
  | `POST` | `/api/plans/generate` | Generate/match a plan |
  | `GET` | `/api/plans/:id/image` | Serve plan image |
  | `GET` | `/api/stats` | Dataset statistics |
- [ ] **Pagination** — Return paginated results for large datasets
- [ ] **Filtering & sorting** — Allow multi-parameter filtering
- [ ] **API versioning** — Prefix routes with `/api/v1/`
- [ ] **Response format standardization**:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "total": 150, "page": 1, "per_page": 10 }
  }
  ```

### 2.3 Caching Layer
- [ ] **In-memory cache** — Cache frequent queries with Redis or Flask-Caching
- [ ] **Image caching** — Set proper `Cache-Control` headers for images
- [ ] **CDN consideration** — Serve images from a CDN for faster delivery

---

## Phase 3: AI/ML Integration (Weeks 5–8)
> **Goal**: Move from dataset matching to intelligent generation and recommendation.

### 3.1 Smart Recommendation Engine
- [ ] **Weighted scoring algorithm** — Score matches based on multiple factors:
  ```python
  def calculate_score(plan, request):
      score = 0
      score += (1 - abs(plan.sq_ft - request.sq_ft) / request.sq_ft) * 40  # 40% weight
      score += (1 if plan.bedrooms == request.bedrooms else 0.5) * 25       # 25% weight
      score += (1 if plan.bathrooms == request.bathrooms else 0.5) * 20     # 20% weight
      score += (1 if plan.garages == request.garage else 0.5) * 15          # 15% weight
      return score
  ```
- [ ] **Similarity matching** — Use cosine similarity or KNN for better matches
- [ ] **User preference learning** — Track which plans users download/like

### 3.2 AI Floor Plan Generation (Advanced)
- [ ] **Research options**:
  - **Stable Diffusion** fine-tuned on floor plan images
  - **GAN-based generation** (Pix2Pix, CycleGAN)
  - **Graph Neural Networks** for room layout generation
  - **HouseDiffusion** or similar specialized models
- [ ] **Hybrid approach** — Show matched plans + AI-generated variations
- [ ] **Text-to-floorplan** — Natural language input like "3-bedroom modern house with open kitchen"

### 3.3 AI-Powered Features
- [ ] **Room labeling** — Auto-detect and label rooms in floor plan images
- [ ] **3D visualization** — Generate 3D views from 2D floor plans
- [ ] **Cost estimation** — Estimate construction costs based on plan specs
- [ ] **Furniture suggestions** — Auto-place furniture in generated plans

---

## Phase 4: User Experience & Features (Weeks 9–12)
> **Goal**: Add features that make the app truly useful and engaging.

### 4.1 User Authentication
- [ ] **Auth system** — Implement JWT-based authentication
  - Sign up / Login / Forgot password
  - OAuth (Google, GitHub login)
- [ ] **User profiles** — Save preferences and search history
- [ ] **Role-based access** — Admin panel for managing dataset

### 4.2 Floor Plan Management
- [ ] **Favorites/Bookmarks** — Save plans for later
- [ ] **Comparison view** — Side-by-side comparison of multiple plans
- [ ] **Collections** — Organize saved plans into folders/collections
- [ ] **Sharing** — Generate shareable links for floor plans
- [ ] **Comments/Notes** — Add notes to saved plans

### 4.3 Enhanced Input Options
- [ ] **Additional parameters**:
  - Number of stories/floors
  - House style (Modern, Colonial, Ranch, etc.)
  - Basement (yes/no)
  - Pool (yes/no)
  - Budget range
  - Lot size
- [ ] **Natural language input** — "I want a 3-bedroom modern house under 2000 sqft"
- [ ] **Preset templates** — Quick-select common configurations:
  - Starter Home (1200 sqft, 2 bed, 1 bath)
  - Family Home (2500 sqft, 4 bed, 2.5 bath)
  - Luxury Estate (5000+ sqft, 5+ bed, 4+ bath)

### 4.4 Result Enhancements
- [ ] **Multiple results** — Show top 5–10 matches in a grid
- [ ] **Plan details panel** — Show dimensions, room breakdown, materials
- [ ] **Image zoom & pan** — Interactive floor plan viewer
- [ ] **PDF export** — Generate professional PDF with plan details
- [ ] **Before/After slider** — Compare different plan variations

### 4.5 UI/UX Polish
- [ ] **Dark mode** — Leverage the existing `theme-provider.tsx`
- [ ] **Responsive design audit** — Ensure perfect mobile experience
- [ ] **Keyboard navigation** — Full accessibility support
- [ ] **Onboarding tour** — First-time user guided experience
- [ ] **Skeleton loading** — Use existing skeleton component during loads
- [ ] **History panel** — Show recently generated plans

---

## Phase 5: Scalability & Production (Weeks 13–16)
> **Goal**: Make the app production-ready and scalable.

### 5.1 Backend Architecture
- [ ] **Migrate to FastAPI** — Async support, automatic docs, better performance
- [ ] **Background tasks** — Use Celery + Redis for heavy processing
- [ ] **Rate limiting** — Prevent API abuse
- [ ] **Image optimization** — Auto-resize/compress images on upload
- [ ] **File storage** — Move images to cloud storage (AWS S3, Cloudinary)

### 5.2 Frontend Architecture
- [ ] **State management** — Add Zustand or React Query for complex state
- [ ] **SSR/SSG** — Use Next.js server-side features for SEO
- [ ] **Image optimization** — Use Next.js `<Image>` component for automatic optimization
- [ ] **PWA support** — Make it installable as a mobile app
- [ ] **Offline mode** — Cache previously viewed plans

### 5.3 Testing
- [ ] **Backend tests**:
  - Unit tests with `pytest`
  - API integration tests
  - Dataset validation tests
- [ ] **Frontend tests**:
  - Component tests with React Testing Library
  - E2E tests with Playwright or Cypress
- [ ] **CI/CD Pipeline** — GitHub Actions for automated testing and deployment

### 5.4 Deployment
- [ ] **Containerization** — Dockerfiles for both services
  ```yaml
  # docker-compose.yml
  services:
    backend:
      build: ./Backend
      ports: ["5000:5000"]
    frontend:
      build: ./Frontend
      ports: ["3000:3000"]
    db:
      image: postgres:15
      volumes: [...]
  ```
- [ ] **Cloud deployment options**:
  - **Vercel** (Frontend) + **Railway/Render** (Backend)
  - **AWS** (EC2/ECS/Lambda)
  - **DigitalOcean App Platform**
- [ ] **Domain & SSL** — Custom domain with HTTPS
- [ ] **Monitoring** — Error tracking (Sentry), performance monitoring
- [ ] **Analytics** — Track user behavior (already has Vercel Analytics)

---

## Phase 6: Community & Growth (Ongoing)
> **Goal**: Build a community around the project and expand its reach.

### 6.1 Dataset Expansion
- [ ] **Crowd-sourced plans** — Allow users to upload their own floor plans
- [ ] **Dataset categories** — Organize by style, region, era
- [ ] **Partner with architects** — License professional floor plans
- [ ] **Web scraping pipeline** — Automated dataset expansion (ethically)

### 6.2 Collaboration Features
- [ ] **Real-time editing** — Collaborative floor plan annotation
- [ ] **Architect marketplace** — Connect users with professionals
- [ ] **Community gallery** — Public showcase of generated plans
- [ ] **Rating system** — Rate and review floor plans

### 6.3 Monetization (Optional)
- [ ] **Freemium model** — Basic free, premium features paid
- [ ] **API access** — Paid API tier for developers
- [ ] **HD exports** — Free low-res, paid high-res downloads
- [ ] **Consultation booking** — Connect with architects for customization

---

## 🏗️ Architecture Evolution

### Current Architecture (V1.0)
```
User → Next.js (React) → Flask API → CSV File → Image Files
```

### Target Architecture (V3.0)
```
User → Next.js (SSR) → API Gateway → FastAPI
                                        ├── PostgreSQL (metadata)
                                        ├── Redis (cache + queues)
                                        ├── S3/Cloudinary (images)
                                        ├── AI Service (generation)
                                        └── Celery Workers (background)
```

---

## 🎯 Quick Wins (Can Do This Weekend)

If you want to see immediate improvements, start with these high-impact, low-effort changes:

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 1 | Add `.env` files for config (API URL, ports) | 🔥🔥🔥 | ⏱️ 30 min |
| 2 | Add error state UI with toast notifications | 🔥🔥🔥 | ⏱️ 1 hour |
| 3 | Remove fake delay, add configurable flag | 🔥🔥 | ⏱️ 15 min |
| 4 | Add `requirements.txt` for backend | 🔥🔥🔥 | ⏱️ 5 min |
| 5 | Show matched plan details on result page | 🔥🔥🔥 | ⏱️ 1 hour |
| 6 | Show multiple results in a grid | 🔥🔥🔥🔥 | ⏱️ 2 hours |
| 7 | Add dark mode toggle | 🔥🔥 | ⏱️ 1 hour |
| 8 | Add Docker Compose for easy setup | 🔥🔥🔥 | ⏱️ 1 hour |

---

## 📅 Timeline Summary

| Phase | Duration | Focus | Milestone |
|-------|----------|-------|-----------|
| **Phase 1** | Weeks 1–2 | Code Quality & DX | Stable, well-structured codebase |
| **Phase 2** | Weeks 3–4 | Database & API | Professional REST API with database |
| **Phase 3** | Weeks 5–8 | AI/ML Integration | Intelligent matching & generation |
| **Phase 4** | Weeks 9–12 | Features & UX | Feature-rich user experience |
| **Phase 5** | Weeks 13–16 | Production & Scale | Deployed, tested, monitored |
| **Phase 6** | Ongoing | Community & Growth | Growing user base |

---

## 🛠️ Recommended Tech Stack Upgrades

| Current | Upgrade To | Why |
|---------|-----------|-----|
| Flask | **FastAPI** | Async, auto-docs, validation, faster |
| CSV | **PostgreSQL** | Scalable, queryable, reliable |
| `print()` | **Python `logging`** | Log levels, file output, production-ready |
| In-memory state | **Redis** | Persistent cache, session management |
| Local images | **Cloudinary/S3** | CDN delivery, auto-optimization |
| `fetch()` | **React Query / SWR** | Caching, retries, loading states |
| Manual deploy | **Docker + CI/CD** | Reproducible, automated deployments |

---

## 💡 Feature Ideas Backlog

> Ideas to explore as the project matures:

- 🏠 **AR Preview** — View floor plans in augmented reality on your phone
- 🗣️ **Voice Input** — "Hey, generate a 3-bedroom house plan"
- 🌍 **Localization** — Support regional building standards (US, EU, Asian layouts)
- 📐 **Interactive Editor** — Drag-and-drop room arrangement on generated plans
- 🤖 **AI Chatbot** — Conversational interface for refining requirements
- 📊 **Market Analysis** — Compare plan to avg home sizes in a given area
- 🏗️ **Material Calculator** — Estimate materials needed for construction
- ☀️ **Sunlight Simulation** — Show natural light exposure for each room
- ♿ **Accessibility Checker** — Verify plans meet accessibility standards
- 🔌 **Smart Home Integration** — Suggest smart device placements

---

> **Start small, iterate fast.** Pick Phase 1 tasks first, ship improvements weekly, and gather user feedback to prioritize what matters most.
