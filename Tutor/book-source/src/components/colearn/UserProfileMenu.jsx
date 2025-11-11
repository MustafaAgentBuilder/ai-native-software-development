import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './UserProfileMenu.css';

/**
 * User Profile Menu - Top-right corner dropdown
 * Shows user email, settings, and logout
 * Inspired by Anthropic Claude's interface
 */
const UserProfileMenu = ({ user, onLogout, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    onOpenSettings?.();
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout?.();
  };

  if (!user) return null;

  return (
    <div className="user-profile-menu" ref={menuRef}>
      {/* Profile Button */}
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className="profile-initials">{getInitials(user.name)}</span>
          )}
        </div>
        <div className="profile-info">
          <span className="profile-name">{user.name || 'User'}</span>
          <svg
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="profile-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* User Info Section */}
            <div className="dropdown-section user-info-section">
              <div className="user-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span className="profile-initials-large">{getInitials(user.name)}</span>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{user.name || 'User'}</div>
                <div className="user-email">{user.email}</div>
                {user.plan && (
                  <div className="user-plan">
                    <span className="plan-badge">{user.plan}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="dropdown-divider" />

            {/* Menu Items */}
            <div className="dropdown-section">
              <button className="dropdown-item" onClick={handleSettingsClick}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 10a2 2 0 100-4 2 2 0 000 4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13.5 8a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span>Settings</span>
              </button>

              <button className="dropdown-item" onClick={handleLogoutClick}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileMenu;
