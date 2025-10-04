import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signup({
          email: formData.email,
          password: formData.password,
          username: formData.username
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div className="app-logo" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block' }}>
            <circle cx="32" cy="32" r="30" fill="url(#gradient)" stroke="#FFA500" strokeWidth="2"/>
            <rect x="20" y="22" width="24" height="16" rx="8" fill="white" stroke="#FFA500" strokeWidth="1.5"/>
            <circle cx="26" cy="30" r="2" fill="#FFA500"/>
            <circle cx="32" cy="30" r="2" fill="#FFA500"/>
            <circle cx="38" cy="30" r="2" fill="#FFA500"/>
            <path d="M28 38 L32 42 L36 38" fill="white" stroke="#FFA500" strokeWidth="1.5"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:"#FFD700", stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:"#FFA500", stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:"#FF8C00", stopOpacity:1}} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className="page-title">Welcome to Date Chat Pro</h1>
        <p className="page-subtitle">Premium Dating & Live Chat Experience</p>
      </div>

      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="tabs">
          <button
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Enter your username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>Or continue with</p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }}>
              📱 Google
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }}>
              📘 Facebook
            </button>
          </div>
        </div>

        {isLogin && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <a href="#" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
              Forgot Password?
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-3" style={{ marginTop: '40px' }}>
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3 className="feature-title">Live Chat</h3>
          <p className="feature-description">
            Real-time messaging with friends and in group rooms
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📹</div>
          <h3 className="feature-title">Video Calls</h3>
          <p className="feature-description">
            High-quality voice and video calling with WebRTC
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎁</div>
          <h3 className="feature-title">Virtual Gifts</h3>
          <p className="feature-description">
            Send beautiful gifts and earn coins from your fans
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;