import logging
import openai
import google.generativeai as genai
from . import config

# Configure logging
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = config.DEFAULT_LLM
        
        # Initialize API clients
        if self.provider == "openai":
            openai.api_key = config.OPENAI_API_KEY
        elif self.provider == "gemini":
            genai.configure(api_key=config.GOOGLE_API_KEY)
        
        logger.info(f"Using LLM provider: {self.provider}")
    
    def generate_text(self, prompt, temperature=0.7, max_tokens=500):
        """Generate text using the selected LLM provider"""
        try:
            if self.provider == "openai":
                return self._generate_openai(prompt, temperature, max_tokens)
            elif self.provider == "gemini":
                return self._generate_gemini(prompt, temperature, max_tokens)
            else:
                raise ValueError(f"Unknown provider: {self.provider}")
        except Exception as e:
            logger.error(f"Error generating text: {str(e)}")
            raise
    
    def _generate_openai(self, prompt, temperature, max_tokens):
        """Generate text using OpenAI"""
        try:
            logger.info(f"Sending prompt to OpenAI. Model: {config.OPENAI_MODEL}")
            
            response = openai.chat.completions.create(
                model=config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    def _generate_gemini(self, prompt, temperature, max_tokens):
        """Generate text using Google's Gemini"""
        try:
            logger.info(f"Sending prompt to Gemini. Model: {config.GEMINI_MODEL}")
            
            model = genai.GenerativeModel(
                model_name=config.GEMINI_MODEL,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": max_tokens,
                    "top_p": 0.95,
                }
            )
            
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise
    
    def switch_provider(self, provider):
        """Switch between providers"""
        if provider not in ["openai", "gemini"]:
            raise ValueError("Provider must be 'openai' or 'gemini'")
        
        self.provider = provider
        logger.info(f"Switched to LLM provider: {self.provider}")
        
        # Re-initialize the appropriate client
        if self.provider == "openai":
            openai.api_key = config.OPENAI_API_KEY
        elif self.provider == "gemini":
            genai.configure(api_key=config.GOOGLE_API_KEY)

# Create a singleton instance
llm_service = LLMService() 