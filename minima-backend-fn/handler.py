import json
import requests
import os

# The URL of the FastAPI backend running locally
BACKEND_URL = "http://host.docker.internal:8000"

def handle(event, context):
    """
    Proxy requests to the local FastAPI server
    """
    try:
        method = event.get('method', 'GET').upper()
        path = event.get('path', '/')
        
        # Extract body if present
        body = None
        if 'body' in event and event['body']:
            body = event['body']
            if isinstance(body, str):
                try:
                    body = json.loads(body)
                except:
                    pass
        
        # Extract headers
        headers = {}
        if 'headers' in event and event['headers']:
            headers = event['headers']
        
        # Build the target URL
        if path.startswith('/'):
            target_url = f"{BACKEND_URL}{path}"
        else:
            target_url = f"{BACKEND_URL}/{path}"
        
        # Make the request to the FastAPI backend
        response = requests.request(
            method=method,
            url=target_url,
            json=body if body else None,
            headers=headers
        )
        
        # Return the response from the FastAPI backend
        return {
            "statusCode": response.status_code,
            "body": response.text,
            "headers": dict(response.headers)
        }
    except Exception as e:
        # Return error response
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
