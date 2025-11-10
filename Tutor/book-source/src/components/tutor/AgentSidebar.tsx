/**
 * AgentSidebar Component
 *
 * Fixed sidebar on the left side showing TutorGPT
 * Can be collapsed/expanded with smooth animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from './ChatWindow';
import type { ChatMessage } from '@/utils/agentApi';

interface AgentSidebarProps {
  onChatMessage?: (message: string) => void;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ onChatMessage }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedExpanded = localStorage.getItem('tutorgpt_sidebar_expanded');
    const savedMinimized = localStorage.getItem('tutorgpt_sidebar_minimized');

    if (savedExpanded !== null) {
      setIsExpanded(savedExpanded === 'true');
    }
    if (savedMinimized !== null) {
      setIsMinimized(savedMinimized === 'true');
    }

    // Load chat history
    const savedMessages = localStorage.getItem('tutorgpt_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('tutorgpt_sidebar_expanded', String(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('tutorgpt_sidebar_minimized', String(isMinimized));
  }, [isMinimized]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('tutorgpt_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setIsExpanded(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    onChatMessage?.(message.content);
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem('tutorgpt_chat_history');
  };

  return (
    <>
      {/* Minimized Icon */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="tutorgpt-minimized-icon"
            onClick={toggleMinimized}
            title="Open TutorGPT"
          >
            <div className="icon-avatar">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="16" fill="#6366f1" />
                <path
                  d="M16 10a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3.5 5.5v2.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2.5c2-1 3.5-3 3.5-5.5a6 6 0 0 0-6-6z"
                  fill="white"
                />
                <circle cx="14" cy="15" r="1.5" fill="#6366f1" />
                <circle cx="18" cy="15" r="1.5" fill="#6366f1" />
              </svg>
            </div>
            <div className="pulse-ring"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`tutorgpt-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            {/* Header */}
            <div className="sidebar-header">
              <div className="header-content">
                <div className="avatar">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="16" cy="16" r="16" fill="#6366f1" />
                    <path
                      d="M16 10a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3.5 5.5v2.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2.5c2-1 3.5-3 3.5-5.5a6 6 0 0 0-6-6z"
                      fill="white"
                    />
                    <circle cx="14" cy="15" r="1.5" fill="#6366f1" />
                    <circle cx="18" cy="15" r="1.5" fill="#6366f1" />
                  </svg>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="header-info"
                    >
                      <h3>TutorGPT</h3>
                      <span className="status">
                        <span className="status-dot"></span>
                        Ready to help
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="header-actions">
                <button
                  className="icon-button"
                  onClick={toggleExpanded}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                  aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {isExpanded ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M12 5l-7 7 7 7" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                {isExpanded && (
                  <button
                    className="icon-button"
                    onClick={toggleMinimized}
                    title="Minimize"
                    aria-label="Minimize to icon"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 10h12M10 4v12" strokeWidth="2" stroke="currentColor" fill="none" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="sidebar-content"
                >
                  <ChatWindow
                    messages={messages}
                    onNewMessage={handleNewMessage}
                    onClearHistory={handleClearHistory}
                    isInSidebar={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgentSidebar;
