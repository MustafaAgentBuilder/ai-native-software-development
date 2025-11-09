/**
 * Authentication Modal
 *
 * Modal dialog for user login and signup
 */

import React, { useState } from 'react';
import styles from './AuthModal.module.css';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    level: 'beginner'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password, formData.level);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.header}>
          <h2>{mode === 'login' ? 'Welcome Back!' : 'Start Learning'}</h2>
          <p>{mode === 'login' ? 'Sign in to continue your journey' : 'Create your account to get started'}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}

          {mode === 'signup' && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className={styles.formGroup}>
              <label htmlFor="level">Experience Level</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
              >
                <option value="beginner">Beginner - New to programming</option>
                <option value="intermediate">Intermediate - Some experience</option>
                <option value="advanced">Advanced - Experienced developer</option>
              </select>
            </div>
          )}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className={styles.switchButton}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className={styles.switchButton}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
