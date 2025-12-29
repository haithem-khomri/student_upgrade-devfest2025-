// Static mock data - no API calls

export interface ContentGenerationRequest {
  type: 'summary' | 'flashcards' | 'quiz' | 'exam-questions' | 'analysis';
  content: string; // Text content or file reference
  moduleId?: string;
  options?: {
    language?: 'en' | 'ar' | 'fr';
    difficulty?: 'easy' | 'medium' | 'hard';
    count?: number; // For flashcards/quiz questions
  };
}

export interface GeneratedContent {
  id: string;
  type: string;
  content: any; // Structure depends on type
  metadata: {
    createdAt: string;
    moduleId?: string;
    explainableInsights?: string[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const contentGeneratorApi = {
  extractPdf: async (file: File): Promise<{ text: string; filename: string; length: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/content-generator/extract-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to extract PDF' }));
      throw new Error(error.detail || 'Failed to extract PDF');
    }
    
    return await response.json();
  },
  
  generate: async (
    request: ContentGenerationRequest
  ): Promise<GeneratedContent> => {
    const formData = new FormData();
    formData.append('type', request.type);
    formData.append('content', request.content);
    if (request.moduleId) {
      formData.append('module_id', request.moduleId);
    }
    if (request.options) {
      formData.append('options', JSON.stringify(request.options));
    }
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/content-generator/generate`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to generate content' }));
      throw new Error(error.detail || 'Failed to generate content');
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      type: data.type,
      content: data.content,
      metadata: {
        createdAt: data.metadata?.createdAt || new Date().toISOString(),
        moduleId: data.metadata?.moduleId || request.moduleId,
        explainableInsights: data.metadata?.explainableInsights || [],
      },
    };
  },
  
  getHistory: async (): Promise<GeneratedContent[]> => {
    // Return empty history for now
    return [];
  },
};
