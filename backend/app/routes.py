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
    study_mode = data.get('study_mode', False)  # Study mode flag
    active_tools = data.get('active_tools', [])  # Active study tools
    
    if not prompt:
        logger.warning("Empty prompt received")
        return jsonify({'error': 'Prompt is required'}), 400
    
    try:
        # Switch provider if requested
        if provider:
            llm_service.switch_provider(provider)
        
        # Handle study mode
        if study_mode:
            # Modify the prompt to include study tools context
            study_prompt = _create_study_prompt(prompt, active_tools)
            logger.info(f"Study mode activated with tools: {active_tools}")
            prompt = study_prompt
            
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

def _create_study_prompt(prompt, active_tools):
    """Create a specialized prompt for study mode with tools"""
    
    # Base system instruction for study assistant
    system_instruction = """You are a helpful study assistant. Your goal is to provide clear, accurate, and educational responses. 
All chat instances are automatically saved unless specifically deleted by the user."""
    
    # Add tool-specific instructions based on active tools
    tool_instructions = []
    
    if 'research' in active_tools:
        tool_instructions.append("""
- Research Tool: Provide well-researched information with references where applicable. 
  Break down complex topics into understandable parts.""")
    
    if 'summary' in active_tools:
        tool_instructions.append("""
- Text Summarizer: Create concise summaries of information or concepts.
  Highlight key points and important details in a structured format.""")
        
    if 'flashcards' in active_tools:
        tool_instructions.append("""
- Flashcard Creator: Generate study flashcards in a question/answer format.
  Format as "Q: [question]" and "A: [answer]" with clear, testable concepts.""")
    
    if 'quiz' in active_tools:
        tool_instructions.append("""
- Quiz Generator: Create quiz questions to test understanding.
  Include questions of varying difficulty with answers provided.""")
    
    # Combine all instructions
    if tool_instructions:
        system_instruction += "\n\nPlease use the following tools in your response:\n" + "".join(tool_instructions)
    
    # Create final prompt
    final_prompt = f"{system_instruction}\n\nUser question: {prompt}"
    
    return final_prompt

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