/**
 * WebSocket Client for CoLearning Agent
 *
 * Provides real-time bidirectional communication with the CoLearning agent.
 * ALL responses are dynamic from LLM + RAG - NO static responses!
 */

export interface WebSocketMessage {
  type: 'connected' | 'status' | 'response' | 'error';
  status?: 'connected' | 'thinking' | 'ready';
  message: string;
  phase?: string;
  chapter?: number;
  section?: number;
  metadata?: any;
  session_id?: string;
}

export interface CoLearnWebSocketConfig {
  session_id: string;
  chapter?: number;
  language?: string;
  onMessage: (message: WebSocketMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export class CoLearnWebSocket {
  private ws: WebSocket | null = null;
  private config: CoLearnWebSocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 2000;
  private baseUrl: string;

  constructor(config: CoLearnWebSocketConfig) {
    this.config = config;
    // Get base URL from localStorage or use default
    const apiUrl = typeof window !== 'undefined'
      ? localStorage.getItem('tutorgpt_api_url') || 'http://localhost:8000'
      : 'http://localhost:8000';

    // Convert HTTP to WS
    this.baseUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    const { session_id, chapter = 1, language = 'en' } = this.config;
    const wsUrl = `${this.baseUrl}/api/colearn/ws/chat?session_id=${session_id}&chapter=${chapter}&language=${language}`;

    console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected!');
        this.reconnectAttempts = 0;
        this.config.onConnected?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Received:', data.type, data.message?.substring(0, 50) + '...');
          this.config.onMessage(data);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
          this.config.onError?.('Failed to parse server message');
        }
      };

      this.ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        this.config.onError?.('WebSocket connection error');
      };

      this.ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: code=${event.code}, reason=${event.reason}`);
        this.config.onDisconnected?.();

        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), this.reconnectDelay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          this.config.onError?.('Failed to reconnect. Please refresh the page.');
        }
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.config.onError?.('Failed to establish connection');
    }
  }

  /**
   * Send message to agent
   */
  sendMessage(message: string, chapter?: number): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected');
      this.config.onError?.('Not connected to server');
      return false;
    }

    try {
      const payload = {
        type: 'message',
        message,
        chapter: chapter || this.config.chapter || 1
      };

      console.log('📤 Sending:', message.substring(0, 50) + '...');
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      this.config.onError?.('Failed to send message');
      return false;
    }
  }

  /**
   * Update chapter context
   */
  updateChapter(chapter: number): void {
    this.config.chapter = chapter;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket...');
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }
}

/**
 * Connection states for reference:
 * - CONNECTING: 0
 * - OPEN: 1
 * - CLOSING: 2
 * - CLOSED: 3
 */
export const WebSocketState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
} as const;
