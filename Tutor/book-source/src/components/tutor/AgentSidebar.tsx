/**
 * AgentSidebar Component - Now just a floating icon
 *
 * Shows only a floating icon in bottom-left corner
 * Clicking it opens the existing TutorChat component
 */

import React from 'react';
import { motion } from 'framer-motion';

interface AgentSidebarProps {
  onClick?: () => void;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ onClick }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="tutorgpt-minimized-icon"
      onClick={onClick}
      title="Open TutorGPT"
      style={{ cursor: 'pointer' }}
    >
      <div className="icon-avatar">
        <svg
          width="48"
          height="48"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#10b981" />
          <path
            d="M16 10a6 6 0 0 0-6 6c0 2.5 1.5 4.5 3.5 5.5v2.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2.5c2-1 3.5-3 3.5-5.5a6 6 0 0 0-6-6z"
            fill="white"
          />
          <circle cx="14" cy="15" r="1.5" fill="#10b981" />
          <circle cx="18" cy="15" r="1.5" fill="#10b981" />
        </svg>
      </div>
      <div className="pulse-ring"></div>
    </motion.div>
  );
};

export default AgentSidebar;
