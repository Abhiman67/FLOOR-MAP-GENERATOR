# PROJECT REVAMP VISION: From Static Search to Architectural Intelligence

## 1. The Vision
We are pivoting from a simple database search tool to a dual-engine platform for architectural innovation:
1.  **"The Spotify of Floor Plans" (Discovery):** A hyper-personalized discovery engine that understands architectural concepts (e.g., "warm minimalist", "high-flow kitchen") ensuring users never search with keywords, but with intent.
2.  **"The Midjourney of Architecture" (Creation):** A generative workspace where rough ideas, napkin sketches, and text descriptions are instantly transmuted into professional, structural-grade floor plans.

---

## 2. Current State vs. Future State

| Feature | Current State (The "Toy") | Future State (The Platform) |
| :--- | :--- | :--- |
| **Data Engine** | Static CSV file (`house_plans_details.csv`) | Vector Database (Qdrant/Pinecone) with semantic indexing |
| **Search Logic** | Exact string matching (filtering by text) | Multimodal Search (Text-to-Image, Image-to-Image) |
| **Generation** | None (Retrieval only) | Generative Adversarial Networks (HouseGAN++) & Diffusion Models |
| **User Interface** | Read-only image display | Interactive Canvas (Fabric.js), Drag-and-drop customization |
| **Intelligence** | Zero (Manual filters) | CLIP-based image understanding & ControlNet for structure |
| **Persistence** | None (Session loss on refresh) | User Accounts, Project Saving, "Starred" Collections |

---

## 3. The 3 Pillars of Reinvention

### Pillar 1: Deep Spatial Intelligence (Data)
*The system must "see" architecture, not just read metadata.*
*   **Action: Vector Embeddings:** Move away from CSV columns. Pass all existing images through a vision encoder (like **CLIP**) to convert them into vector embeddings.
*   **Action: Auto-Tagging:** Eliminate manual data entry. The AI will automatically tag images with concepts like "Open Concept," "Industrial Style," or "Good Natural Light" based on visual analysis.

### Pillar 2: Generative Capabilities (AI)
*Transition from finding to making.*
*   **Action: Sketch-to-Plan:** Implement **ControlNet** with Stable Diffusion. Users draw a rough outline or upload a picture of a napkin sketch, and the AI renders a detailed floor plan preserving the structure.
*   **Action: Topological Generation:** Utilize **HouseGAN++** or similar graph-constrained generative models to create layouts that make logical sense (e.g., ensuring bathrooms aren't connected to dining rooms) based on a bubble-diagram input.

### Pillar 3: Immersive Interaction (UX)
*Static images are dead. The future is interactive.*
*   **Action: The Editing Canvas:** Build a frontend using **Fabric.js** or **Konva.js**. When a user selects a plan, it loads as editable vectors (SVG), allowing them to move walls or resize rooms.
*   **Action: 2D to 3D Conversion:** Provide a "Visualize" button that extrudes the 2D floor plan into a basic 3D model (using Three.js or React Three Fiber) for an instant walkthrough experience.

---

## 4. The "Kill List"
*Immediate technical debt to remove.*
1.  **Fake Delays:** Remove artificial usage of `time.sleep()`. Speed is the feature.
2.  **CSV Dependency:** Stop reading from raw CSV for every request. Migrate data to a proper database or fast in-memory store.
3.  **Hardcoded Paths:** Remove absolute file paths (e.g., user-specific directory structures) to allow team collaboration.

---

## 5. Step-by-Step Execution Plan

### Step 1: Data Engineering (Foundation)
*   Clean the `house_plans_details.csv` dataset.
*   Set up a Vector Database.
*   Run an embedding script to ingest all existing images and texts into vector space.

### Step 2: Smart Search (MVP)
*   Replace standard filters with a semantic search bar ("Show me a cozy 3-bedroom house with a large kitchen").
*   Implement "Find Similar" functionality (Image-to-Image search).

### Step 3: Generative AI (The "Wow" Factor)
*   Deploy a Python microservice (FastAPI) specifically for GPU-heavy tasks.
*   Integrate a Sketch-to-Plan model feature.
*   Allow users to "remix" existing floor plans.

### Step 4: Platform Features
*   Implement authentication (NextAuth/Clerk).
*   Create a user dashboard for saved "Collections".
*   Add export options (PDF, CAD format).

---

## 6. Tech Stack Recommendations

*   **Frontend:** Next.js (React), Tailwind CSS, Framer Motion (Animations), Fabric.js (Canvas Interactivity).
*   **Backend:** Python (FastAPI/Flask) - Python is non-negotiable for the AI libraries.
*   **AI/ML:** PyTorch, HuggingFace Diffusers (ControlNet), OpenAI CLIP (Embeddings).
*   **Database:** 
    *   **Vector Store:** Qdrant (Open source & docker-izable) or Pinecone.
    *   **Metadata Store:** PostgreSQL or SQLite (for local dev).
*   **Infrastructure:** Docker (for containerizing the different services).
