const API_URL = import.meta.env.VITE_API_URL || 'http://minimallmbackend.com';

interface GenerateOptions {
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  provider?: string;
  study_mode?: boolean;
  active_tools?: string[];
}

interface ApiResponse {
  response: string;
  provider: string;
  error?: string;
}

export const api = {
  /**
   * Check backend health status
   */
  async checkHealth(): Promise<{status: string; provider: string}> {
    const response = await fetch(`${API_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Generate text using the LLM
   */
  async generate(options: GenerateOptions): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate response');
    }
    
    return response.json();
  },
  
  /**
   * Get current provider
   */
  async getProvider(): Promise<{provider: string}> {
    const response = await fetch(`${API_URL}/api/provider`);
    
    if (!response.ok) {
      throw new Error(`Failed to get provider: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Switch provider
   */
  async switchProvider(provider: 'openai' | 'google'): Promise<{provider: string}> {
    const response = await fetch(`${API_URL}/api/provider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to switch provider to ${provider}`);
    }
    
    return response.json();
  },
};

export default api;