/**
 * Agent API Client
 *
 * Handles communication with the TutorGPT backend API
 * Supports RAG search and agent chat interactions
 */

export interface AgentAction {
  action: 'summary' | 'explain' | 'main_points' | 'example' | 'ask';
  text: string;
  cursorContext?: string;
  userId?: string;
  uiHints?: {
    tone: 'student-friendly' | 'technical';
    length: 'short' | 'medium' | 'long';
  };
}

export interface AgentResponse {
  success: boolean;
  message: string;
  preview?: string; // Short preview for inline display
  fullResponse?: string; // Full response for chat window
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  action?: AgentAction['action'];
}

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AgentApiClient {
  private baseUrl: string;
  private userId: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.userId = this.getUserId();
  }

  /**
   * Get or create user ID from localStorage
   */
  private getUserId(): string {
    let userId = localStorage.getItem('tutorgpt_user_id');
    if (!userId) {
      userId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tutorgpt_user_id', userId);
    }
    return userId;
  }

  /**
   * Send an action to the agent
   */
  async sendAction(actionData: AgentAction): Promise<AgentResponse> {
    try {
      const payload = {
        ...actionData,
        userId: this.userId,
        uiHints: actionData.uiHints || {
          tone: 'student-friendly',
          length: 'short'
        }
      };

      const response = await fetch(`${this.baseUrl}/api/agent/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: data.message || data.response || '',
        preview: data.preview || this.generatePreview(data.message || data.response || ''),
        fullResponse: data.message || data.response || '',
      };
    } catch (error) {
      console.error('Error sending action to agent:', error);
      return {
        success: false,
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send a chat message to the agent
   */
  async sendChatMessage(message: string, context?: string): Promise<AgentResponse> {
    return this.sendAction({
      action: 'ask',
      text: message,
      cursorContext: context,
    });
  }

  /**
   * Search the book content using RAG
   */
  async searchBook(query: string, scope: 'current_lesson' | 'current_chapter' | 'entire_book' = 'current_chapter'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          scope,
          top_k: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching book:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate a short preview from a longer response
   */
  private generatePreview(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Get health status of the API
   */
  async getHealth(): Promise<{ status: string; details?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rag/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      return {
        status: 'error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const agentApi = new AgentApiClient();

// Mock responses for development (when backend is not available)
export const useMockResponses = process.env.REACT_APP_USE_MOCK === 'true';

export const mockAgentResponse = async (action: AgentAction): Promise<AgentResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  const responses: Record<AgentAction['action'], string> = {
    summary: `**Summary:** ${action.text.substring(0, 50)}...\n\nThis section explains the key concepts with practical examples.`,
    explain: `Let me explain this in simple terms:\n\n${action.text}\n\nThink of it like this: it's similar to how you organize your thoughts when writing an essay. Each part has a specific purpose and they work together to achieve the goal.`,
    main_points: `**Main Points:**\n\n1. First key concept from the selected text\n2. Second important idea to remember\n3. Third practical application\n\nThese are the core takeaways you should focus on!`,
    example: `Here's a practical example:\n\n\`\`\`python\n# Example code demonstrating the concept\ndef example_function():\n    print("This shows how the concept works")\n\`\`\`\n\nThis illustrates the idea by showing a real-world use case.`,
    ask: `Great question! Based on the context:\n\n"${action.text}"\n\nThe answer is that this concept is fundamental to understanding how modern AI-driven development works. It builds on the principles we discussed earlier and sets the foundation for what comes next.`,
  };

  return {
    success: true,
    message: responses[action.action],
    preview: responses[action.action].substring(0, 100) + '...',
    fullResponse: responses[action.action],
  };
};
