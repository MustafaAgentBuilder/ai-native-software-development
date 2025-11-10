import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { CoLearnWebSocket } from '../../utils/coLearnWebSocket.ts';

/**
 * Tutor Chat Window - WebSocket-powered real-time teaching interface
 *
 * Connects directly to CoLearning Agent via WebSocket for:
 * - Real-time bidirectional communication
 * - Streaming responses from LLM + RAG
 * - NO static responses - everything dynamic from agent
 * - Session-based persistence
 */
const TutorChatWindow = ({ onClose, onQuizRequest, isFloating = false, sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'thinking', 'ready'
  const [isDocked, setIsDocked] = useState(!isFloating);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 700 });
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsClientRef = useRef(null);

  // Initialize WebSocket connection for session
  useEffect(() => {
    if (!sessionId) return;

    console.log(`🔌 Initializing WebSocket for session: ${sessionId}`);

    // Load existing messages from localStorage
    loadSessionMessages();

    // Create WebSocket client
    wsClientRef.current = new CoLearnWebSocket({
      session_id: sessionId,
      chapter: 1, // TODO: Get from context
      language: 'en',
      onMessage: handleWebSocketMessage,
      onConnected: () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus('connected');
        // Don't auto-send greeting if messages already exist
        if (messages.length === 0 && !initialized) {
          // Wait a moment then send hello
          setTimeout(() => {
            wsClientRef.current?.sendMessage('hello');
          }, 500);
        }
      },
      onDisconnected: () => {
        console.log('🔌 WebSocket disconnected');
        setConnectionStatus('disconnected');
      },
      onError: (error) => {
        console.error('❌ WebSocket error:', error);
        addMessage('system', `Connection error: ${error}`);
        setConnectionStatus('error');
      }
    });

    // Connect
    wsClientRef.current.connect();

    // Cleanup on unmount or session change
    return () => {
      console.log('🔌 Cleaning up WebSocket');
      wsClientRef.current?.disconnect();
      wsClientRef.current = null;
    };
  }, [sessionId]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = (data) => {
    console.log('📨 WebSocket message:', data.type, data.status);

    switch (data.type) {
      case 'connected':
        setConnectionStatus('connected');
        setInitialized(true);
        break;

      case 'status':
        setConnectionStatus(data.status);
        if (data.status === 'thinking') {
          setIsLoading(true);
        } else if (data.status === 'ready') {
          setIsLoading(false);
        }
        break;

      case 'response':
        // Add agent's response message
        addMessage('tutor', data.message, {
          phase: data.phase,
          chapter: data.chapter,
          section: data.section,
          metadata: data.metadata
        });
        setIsLoading(false);
        setConnectionStatus('ready');
        break;

      case 'error':
        addMessage('system', `Error: ${data.message}`);
        setIsLoading(false);
        setConnectionStatus('error');
        break;

      default:
        console.warn('⚠️ Unknown message type:', data.type);
    }
  };

  /**
   * Load messages from localStorage for this session
   */
  const loadSessionMessages = () => {
    try {
      const sessionKey = `colearn_session_${sessionId}`;
      const savedMessages = localStorage.getItem(sessionKey);

      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
        setInitialized(true);
        console.log(`📂 Loaded ${parsed.length} messages from session storage`);
      }
    } catch (e) {
      console.error('❌ Error loading session messages:', e);
    }
  };

  /**
   * Save messages to localStorage
   */
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
      const sessionKey = `colearn_session_${sessionId}`;
      localStorage.setItem(sessionKey, JSON.stringify(messages.slice(-50))); // Keep last 50
      updateSessionMetadata();
    }
  }, [messages, sessionId]);

  /**
   * Update session list metadata
   */
  const updateSessionMetadata = () => {
    try {
      const sessionsKey = 'colearn_sessions';
      const savedSessions = localStorage.getItem(sessionsKey);
      let sessions = savedSessions ? JSON.parse(savedSessions) : [];

      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.substring(0, 40) + (firstUserMsg.content.length > 40 ? '...' : '')
        : 'New Chat';

      const sessionData = {
        id: sessionId,
        title,
        lastActivity: new Date().toISOString(),
        messageCount: messages.length
      };

      if (sessionIndex >= 0) {
        sessions[sessionIndex] = sessionData;
      } else {
        sessions.unshift(sessionData);
      }

      localStorage.setItem(sessionsKey, JSON.stringify(sessions));
    } catch (e) {
      console.error('❌ Error updating session metadata:', e);
    }
  };

  /**
   * Add message to chat
   */
  const addMessage = (role, content, metadata = {}) => {
    const newMessage = {
      id: Date.now().toString(),
      role, // 'user', 'tutor', 'system'
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  /**
   * Scroll to bottom of chat
   */
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  /**
   * Send message via WebSocket
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Add user message to UI
    addMessage('user', messageText);

    // Send via WebSocket
    if (wsClientRef.current?.isConnected()) {
      wsClientRef.current.sendMessage(messageText);
      setIsLoading(true);
      setConnectionStatus('thinking');
    } else {
      addMessage('system', 'Not connected to server. Please refresh the page.');
      console.error('❌ Cannot send message: WebSocket not connected');
    }
  };

  /**
   * Handle Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Get connection status indicator
   */
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'thinking':
        return 'Agent is thinking...';
      case 'ready':
        return 'Ready';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection error';
      default:
        return 'Unknown';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
      case 'ready':
        return '#10b981'; // green
      case 'thinking':
        return '#f59e0b'; // amber
      case 'connecting':
        return '#3b82f6'; // blue
      case 'disconnected':
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  // Chat Window JSX
  const chatWindow = (
    <div className={`tutor-chat-window ${isDocked ? 'docked' : 'floating'}`}>
      <div className="tutor-chat-content">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="tutor-avatar">🤖</div>
            <div className="tutor-info">
              <h3>AI Tutor</h3>
              <p className="tutor-status">
                <span
                  className="status-dot"
                  style={{
                    backgroundColor: getConnectionStatusColor(),
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '6px'
                  }}
                />
                {getConnectionStatusText()}
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            {onClose && (
              <button className="chat-action-btn close" onClick={onClose} title="Close">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`chat-message ${msg.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="message-avatar">{msg.role === 'user' ? '👤' : msg.role === 'tutor' ? '🤖' : 'ℹ️'}</div>
                <div className="message-content">
                  {msg.phase && (
                    <div className="message-badge adaptive">{msg.phase}</div>
                  )}
                  <div className="message-text">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                    {msg.metadata?.response_time_ms && ` • ${msg.metadata.response_time_ms}ms`}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              className="chat-message tutor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question or request next lesson..."
              disabled={isLoading || connectionStatus !== 'ready' && connectionStatus !== 'connected'}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || connectionStatus !== 'ready' && connectionStatus !== 'connected'}
            >
              📤
            </button>
          </div>
          <div className="chat-hints">
            <span className="hint">
              💡 Powered by Gemini 2.0 Flash + RAG • All responses from LLM
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Return docked or floating version
  if (isDocked) {
    return chatWindow;
  }

  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      minWidth={400}
      minHeight={500}
      bounds="window"
      dragHandleClassName="chat-header"
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
        setPosition(position);
      }}
    >
      {chatWindow}
    </Rnd>
  );
};

export default TutorChatWindow;
