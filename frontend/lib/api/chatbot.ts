// Chatbot API - Real backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  context?: {
    level?: string;
    modules?: string[];
    upcomingExams?: string[];
  };
  language?: 'en' | 'ar' | 'fr';
  shortAnswer?: boolean; // For mobile
}

export interface ChatResponse {
  message: string;
  explanation?: string; // Detailed explanation for desktop
}

// Get auth token from store
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.state?.token || null;
    }
  } catch (e) {
    console.error('Error getting auth token:', e);
  }
  return null;
};

export const chatbotApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: request.message,
          context: request.context,
          language: request.language || 'ar',
          shortAnswer: request.shortAnswer || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        message: data.message || 'عذراً، لم أتمكن من إرسال رد.',
        explanation: data.explanation,
      };
    } catch (error) {
      console.error('Chatbot API error:', error);
      // Fallback response
      return {
        message: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        explanation: 'خطأ في الاتصال بالخادم',
      };
    }
  },
  
  getHistory: async (): Promise<ChatMessage[]> => {
    const token = getAuthToken();
    
    if (!token) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },
};
