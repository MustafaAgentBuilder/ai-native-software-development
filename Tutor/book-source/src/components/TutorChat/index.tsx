import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import './styles.css';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

function TutorChatComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const API_URL = 'http://localhost:8000';
  const WS_URL = 'ws://localhost:8000/api/ws/chat';

  useEffect(() => {
    const token = localStorage.getItem('tutorgpt_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignup
        ? { name, email, password, level: 'beginner' }
        : { email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Authentication failed');

      const data = await response.json();
      localStorage.setItem('tutorgpt_token', data.access_token);
      localStorage.setItem('tutorgpt_user', JSON.stringify(data.user));

      setIsLoggedIn(true);
      setShowLogin(false);
      connectWebSocket(data.access_token);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const connectWebSocket = (token: string) => {
    const websocket = new WebSocket(`${WS_URL}?token=${token}`);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'status' && data.status === 'connected') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: data.message,
          timestamp: new Date()
        }]);
        setConnectionStatus('connected');
      } else if (data.type === 'status' && data.status === 'thinking') {
        setConnectionStatus('thinking');
      } else if (data.type === 'response') {
        setMessages(prev => [...prev, {
          id: data.message_id || Date.now().toString(),
          type: 'agent',
          content: data.response,
          timestamp: new Date()
        }]);
        setConnectionStatus('ready');
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    setWs(websocket);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    ws.send(JSON.stringify({
      type: 'message',
      message: message
    }));

    setMessage('');
  };

  const toggleChat = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    if (!isOpen) {
      const token = localStorage.getItem('tutorgpt_token');
      if (token && !ws) {
        connectWebSocket(token);
      }
    }

    setIsOpen(!isOpen);
  };

  if (!isOpen && !showLogin) {
    return (
      <button className="tutor-chat-button" onClick={toggleChat}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Ask TutorGPT</span>
      </button>
    );
  }

  if (showLogin) {
    return (
      <div className="tutor-modal-overlay" onClick={() => setShowLogin(false)}>
        <div className="tutor-modal" onClick={(e) => e.stopPropagation()}>
          <button className="tutor-modal-close" onClick={() => setShowLogin(false)}>×</button>
          <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>
          <form onSubmit={handleLogin}>
            {isSignup && (
              <div className="tutor-form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="tutor-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="tutor-form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="tutor-submit-btn">
              {isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <p className="tutor-switch-mode">
            {isSignup ? 'Have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-chat-widget">
      <div className="tutor-chat-header">
        <div className="tutor-chat-title">
          <span className="tutor-icon">🤖</span>
          TutorGPT
          <span className={`tutor-status ${connectionStatus}`}></span>
        </div>
        <button className="tutor-close-btn" onClick={() => setIsOpen(false)}>×</button>
      </div>

      <div className="tutor-chat-messages">
        {messages.length === 0 ? (
          <div className="tutor-empty-state">
            <div className="tutor-empty-icon">💬</div>
            <h3>Hi there!</h3>
            <p>I'm TutorGPT, your AI tutor. Ask me anything!</p>
            <div className="tutor-suggestions">
              <button onClick={() => setMessage("What is AI-Native Development?")}>
                What is AI-Native Development?
              </button>
              <button onClick={() => setMessage("Explain Python basics")}>
                Explain Python basics
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`tutor-message tutor-message-${msg.type}`}>
                <div className="tutor-message-avatar">
                  {msg.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="tutor-message-content">{msg.content}</div>
              </div>
            ))}
            {connectionStatus === 'thinking' && (
              <div className="tutor-message tutor-message-agent">
                <div className="tutor-message-avatar">🤖</div>
                <div className="tutor-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="tutor-chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask me anything..."
          disabled={connectionStatus !== 'connected' && connectionStatus !== 'ready'}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || (connectionStatus !== 'connected' && connectionStatus !== 'ready')}
        >
          📤
        </button>
      </div>
    </div>
  );
}

export default function TutorChat() {
  return (
    <BrowserOnly>
      {() => <TutorChatComponent />}
    </BrowserOnly>
  );
}
