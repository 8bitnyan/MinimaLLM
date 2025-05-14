Group 14
You Kwang PARK, 20712623
Seoyoung KIM, 20799669


---

# minimaLLM – Your AI-Powered Study & Research Assistant

minimaLLM is an intelligent, modular assistant designed to support students, researchers, and creators in learning, researching, and building projects. With a minimalistic interface and powerful AI integrations, minimaLLM helps you study smarter, not harder.

---

## 🧠 What It Does

- **Text Summarizer**: Automatically distill complex texts, articles, or notes into clear and concise summaries.
- **Flashcard Generator**: Turn raw text or uploaded materials into smart flashcards for active recall learning.
- **AI-Powered Web Search**: Augment your queries with contextual search results and real-time information from the web.
- **Research & Project Planning Toolkit**: Structure ideas, generate outlines, and get AI-assisted support for academic or creative project design.
- **Document Upload & Parsing**: Upload PDFs, DOCX, or TXT files to extract content, summarize key points, and generate study tools.

---

## 🚀 Quick Start (with Docker)

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/) (optional, for local multi-container setup)
- API keys for OpenAI and Google Gemini (optional if you only want to use one service)
- (For Kubernetes deployment) `kubectl` and a running cluster

---

### 1. Build and Run with Docker

#### Backend (Flask)

```bash
cd backend
docker build -t minima-llm-backend .
docker run --env-file .env -p 5000:5000 minima-llm-backend
```

- The backend expects a `.env` file with:
  ```
  OPENAI_API_KEY=your_openai_api_key_here
  GOOGLE_API_KEY=your_google_api_key_here
  DEFAULT_LLM=openai
  ```

#### Frontend (Vite/React)

```bash
cd frontend
docker build -t minima-llm-frontend .
docker run -p 80:80 minima-llm-frontend
```

- The frontend expects a `.env` file with:
  ```
  VITE_SUPABASE_URL=your_supabase_url_here
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
  ```

---

### 2. Kubernetes Deployment

Kubernetes manifests are provided in the `yaml_manifests/` directory:

- `backend-deployment.yaml` – Backend deployment and service
- `frontend-deployment.yaml` – Frontend deployment and service
- `ingress.yaml` – Ingress configuration (for routing, requires an ingress controller)

#### Deploy to your cluster:

```bash
kubectl apply -f yaml_manifests/backend-deployment.yaml
kubectl apply -f yaml_manifests/frontend-deployment.yaml
kubectl apply -f yaml_manifests/ingress.yaml
```

- Make sure to set your environment variables as Kubernetes secrets or config maps as needed.

---

## 🏗️ Project Structure

```
minimaLLM/
├── backend/                  # Flask backend (Dockerized)
│   ├── app/                  # Flask application code
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Backend Docker image
├── frontend/                 # Vite/React frontend (Dockerized)
│   ├── src/                  # React source code
│   └── Dockerfile            # Frontend Docker image
├── yaml_manifests/           # Kubernetes deployment YAMLs
└── README.md
```

---

## 🌐 API Endpoints

- `GET /api/health` – Health check
- `POST /api/generate` – Generate text based on a prompt
- `GET /api/provider` – Get current LLM provider
- `POST /api/provider` – Change the provider

---

## 🧩 Supported LLM Providers

- **OpenAI**: Uses GPT-4o-mini by default (configurable in backend `.env` or `config.py`)
- **Google Gemini**: Uses gemini-1.5-pro-latest by default (configurable)

---

## 🔒 Supabase Integration

- User authentication (email/password)
- Storing chat sessions and messages
- Real-time updates for collaborative viewing
- Row-level security for data privacy

See `frontend/SUPABASE_SETUP.md` for setup instructions.

---

## 📝 License

MIT

---

