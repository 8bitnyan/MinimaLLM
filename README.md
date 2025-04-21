# minimaLLM

A minimal implementation of a language model interface, using OpenAI and Google Gemini APIs with a React frontend and Supabase for authentication and data storage.

## Features

- Simple chat interface with OpenAI and Gemini support
- User authentication with Supabase
- Persistent chat sessions per user
- Real-time updates for collaborative viewing
- Multiple chat history management
- Easy provider switching
- API key configuration
- Minimalist design with Tailwind CSS

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

## Setup

### Backend

1. Create a Python virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Set up API keys (create a `.env` file in the `backend` directory):
   ```
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google Gemini API Key
   GOOGLE_API_KEY=your_google_api_key_here
   
   # Default LLM provider (openai or gemini)
   DEFAULT_LLM=openai
   ```

4. Run the backend:
   ```
   python run.py
   ```

The backend will be available at `http://localhost:5000`.

### Supabase Setup

Before running the frontend, you need to set up Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the database tables and authentication as described in `frontend/SUPABASE_SETUP.md`
3. Create a `.env` file in the frontend directory with your Supabase URL and anon key

### Frontend

1. Install dependencies:
   ```
   cd frontend
   npm install
   npm install -D @tailwindcss/postcss autoprefixer
   ```

2. Configure Supabase (create a `.env` file in the `frontend` directory):
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` or `http://localhost:5174`.

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