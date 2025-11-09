/**
 * Authentication Context for TutorGPT
 *
 * Manages:
 * - User authentication state
 * - JWT token storage (localStorage)
 * - Login/logout/signup
 * - User profile
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface StudentProfile {
  id: string;
  level: string;
  current_chapter?: string;
  current_lesson?: string;
  learning_style?: string;
  total_questions_asked?: number;
  completed_lessons?: string[];
  completed_chapters?: string[];
  difficulty_topics?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, level: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tutorgpt_token');
    const storedUser = localStorage.getItem('tutorgpt_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Fetch fresh profile
      fetchProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();

      // Store in state
      setToken(data.access_token);
      setUser(data.user);

      // Store in localStorage
      localStorage.setItem('tutorgpt_token', data.access_token);
      localStorage.setItem('tutorgpt_user', JSON.stringify(data.user));

      // Fetch profile
      await fetchProfile(data.access_token);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, level: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, level })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
      }

      const data = await response.json();

      // Store in state
      setToken(data.access_token);
      setUser(data.user);
      setProfile(data.profile);

      // Store in localStorage
      localStorage.setItem('tutorgpt_token', data.access_token);
      localStorage.setItem('tutorgpt_user', JSON.stringify(data.user));

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('tutorgpt_token');
    localStorage.removeItem('tutorgpt_user');
  };

  const refreshProfile = async () => {
    if (!token) return;
    await fetchProfile(token);
  };

  const value: AuthContextType = {
    user,
    profile,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    signup,
    logout,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
