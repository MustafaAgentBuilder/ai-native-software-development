/**
 * WebSocket Hook for TutorGPT Chat
 *
 * Manages WebSocket connection to the backend with:
 * - Auto-reconnect on failure
 * - Connection state management
 * - Message sending/receiving
 * - Error handling
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseChatWebSocketOptions {
  token: string | null;
  onMessage: (data: any) => void;
  enabled?: boolean;
}

interface WebSocketMessage {
  type: string;
  message?: string;
  current_chapter?: string;
  current_lesson?: string;
  session_id?: string;
}

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/api/ws/chat';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 3000; // 3 seconds

export const useChatWebSocket = ({
  token,
  onMessage,
  enabled = true
}: UseChatWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'thinking' | 'ready'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!token || !enabled) {
      setConnectionStatus('disconnected');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      setError(null);

      const wsUrl = `${WS_URL}?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        setError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);

          // Update connection status based on message type
          if (data.type === 'status') {
            if (data.status === 'thinking') {
              setConnectionStatus('thinking');
            } else if (data.status === 'ready') {
              setConnectionStatus('ready');
            } else if (data.status === 'connected') {
              setConnectionStatus('connected');
            }
          }

          onMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse message from server');
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Auto-reconnect if not a normal closure and haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS && enabled) {
          reconnectAttempts.current += 1;
          console.log(`Reconnecting... (attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);

          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          setError('Failed to connect after multiple attempts. Please refresh the page.');
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to establish connection');
      setConnectionStatus('disconnected');
    }
  }, [token, enabled, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    if (ws.current) {
      reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
      ws.current.close(1000, 'User disconnected');
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to chat server');
      return false;
    }

    try {
      ws.current.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, []);

  // Connect on mount if enabled
  useEffect(() => {
    if (enabled && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, token, connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
    sendMessage
  };
};
