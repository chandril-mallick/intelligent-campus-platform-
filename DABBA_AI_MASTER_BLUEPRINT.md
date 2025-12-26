# Dabba AI Ecosystem — Master Production Blueprint
**Version:** 1.0.0  
**Target:** MVP Launch & B2B SaaS Scaling  
**Stack:** Python (FastAPI), React (Vite), LangChain, FAISS, PostgreSQL, Docker  

---

## 1. Executive Summary
**Dabba AI** is India’s first self-learning institutional AI ecosystem. It serves as a "Digital Brain" for universities, automating student support, faculty workflows, and administrative document verification. The core differentiator is the **"Single API Key Auto-Learning Engine"**, allowing the AI to autonomously ingest, index, and learn from institutional data (LMS, ERP, Drives) with minimal setup.

---

## 2. System Architecture

### A. High-Level Architecture
The system follows a **Microservices-based Modular Architecture** to ensure scalability and isolation of heavy AI workloads.

```mermaid
graph TD
    Client[Web/Mobile PWA] -->|HTTPS| LB[Load Balancer / Nginx]
    LB --> API_Gateway[API Gateway]
    
    subgraph "Core Services"
        API_Gateway --> Auth[Auth Service (JWT)]
        API_Gateway --> CoreAPI[Core Backend (FastAPI)]
        API_Gateway --> Workflow[Workflow Engine]
    end
    
    subgraph "AI Processing Layer"
        CoreAPI -->|Async Task| Queue[Redis Queue]
        Queue --> RAG_Worker[RAG Ingestion Worker]
        Queue --> OCR_Worker[OCR & Verification Worker]
        Queue --> Training_Worker[Auto-Learning Worker]
    end
    
    subgraph "Data Layer"
        CoreAPI --> DB[(PostgreSQL - Relational)]
        RAG_Worker --> VectorDB[(FAISS - Vector)]
        CoreAPI --> Cache[(Redis - Cache)]
        OCR_Worker --> ObjectStore[S3 / MinIO - Docs]
    end
```

### B. Component Breakdown
1.  **Frontend (Client):** React PWA for students/faculty, Admin Dashboard for management.
2.  **API Gateway:** Handles routing, rate limiting, and SSL termination.
3.  **Core Backend (FastAPI):** Business logic, user management, orchestration.
4.  **AI Workers (Celery/Python):**
    *   **RAG Worker:** Handles embedding generation and vector storage.
    *   **OCR Worker:** Runs PaddleOCR/ViT for document verification.
    *   **Auto-Learning Worker:** Periodically syncs with external data sources.
5.  **Databases:**
    *   **PostgreSQL:** User data, logs, workflow states, relational metadata.
    *   **FAISS:** High-performance vector similarity search.
    *   **Redis:** Task queue and caching.

---

## 3. AI Components & "Auto-Learning" Engine

### A. RAG Pipeline (Retrieval-Augmented Generation)
*   **Framework:** LangChain.
*   **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` (Fast & Efficient for CPU) or OpenAI Embeddings (if budget allows).
*   **Vector Store:** FAISS (Local/Server) or pgvector (Postgres integration).
*   **Chunking Strategy:** RecursiveCharacterTextSplitter (Chunk size: 500, Overlap: 50).

### B. The "Single API Key Auto-Learning Engine"
*   **Concept:** A background daemon that uses a provided credential (API Key/Service Account) to crawl authorized data sources.
*   **Workflow:**
    1.  **Connect:** Admin inputs API Key for Google Drive / Moodle / ERP.
    2.  **Crawl:** System lists files/content recursively.
    3.  **Diff Check:** Compares file hashes with the database to identify new/modified content.
    4.  **Ingest:** Downloads -> Cleans -> Chunks -> Embeddings -> FAISS.
    5.  **Notify:** Alerts admin "New knowledge added: [Module Name]".

### C. Document Verification Pipeline
*   **Input:** Scanned Marksheets, Certificates (Images/PDF).
*   **Stage 1 (OCR):** PaddleOCR extracts text and bounding boxes.
*   **Stage 2 (Structure Analysis):** LayoutLM or simple geometric heuristics verify if the layout matches standard templates.
*   **Stage 3 (Anomaly Detection):** Checks for font inconsistencies, smudges, or pixel manipulation (using OpenCV).
*   **Output:** Verification Score (0-100%) + Highlighted Suspicious Areas.

### D. RL-Based Workflow Engine
*   **Goal:** Optimize administrative routing (e.g., Leave Application).
*   **Model:** Simple Q-Learning agent.
*   **State:** Current department load, time of day, urgency.
*   **Action:** Route to Person A vs. Person B.
*   **Reward:** Approval time (Faster = Higher Reward).

---

## 4. Backend Development Plan (FastAPI)

### A. Folder Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── auth.py         # Login, Register
│   │   │   ├── chat.py         # RAG Chat endpoints
│   │   │   ├── documents.py    # Upload, Verify
│   │   │   ├── admin.py        # Dashboard stats
│   │   │   └── workflows.py    # RL Engine interaction
│   ├── core/
│   │   ├── config.py           # Env vars
│   │   ├── security.py         # JWT handling
│   │   └── db.py               # Database connection
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic models
│   ├── services/
│   │   ├── rag_service.py      # LangChain logic
│   │   ├── ocr_service.py      # PaddleOCR logic
│   │   └── auto_learner.py     # Crawler logic
│   └── main.py
├── alembic/                    # DB Migrations
├── tests/
├── requirements.txt
└── Dockerfile
```

### B. Key API Endpoints
*   `POST /api/v1/auth/login`: Returns JWT.
*   `POST /api/v1/chat/query`: Input: `{query, context_id}` -> Output: `{answer, sources}`.
*   `POST /api/v1/documents/verify`: Input: `File` -> Output: `{authenticity_score, report}`.
*   `POST /api/v1/admin/ingest`: Trigger manual learning from source.

### C. Database Schema (PostgreSQL)
*   **Users:** `id, email, role (student/faculty/admin), password_hash`
*   **Institutions:** `id, name, api_config (JSON)`
*   **Documents:** `id, user_id, type, s3_url, verification_status`
*   **KnowledgeBase:** `id, institution_id, source_type, last_synced`
*   **ChatLogs:** `id, user_id, query, response, timestamp`

---

## 5. Frontend Development Plan (React + Vite)

### A. Folder Structure
```
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                 # Reusable UI (Buttons, Cards)
│   │   ├── chat/               # Chat interface components
│   │   └── dashboard/          # Charts, Tables
│   ├── hooks/                  # Custom hooks (useAuth, useChat)
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── StudentPortal.jsx
│   │   ├── FacultyDashboard.jsx
│   │   └── AdminConsole.jsx
│   ├── store/                  # Zustand store
│   ├── services/               # API calls (Axios)
│   └── App.jsx
├── public/
│   └── manifest.json           # PWA Config
└── tailwind.config.js
```

### B. UI/UX Modules
1.  **Student AI Assistant:**
    *   Floating Chat Bubble (Intercom style).
    *   Voice Input/Output support.
    *   Reference links to uploaded PDFs.
2.  **Document Verification Portal:**
    *   Drag & Drop zone.
    *   Visual overlay showing "Red Flags" on the document image.
3.  **Admin Dashboard:**
    *   Real-time graph of "Queries Answered".
    *   "Knowledge Health" meter (showing last sync status).

---

## 6. DevOps & Deployment

### A. Docker Strategy
*   **Container 1 (Backend):** FastAPI + Uvicorn.
*   **Container 2 (Frontend):** Nginx serving React build.
*   **Container 3 (Worker):** Celery worker for AI tasks.
*   **Container 4 (Redis):** Message broker.
*   **Container 5 (Postgres):** Database.

### B. CI/CD Pipeline (GitHub Actions)
*   **On Push to Main:**
    1.  Run Pytest (Backend).
    2.  Run ESLint (Frontend).
    3.  Build Docker Images.
    4.  Push to Registry (Docker Hub / ECR).
    5.  Deploy to Staging (Render / AWS EC2).

### C. Scaling
*   **Horizontal:** Spin up more API and Worker containers behind a Load Balancer.
*   **Vertical:** Increase RAM for FAISS vector search if index grows large.
*   **Multi-Tenancy:** Use `institution_id` in every DB query to isolate data logically.

---

## 7. Security & Compliance

### A. Data Privacy
*   **Isolation:** Each institution's vector index is stored separately (or namespaced).
*   **Encryption:** AES-256 for stored documents. TLS 1.3 for all API traffic.
*   **PII Redaction:** Auto-detect and mask names/phones in chat logs before storage.

### B. Access Control
*   **RBAC:**
    *   *Student:* Read-only access to public knowledge + personal data.
    *   *Faculty:* Can upload course material + verify docs.
    *   *Admin:* Full system config + analytics.

---

## 8. MVP Build Roadmap (8 Weeks)

| Phase | Week | Key Tasks |
| :--- | :--- | :--- |
| **Foundation** | 1 | Repo setup, Docker config, DB Schema design, Auth API. |
| **Core AI** | 2 | RAG Pipeline implementation, FAISS integration, PDF ingestion. |
| **Backend Logic** | 3 | Chat endpoints, Context management, "Auto-Learning" crawler (Basic). |
| **Frontend V1** | 4 | React setup, Chat UI, Login pages, Dashboard skeleton. |
| **Integration** | 5 | Connect Frontend to Backend, Real-time chat testing, PWA setup. |
| **Advanced AI** | 6 | OCR & Document Verification module, RL Workflow prototype. |
| **Polish** | 7 | UI/UX improvements, Error handling, Loading states, Security audit. |
| **Launch** | 8 | Deployment to Cloud, Documentation, Final QA, Beta Release. |

---

## 9. B2B SaaS Launch Strategy

### A. Onboarding Workflow
1.  **Sign Up:** Institution Admin creates account.
2.  **Config:** Uploads Logo, Sets Brand Colors (White-labeling).
3.  **Data Sync:** Enters API Keys for LMS/Drive or uploads bulk PDFs.
4.  **Deploy:** System trains for 1-2 hours.
5.  **Invite:** Admin sends invite links to students/faculty.

### B. Pricing Model
*   **Freemium:** Up to 500 queries/month (Free).
*   **Standard:** ₹10/student/month (Unlimited Chat, Basic Verification).
*   **Enterprise:** Custom pricing (Full Auto-Learning, Dedicated Support, On-prem option).

### C. Pitch Deck Highlights
*   "Stop answering the same email 1000 times."
*   "The AI that learns your campus overnight."
*   "NEP 2020 Ready: Digital Infrastructure for the Future."

---
