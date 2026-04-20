import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Brain className="logo-icon" size={32} />
          <h1>MeetMind AI</h1>
        </div>
        <p className="login-subtitle">Unlock the intelligence in every conversation.</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="label">Email</label>
            <input type="email" className="input-field" placeholder="your.email@company.com" required />
          </div>
          
          <div className="form-group">
            <label className="label">Password</label>
            <input type="password" className="input-field" placeholder="••••••••••" required />
          </div>
          
          <button type="submit" className="btn-primary w-full">Sign In</button>
        </form>
        
        <button className="btn-outline w-full mt-4">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={18} height={18} />
          Login with Google
        </button>
        
        <div className="login-footer">
          <a href="#" className="link">Forgot password?</a>
          <p>Don't have an account? <a href="#" className="link font-semibold">Sign up.</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
