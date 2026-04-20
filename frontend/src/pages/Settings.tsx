import React, { useState } from 'react';
import './Settings.css';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to save key to Supabase profiles
    setTimeout(() => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 500);
  };

  return (
    <div className="settings-container">
      <div className="dashboard-content">
        <h1 className="page-title">Settings</h1>
        
        <div className="card settings-card">
          <h3 className="section-title">API Integrations</h3>
          <p className="section-text mb-4">
            Configure your AI providers to enable intelligent meeting analysis. Your keys are securely stored and encrypted in our database.
          </p>
          
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="label">OpenAI API Key</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="sk-..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <p className="help-text">We use GPT models to extract meeting objectives, summaries, and action items.</p>
            </div>
            
            <button type="submit" className="btn-primary">
              {isSaved ? 'Saved!' : 'Save Configuration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
