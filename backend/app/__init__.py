from flask import Flask
from flask_cors import CORS
import logging
from . import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Validate API keys
    config.validate_api_keys()
    
    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    logger.info(f"Flask app initialized with {config.DEFAULT_LLM} as the default LLM provider")
    return app 