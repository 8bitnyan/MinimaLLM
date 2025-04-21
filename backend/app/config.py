import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Default LLM provider
DEFAULT_LLM = os.getenv("DEFAULT_LLM", "openai")  # openai or gemini

# Model configurations
OPENAI_MODEL = "gpt-4o-mini"
GEMINI_MODEL = "gemini-1.5-pro-latest"

# Check if API keys are set
def validate_api_keys():
    if DEFAULT_LLM == "openai" and not OPENAI_API_KEY:
        print("Warning: OPENAI_API_KEY is not set. OpenAI API calls will fail.")
        return False
    elif DEFAULT_LLM == "gemini" and not GOOGLE_API_KEY:
        print("Warning: GOOGLE_API_KEY is not set. Gemini API calls will fail.")
        return False
    return True 