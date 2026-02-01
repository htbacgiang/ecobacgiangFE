/**
 * API integration cho Eco Bắc Giang Chatbot
 */

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  source_documents?: Array<{
    content: string;
    metadata: {
      source?: string;
      [key: string]: any;
    };
  }>;
  error?: string;
}

export interface HealthResponse {
  status: string;
  qa_chain_loaded: boolean;
  data_dir_exists: boolean;
  index_dir_exists: boolean;
}

class ChatbotAPI {
  private baseURL: string;
  private apiBaseUrl: string;
  private serverBaseUrl: string;

  constructor() {
    // Next.js API routes are disabled in this project. Use Server API instead.
    this.baseURL = '';
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_SERVER_URL || '';
    this.serverBaseUrl = this.apiBaseUrl.replace(/\/api\/?$/, '');
  }

  /**
   * Gửi tin nhắn đến chatbot
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // Fallback: if env is missing, keep old behavior (will likely 503)
      const url = this.apiBaseUrl ? `${this.apiBaseUrl}/chat` : '/api/chat';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw new Error('Không thể kết nối với chatbot. Vui lòng thử lại sau.');
    }
  }

  /**
   * Kiểm tra trạng thái của chatbot API
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      // Prefer Server API /health (root), since /api/health does not exist in Next.js API
      const url = this.serverBaseUrl ? `${this.serverBaseUrl}/health` : `${this.baseURL}/api/health`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Map Server API health shape -> expected HealthResponse shape (best-effort)
      if (data && data.status === 'ok' && data.message) {
        return {
          status: data.status,
          qa_chain_loaded: true,
          data_dir_exists: true,
          index_dir_exists: true,
        };
      }
      return data;
    } catch (error) {
      console.error('Error checking chatbot health:', error);
      // Don't hard-crash UI; return a "down" status
      return {
        status: 'down',
        qa_chain_loaded: false,
        data_dir_exists: false,
        index_dir_exists: false,
      };
    }
  }

  /**
   * Rebuild knowledge base (chỉ dành cho admin)
   */
  async rebuildKnowledgeBase(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/rebuild`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error rebuilding knowledge base:', error);
      throw new Error('Không thể xây dựng lại cơ sở tri thức.');
    }
  }

  /**
   * Kiểm tra kết nối đến chatbot
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const chatbotAPI = new ChatbotAPI();

// Export class for testing
export { ChatbotAPI };
