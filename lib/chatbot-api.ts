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

  constructor() {
    // Sử dụng Next.js API route thay vì gọi trực tiếp backend
    this.baseURL = '';
  }

  /**
   * Gửi tin nhắn đến chatbot
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
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
      const response = await fetch(`${this.baseURL}/api/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking chatbot health:', error);
      throw new Error('Không thể kết nối với chatbot API.');
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
