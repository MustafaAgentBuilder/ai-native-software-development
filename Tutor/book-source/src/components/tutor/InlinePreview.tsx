/**
 * InlinePreview Component
 *
 * Shows a collapsible preview of the agent's response
 * near the selected text
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InlinePreviewProps {
  content: string;
  position: { top: number; left: number };
  onClose: () => void;
}

const InlinePreview: React.FC<InlinePreviewProps> = ({ content, position, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const displayContent = isExpanded
    ? content
    : content.length > 150
    ? content.substring(0, 150) + '...'
    : content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className="inline-preview"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 9998,
      }}
    >
      <div className="inline-preview-header">
        <div className="header-left">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" fill="#6366f1" />
            <path d="M14 14h4M14 18h4" stroke="white" strokeWidth="2" />
          </svg>
          <span>TutorGPT Response</span>
        </div>
        <button
          className="close-button"
          onClick={onClose}
          title="Close preview"
          aria-label="Close preview"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <motion.div
        className="inline-preview-content"
        animate={{ height: isExpanded ? 'auto' : '80px' }}
        transition={{ duration: 0.2 }}
      >
        <div className="content-text">{displayContent}</div>
      </motion.div>

      {content.length > 150 && (
        <div className="inline-preview-footer">
          <button className="expand-button" onClick={toggleExpanded}>
            {isExpanded ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L2 4h8L6 8z" />
                </svg>
                Show less
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 4l4 4H2l4-4z" />
                </svg>
                Show more
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default InlinePreview;
