/**
 * ChatWindow Component
 *
 * Displays chat messages and handles user input
 * Can be used in sidebar or as a floating draggable window
 */

import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { agentApi, useMockResponses, mockAgentResponse, type ChatMessage, type AgentAction } from '@/utils/agentApi';

interface ChatWindowProps {
  messages: ChatMessage[];
  onNewMessage: (message: ChatMessage) => void;
  onClearHistory?: () => void;
  isInSidebar?: boolean;
  isFloating?: boolean;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose?: () => void;
}

type DockPosition = 'left' | 'right' | 'float';

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onNewMessage,
  onClearHistory,
  isInSidebar = false,
  isFloating = false,
  initialPosition,
  initialSize,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dockPosition, setDockPosition] = useState<DockPosition>('float');
  const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
  const [size, setSize] = useState(initialSize || { width: 400, height: 600 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load persisted position and size for floating window
  useEffect(() => {
    if (isFloating && !initialPosition) {
      const savedPosition = localStorage.getItem('tutorgpt_window_position');
      const savedSize = localStorage.getItem('tutorgpt_window_size');
      const savedDock = localStorage.getItem('tutorgpt_window_dock');

      if (savedPosition) {
        try {
          setPosition(JSON.parse(savedPosition));
        } catch (e) {
          console.error('Error loading window position:', e);
        }
      }

      if (savedSize) {
        try {
          setSize(JSON.parse(savedSize));
        } catch (e) {
          console.error('Error loading window size:', e);
        }
      }

      if (savedDock) {
        setDockPosition(savedDock as DockPosition);
      }
    }
  }, [isFloating, initialPosition]);

  // Save position and size to localStorage
  useEffect(() => {
    if (isFloating) {
      localStorage.setItem('tutorgpt_window_position', JSON.stringify(position));
      localStorage.setItem('tutorgpt_window_size', JSON.stringify(size));
      localStorage.setItem('tutorgpt_window_dock', dockPosition);
    }
  }, [position, size, dockPosition, isFloating]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    onNewMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = useMockResponses
        ? await mockAgentResponse({ action: 'ask', text: inputValue.trim() })
        : await agentApi.sendChatMessage(inputValue.trim());

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: response.message || response.error || 'Sorry, I encountered an error.',
        timestamp: Date.now(),
      };

      onNewMessage(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message.',
        timestamp: Date.now(),
      };
      onNewMessage(errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDock = (position: DockPosition) => {
    setDockPosition(position);
    if (position === 'left') {
      setPosition({ x: 0, y: 80 });
      setSize({ width: 400, height: window.innerHeight - 80 });
    } else if (position === 'right') {
      setPosition({ x: window.innerWidth - 400, y: 80 });
      setSize({ width: 400, height: window.innerHeight - 80 });
    }
  };

  const renderMessage = (message: ChatMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`chat-message ${message.role}`}
    >
      <div className="message-avatar">
        {message.role === 'assistant' ? (
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" fill="#6366f1" />
            <circle cx="13" cy="14" r="1.5" fill="white" />
            <circle cx="19" cy="14" r="1.5" fill="white" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#10b981" />
            <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 19c0-2.2 2.2-4 5-4s5 1.8 5 4" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        )}
      </div>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );

  const chatContent = (
    <div className={`chat-window-content ${isInSidebar ? 'in-sidebar' : 'floating'}`}>
      {/* Header (only for floating window) */}
      {isFloating && (
        <div className="chat-window-header">
          <div className="header-title">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#6366f1" />
              <path
                d="M16 10a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3.5 5.5v2.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2.5c2-1 3.5-3 3.5-5.5a6 6 0 0 0-6-6z"
                fill="white"
              />
              <circle cx="14" cy="15" r="1.5" fill="#6366f1" />
              <circle cx="18" cy="15" r="1.5" fill="#6366f1" />
            </svg>
            <span>TutorGPT</span>
          </div>
          <div className="header-actions">
            <button
              className="dock-button"
              onClick={() => handleDock('left')}
              title="Dock left"
              aria-label="Dock window to left"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="5" height="12" />
                <rect x="9" y="2" width="5" height="12" opacity="0.3" />
              </svg>
            </button>
            <button
              className="dock-button"
              onClick={() => handleDock('right')}
              title="Dock right"
              aria-label="Dock window to right"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="5" height="12" opacity="0.3" />
                <rect x="9" y="2" width="5" height="12" />
              </svg>
            </button>
            {onClose && (
              <button
                className="close-button"
                onClick={onClose}
                title="Close"
                aria-label="Close window"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#e0e7ff" />
              <path
                d="M16 10a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3.5 5.5v2.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2.5c2-1 3.5-3 3.5-5.5a6 6 0 0 0-6-6z"
                fill="#6366f1"
              />
              <circle cx="14" cy="15" r="1.5" fill="white" />
              <circle cx="18" cy="15" r="1.5" fill="white" />
            </svg>
            <h4>Welcome to TutorGPT!</h4>
            <p>
              I'm here to help you understand the book content. Select any text to get explanations,
              summaries, or examples, or just ask me a question!
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map(renderMessage)}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat-message assistant loading"
          >
            <div className="message-avatar">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" fill="#6366f1" />
                <circle cx="13" cy="14" r="1.5" fill="white" />
                <circle cx="19" cy="14" r="1.5" fill="white" />
              </svg>
            </div>
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
        {messages.length > 0 && onClearHistory && (
          <button className="clear-button" onClick={onClearHistory} title="Clear chat history">
            Clear history
          </button>
        )}
        <div className="chat-input">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or highlight text in the book..."
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
            className="send-button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10l16-8-8 16-2-8-6-0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // Render as floating draggable window
  if (isFloating) {
    return (
      <Rnd
        size={size}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        onResizeStop={(e, direction, ref, delta, position) => {
          setSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          setPosition(position);
        }}
        minWidth={300}
        minHeight={400}
        bounds="window"
        dragHandleClassName="chat-window-header"
        className="tutorgpt-floating-window"
      >
        {chatContent}
      </Rnd>
    );
  }

  // Render inline (for sidebar)
  return chatContent;
};

export default ChatWindow;
