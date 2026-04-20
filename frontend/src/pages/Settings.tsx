import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Settings.css';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadKey = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('openai_api_key')
        .eq('id', user.id)
        .single();

      if (data?.openai_api_key) setApiKey(data.openai_api_key);
    };
    loadKey();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus('error');
      setErrorMsg('Usuário não autenticado.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ openai_api_key: apiKey })
      .eq('id', user.id);

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    }
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

            {status === 'error' && <p className="error-text">{errorMsg}</p>}

            <button type="submit" className="btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Salvando...' : status === 'saved' ? 'Salvo!' : 'Save Configuration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
