/**
 * CoLearnSelectionPopover - Simple text selection for /colearn page
 *
 * Shows ONLY "Ask Tutor" button when text is highlighted
 * Sends highlighted text directly to CoLearning chat window
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CoLearnSelectionPopover.css';

const CoLearnSelectionPopover = ({ onSendToChat }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const popoverRef = useRef(null);
  const selectionTimeoutRef = useRef(null);

  // Calculate popover position
  const calculatePosition = (range) => {
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop - 60, // Above selection
      left: rect.left + scrollLeft + rect.width / 2, // Centered
    };
  };

  // Handle text selection
  const handleSelection = useCallback(() => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    selectionTimeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';

      if (text.length > 0 && text.length < 5000) {
        const range = selection?.getRangeAt(0);
        if (range) {
          const pos = calculatePosition(range);
          setPosition(pos);
          setSelectedText(text);
          setVisible(true);
        }
      } else {
        setVisible(false);
      }
    }, 200);
  }, []);

  // Handle clicking outside
  const handleClickOutside = useCallback((event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setVisible(false);
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleSelection, handleClickOutside]);

  const handleAskTutor = () => {
    if (selectedText && onSendToChat) {
      onSendToChat(selectedText);
      setVisible(false);
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        className="colearn-selection-popover"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.15 }}
      >
        <button
          onClick={handleAskTutor}
          className="ask-tutor-btn"
          title="Send to AI Tutor"
        >
          <span className="btn-icon">💬</span>
          <span className="btn-text">Ask Tutor</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoLearnSelectionPopover;
