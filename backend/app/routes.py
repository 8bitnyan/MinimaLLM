from flask import Blueprint, request, jsonify
from .llm_service import llm_service
import logging
import traceback

# Configure logging
logger = logging.getLogger(__name__)

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    
    # Optional parameters
    temperature = data.get('temperature', 0.7)
    max_tokens = data.get('max_tokens', 500)
    provider = data.get('provider', None)  # Optional provider override
    
    if not prompt:
        logger.warning("Empty prompt received")
        return jsonify({'error': 'Prompt is required'}), 400
    
    try:
        # Switch provider if requested
        if provider:
            llm_service.switch_provider(provider)
            
        logger.info(f"Processing prompt with {llm_service.provider}: {prompt[:50]}...")
        
        response = llm_service.generate_text(
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        logger.info(f"Generated response of length: {len(response)}")
        return jsonify({
            'response': response,
            'provider': llm_service.provider
        })
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in generate endpoint: {error_msg}")
        logger.error(traceback.format_exc())
        return jsonify({'error': error_msg}), 500

@main_bp.route('/api/health', methods=['GET'])
def health():
    try:
        return jsonify({
            'status': 'ok',
            'provider': llm_service.provider
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@main_bp.route('/api/provider', methods=['GET', 'POST'])
def provider():
    if request.method == 'GET':
        return jsonify({'provider': llm_service.provider})
    
    if request.method == 'POST':
        data = request.json
        new_provider = data.get('provider')
        
        if not new_provider:
            return jsonify({'error': 'Provider is required'}), 400
            
        try:
            llm_service.switch_provider(new_provider)
            return jsonify({'provider': llm_service.provider})
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            logger.error(f"Error switching provider: {str(e)}")
            return jsonify({'error': str(e)}), 500 