import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SettingsModal.css';

/**
 * Settings Modal - Inspired by Anthropic Claude
 * Tabs: Profile, Subscription Plans
 */
const SettingsModal = ({ isOpen, onClose, user, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '$0',
      duration: '14 days',
      features: [
        '✅ Access to basic AI tutor',
        '✅ 50 messages per day',
        '✅ Basic learning materials',
        '✅ Progress tracking',
        '❌ Advanced RAG features',
        '❌ Priority support',
      ],
      badge: 'Trial',
      badgeColor: '#3b82f6',
      current: user?.plan === 'free',
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$20',
      duration: 'per month',
      features: [
        '✅ Everything in Free',
        '✅ Unlimited messages',
        '✅ Advanced RAG features',
        '✅ All learning materials',
        '✅ Quiz generation',
        '✅ Email support',
      ],
      badge: 'Popular',
      badgeColor: '#10b981',
      current: user?.plan === 'basic',
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$100',
      duration: 'per month',
      features: [
        '✅ Everything in Basic',
        '✅ Priority AI responses',
        '✅ Custom learning paths',
        '✅ 1-on-1 tutoring sessions',
        '✅ Advanced analytics',
        '✅ Priority support',
        '✅ API access',
      ],
      badge: 'Best Value',
      badgeColor: '#f59e0b',
      current: user?.plan === 'pro',
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onUpdateProfile?.(formData);
    setIsSaving(false);
  };

  const handleChangePlan = (planId) => {
    // TODO: Implement subscription change
    console.log('Changing to plan:', planId);
    alert(`Subscription change coming soon! Selected: ${planId}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="settings-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="settings-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="settings-header">
            <h2>Settings</h2>
            <button className="settings-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="settings-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 10a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 0114 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Profile
            </button>
            <button
              className={`tab-button ${activeTab === 'plans' ? 'active' : ''}`}
              onClick={() => setActiveTab('plans')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM2 10h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Plans & Billing
            </button>
          </div>

          {/* Content */}
          <div className="settings-content">
            {activeTab === 'profile' && (
              <motion.div
                className="settings-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3>Profile Settings</h3>
                <p className="section-description">
                  Update your personal information and email address
                </p>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                  <span className="input-hint">
                    We'll send a verification email to confirm changes
                  </span>
                </div>

                <div className="form-actions">
                  <button
                    className="btn-secondary"
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'plans' && (
              <motion.div
                className="settings-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3>Subscription Plans</h3>
                <p className="section-description">
                  Choose the plan that works best for you
                </p>

                <div className="plans-grid">
                  {subscriptionPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`plan-card ${plan.current ? 'current-plan' : ''}`}
                    >
                      {plan.badge && (
                        <div
                          className="plan-badge"
                          style={{ backgroundColor: plan.badgeColor }}
                        >
                          {plan.badge}
                        </div>
                      )}

                      <div className="plan-header">
                        <h4>{plan.name}</h4>
                        <div className="plan-price">
                          <span className="price">{plan.price}</span>
                          <span className="duration">/{plan.duration}</span>
                        </div>
                      </div>

                      <ul className="plan-features">
                        {plan.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>

                      <button
                        className={`plan-button ${plan.current ? 'current' : ''}`}
                        onClick={() => handleChangePlan(plan.id)}
                        disabled={plan.current}
                      >
                        {plan.current ? 'Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="billing-info">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>All plans include a 14-day money-back guarantee</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
