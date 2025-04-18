import os
from typing import Optional, Tuple, List, Dict, Any
from openai import OpenAI
import asyncio

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

async def get_ai_response(message: str, context: Optional[str] = None) -> str:
    """
    Get a response from the AI model without web search
    """
    try:
        messages = []
        
        # System message for initial context
        messages.append({"role": "system", "content": "You are a helpful assistant."})
        
        # Add context if provided
        if context:
            messages.append({"role": "system", "content": f"Additional context: {context}"})
        
        # Add user message
        messages.append({"role": "user", "content": message})
        
        # Call the OpenAI API
        completion = client.chat.completions.create(
            model="gpt-4.1-nano",  # Use appropriate model based on your API access
            messages=messages
        )
        
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error in get_ai_response: {str(e)}")
        raise

async def get_ai_response_with_search(message: str, context: Optional[str] = None) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Get a response from the AI model with web search integration
    """
    try:
        messages = []
        
        # System message for initial context
        messages.append({"role": "system", "content": "You are a helpful assistant with web search capability."})
        
        # Add context if provided
        if context:
            messages.append({"role": "system", "content": f"Additional context: {context}"})
        
        # Add user message
        messages.append({"role": "user", "content": message})
        
        # Call the OpenAI API with web search enabled
        completion = client.chat.completions.create(
            model="gpt-4o-mini-search-preview",  # Specifically use the search model
            web_search_options={},
            messages=messages
        )
        
        # In a real implementation, you would extract search sources from the response
        # For now, we'll return a placeholder
        sources = [
            {"title": "Source Example", "url": "https://example.com", "snippet": "Example source information"}
        ]
        
        return completion.choices[0].message.content, sources
    except Exception as e:
        print(f"Error in get_ai_response_with_search: {str(e)}")
        raise 