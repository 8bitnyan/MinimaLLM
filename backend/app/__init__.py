from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from .routes import main_bp
from .llm_service import llm_service
import logging
from . import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(test_config=None):
    # Load environment variables
    load_dotenv()
    
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS for all origins and all routes
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(main_bp)
    
    # Initialize the LLM service with the default provider
    default_provider = os.getenv("DEFAULT_LLM", "openai")
    llm_service.switch_provider(default_provider)
    
    # Simple index route
    @app.route('/')
    def index():
        return {"status": "minimaLLM API is running", "provider": llm_service.provider}
    
    return app