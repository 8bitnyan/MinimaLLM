# Group 14
- PARK, Youkwang; 20712623; ykpark@connect.ust.hk
- KIM, Seoyoung; 20799669; skimbj@connect.ust.hk
- PARK, Sangmin; 20725436; sparkat@connect.ust.hk

## Contritbutions
**PARK, Youkwang**: 
- Orchestrated the goal, design, and implementation of the project from code to deployment
- Provided basic knowledge on dockerization and K8s
- Assisted in the documentation of the report for the course submission

**KIM, Seoyoung**:
- Dockerized the frontend and backend in containers and pushed to the DockerHub
- Deployed the application Docker image using Kubernetes (Minikube) Cluster with NGINX Ingress Controller
- Produced presentation slides and video
- Refined the final report

**PARK, Sangmin**: 
- Documented the final report
- Dockerized the frontend and backend in containers and pushed to the DockerHub
- Finalized and refined the final report

## Presentation Video
<a href="https://youtu.be/LLDqHLp6DHI">Link: https://youtu.be/LLDqHLp6DHI</a>

⸻

## 📚 minimaLLM – Your AI-Powered Study & Research Assistant

minimaLLM is an intelligent and modular assistant designed to support students, researchers, and creators in learning, researching, and building projects. With a minimalistic interface and powerful AI integrations, minimaLLM helps you study smarter, not harder.

⸻

🧠 What It Does

minimaLLM brings together essential tools to streamline your workflow:
	•	📝 Text Summarizer
Automatically distill complex texts, articles, or notes into clear and concise summaries.
	•	💡 Flashcard Generator
Turn raw text or uploaded materials into smart flashcards for active recall learning.
	•	🔍 AI-Powered Web Search
Augment your queries with contextual search results and real-time information from the web.
	•	🧭 Research & Project Planning Toolkit
Structure ideas, generate outlines, and get AI-assisted support for academic or creative project design.
	•	📂 Document Upload & Parsing
Upload PDFs, DOCX, or TXT files to extract content, summarize key points, and generate study tools.

⸻

🎓 Use Cases
	•	Students preparing for exams or assignments
	•	Researchers synthesizing sources and building literature reviews
	•	Teams organizing project documentation and research workflows
	•	Self-learners building personalized learning plans

⸻

🔧 Tech Stack Overview
	•	Frontend: React.js (clean, minimal interface)
	•	Backend: FastAPI (Python) or Node.js
	•	Database: Supabase (PostgreSQL + auth + file storage)
	•	AI Services: OpenAI GPT-4o, web search APIs, summarization agents
	•	Storage: Supabase Storage or S3-compatible options

⸻

🌟 Why minimaLLM?
	•	📌 All-in-one AI companion for studying, researching, and building
	•	✨ Simple interface with powerful behind-the-scenes logic
	•	🧩 Modular architecture — easily extend with new AI tools
	•	⏱️ Saves time and enhances retention through AI-enhanced learning

⸻


## Getting Started

### Prerequisites

- Node.js and npm (for the frontend)
- Python 3.8+ (for the backend)
- API keys for OpenAI and Google Gemini (optional if you only want to use one service)

### Installation

#### Setting up the backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required Python packages:
```bash
pip install -r requirements.txt
```

4. Set up environment variables in a `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
DEFAULT_LLM=openai
```

5. Start the backend server:
```bash
python run.py
```

#### Setting up the frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install the required npm packages:
```bash
npm install
```

3. Set up environment variables in a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. Start the frontend development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

## Using the Study Assistant

1. **Sign Up/Login**: Create an account or sign in to access your study instances
2. **Create a Study Instance**: Click "New Study Instance" to start a new conversation
3. **Select Study Tools**: Choose which tools you want to use for your current study session
4. **Ask Questions**: Type your questions or topics you want to study
5. **Access Past Instances**: All your study instances are automatically saved and can be accessed from the sidebar
6. **Delete Instances**: You can delete instances you no longer need by clicking the trash icon

## Database Setup

Follow the instructions in `frontend/SUPABASE_SETUP.md` to set up your Supabase database correctly.

## Development

This project uses:
- React with Vite for the frontend
- Flask for the backend API
- Supabase for authentication and database

## Project Structure

```
minimaLLM/
├── frontend/                 # React frontend 
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   │   ├── Auth.jsx      # Authentication component
│   │   │   ├── ChatHistory.jsx # Chat history sidebar
│   │   │   ├── ChatMessages.jsx # Chat messages component
│   │   │   └── Layout.jsx    # Main layout component
│   │   ├── App.jsx           # Main React component
│   │   ├── supabase.js       # Supabase client
│   │   └── App.css           # Styles
│   └── SUPABASE_SETUP.md     # Supabase setup guide
└── backend/                  # Python Flask backend
    ├── app/                  # Flask application
    │   ├── __init__.py       # App initialization
    │   ├── config.py         # Configuration settings
    │   ├── routes.py         # API endpoints
    │   └── llm_service.py    # LLM provider service
    ├── requirements.txt      # Python dependencies
    └── run.py                # Application entry point
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/generate` - Generate text based on a prompt
- `GET /api/provider` - Get current provider
- `POST /api/provider` - Change the provider

## Supported LLM Providers

### OpenAI
Uses the GPT-4o-mini model by default. To change the model, update `OPENAI_MODEL` in `backend/app/config.py`.

### Google Gemini
Uses the gemini-1.5-pro-latest model by default. To change the model, update `GEMINI_MODEL` in `backend/app/config.py`.

## Supabase Integration

The app uses Supabase for:
1. User authentication (email/password)
2. Storing chat sessions and messages
3. Real-time updates for collaborative viewing
4. Row-level security to ensure data privacy

For detailed Supabase setup instructions, see `frontend/SUPABASE_SETUP.md`.

## License

MIT
