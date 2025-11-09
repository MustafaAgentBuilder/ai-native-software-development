/**
 * TutorGPT Chat Widget - AI Tutor Chat Interface
 *
 * A floating chat widget that connects to the TutorGPT WebSocket backend.
 * Features:
 * - Real-time chat with AI tutor
 * - Persistent chat history
 * - Session management
 * - Authentication with JWT
 * - Auto-reconnect
 * - Typing indicators
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useChatWebSocket } from '../hooks/useChatWebSocket';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system' | 'error';
  content: string;
  timestamp: Date;
  responseTime?: number;
}

export const ChatWidget: React.FC = () => {
  const { isAuthenticated, token, user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    connectionStatus,
    sendMessage: sendWsMessage,
    error: wsError
  } = useChatWebSocket({
    token,
    onMessage: (data) => {
      if (data.type === 'status' && data.status === 'connected') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: data.message,
          timestamp: new Date()
        }]);
      } else if (data.type === 'response') {
        setMessages(prev => [...prev, {
          id: data.message_id || Date.now().toString(),
          type: 'agent',
          content: data.response,
          timestamp: new Date(data.timestamp),
          responseTime: data.response_time_ms
        }]);
      } else if (data.type === 'error') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'error',
          content: data.error,
          timestamp: new Date()
        }]);
      }
    },
    enabled: isAuthenticated && isOpen
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !isConnected) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to backend
    sendWsMessage({
      type: 'message',
      message: message
    });

    // Clear input
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    if (!isAuthenticated) {
      // Show login modal
      setIsOpen(true);
      return;
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <button
        className={styles.chatButton}
        onClick={toggleChat}
        aria-label="Open TutorGPT Chat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className={styles.chatButtonText}>Ask TutorGPT</span>
      </button>
    );
  }

  return (
    <div className={`${styles.chatWidget} ${isMinimized ? styles.minimized : ''}`}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderInfo}>
          <div className={styles.chatHeaderTitle}>
            <span className={styles.icon}>🤖</span>
            TutorGPT
          </div>
          <div className={styles.chatHeaderStatus}>
            <span className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`} />
            {connectionStatus}
          </div>
        </div>
        <div className={styles.chatHeaderActions}>
          <button
            className={styles.headerButton}
            onClick={toggleMinimize}
            aria-label="Minimize chat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className={styles.headerButton}
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className={styles.chatMessages}>
            {!isAuthenticated ? (
              <div className={styles.authPrompt}>
                <div className={styles.authIcon}>🔐</div>
                <h3>Sign in to start learning</h3>
                <p>Connect with TutorGPT to get personalized AI tutoring on AI-Native Software Development</p>
                <button className={styles.authButton} onClick={() => {/* Show login modal */}}>
                  Sign In
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💬</div>
                <h3>Hi {user?.name || 'there'}!</h3>
                <p>I'm TutorGPT, your AI tutor for AI-Native Software Development.</p>
                <p>Ask me anything about the book chapters, Python, AI agents, or software development!</p>
                <div className={styles.suggestedQuestions}>
                  <p className={styles.suggestedLabel}>Try asking:</p>
                  <button
                    className={styles.suggestionButton}
                    onClick={() => setMessage("What is AI-Native Development?")}
                  >
                    What is AI-Native Development?
                  </button>
                  <button
                    className={styles.suggestionButton}
                    onClick={() => setMessage("Explain Python async/await")}
                  >
                    Explain Python async/await
                  </button>
                  <button
                    className={styles.suggestionButton}
                    onClick={() => setMessage("How do I build an AI agent?")}
                  >
                    How do I build an AI agent?
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`${styles.message} ${styles[msg.type]}`}>
                    {msg.type === 'agent' && <div className={styles.messageAvatar}>🤖</div>}
                    {msg.type === 'user' && <div className={styles.messageAvatar}>👤</div>}
                    <div className={styles.messageContent}>
                      <div className={styles.messageText}>{msg.content}</div>
                      {msg.responseTime && (
                        <div className={styles.messageMeta}>
                          ⏱️ {(msg.responseTime / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {connectionStatus === 'thinking' && (
                  <div className={`${styles.message} ${styles.agent}`}>
                    <div className={styles.messageAvatar}>🤖</div>
                    <div className={styles.messageContent}>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          {isAuthenticated && (
            <div className={styles.chatInput}>
              {wsError && (
                <div className={styles.errorBanner}>
                  ⚠️ {wsError}
                </div>
              )}
              <div className={styles.inputWrapper}>
                <textarea
                  className={styles.messageInput}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  rows={1}
                  disabled={!isConnected}
                />
                <button
                  className={styles.sendButton}
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isConnected}
                  aria-label="Send message"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3l16 7-16 7V3zm2 6v4l8-2-8-2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
