import { useState, useEffect } from 'react';
import { Key, Shield, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Settings.css';

const WEBHOOK_URL = 'https://n8n-backend.v6mtnf.easypanel.host/api/webhooks/fireflies';

const Settings: React.FC = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [firefliesKey, setFirefliesKey] = useState('');
  const [openaiStatus, setOpenaiStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [firefliesStatus, setFirefliesStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadKeys = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('openai_api_key, fireflies_api_key')
        .eq('id', user.id)
        .single();
      if (data?.openai_api_key) setOpenaiKey(data.openai_api_key);
      if (data?.fireflies_api_key) setFirefliesKey(data.fireflies_api_key);
    };
    loadKeys();
  }, []);

  const saveKey = async (field: 'openai_api_key' | 'fireflies_api_key', value: string, setStatus: (s: any) => void) => {
    setStatus('loading');
    setErrorMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStatus('error'); setErrorMsg('Usuário não autenticado.'); return; }

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', user.id);

    if (error) { setStatus('error'); setErrorMsg(error.message); }
    else { setStatus('saved'); setTimeout(() => setStatus('idle'), 3000); }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="settings-container">
      <div className="dashboard-content">
        <h1 className="page-title">Settings</h1>

        {/* OpenAI */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Key size={20} className="settings-icon" />
            <h3 className="section-title m-0">OpenAI Integration</h3>
          </div>
          <p className="section-text mb-4">Configure sua chave de API para habilitar a análise de inteligência artificial.</p>

          <form onSubmit={(e) => { e.preventDefault(); saveKey('openai_api_key', openaiKey, setOpenaiStatus); }}>
            <div className="form-group">
              <label className="label">OpenAI API Key</label>
              <input
                type="password"
                className="input-field"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                required
              />
              <p className="help-text">Sua chave é armazenada de forma segura (RLS) no banco de dados. Apenas você tem acesso.</p>
            </div>
            {openaiStatus === 'error' && <p className="error-text">{errorMsg}</p>}
            <button type="submit" className="btn-primary" disabled={openaiStatus === 'loading'}>
              {openaiStatus === 'loading' ? 'Salvando...' : openaiStatus === 'saved' ? 'Salvo!' : 'Salvar Chave'}
            </button>
          </form>
        </div>

        {/* Fireflies */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Key size={20} className="settings-icon" />
            <h3 className="section-title m-0">Fireflies Integration</h3>
          </div>
          <p className="section-text mb-4">Configure sua chave do Fireflies.ai para buscar as transcrições das reuniões.</p>

          <form onSubmit={(e) => { e.preventDefault(); saveKey('fireflies_api_key', firefliesKey, setFirefliesStatus); }}>
            <div className="form-group">
              <label className="label">Fireflies API Key</label>
              <input
                type="password"
                className="input-field"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={firefliesKey}
                onChange={(e) => setFirefliesKey(e.target.value)}
                required
              />
              <p className="help-text">Encontre sua chave em fireflies.ai → Configurações → API.</p>
            </div>
            {firefliesStatus === 'error' && <p className="error-text">{errorMsg}</p>}
            <button type="submit" className="btn-primary" disabled={firefliesStatus === 'loading'}>
              {firefliesStatus === 'loading' ? 'Salvando...' : firefliesStatus === 'saved' ? 'Salvo!' : 'Salvar Chave'}
            </button>
          </form>
        </div>

        {/* Webhook */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Shield size={20} className="settings-icon" />
            <h3 className="section-title m-0">Fireflies Webhook</h3>
          </div>
          <p className="section-text mb-4">Cole esta URL no painel do Fireflies.ai para sincronizar suas reuniões automaticamente.</p>

          <div className="form-group">
            <label className="label">Endpoint</label>
            <div className="webhook-field">
              <input type="text" className="input-field" value={WEBHOOK_URL} readOnly />
              <button type="button" className="btn-copy" onClick={copyWebhook}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="alert-warning">
            <strong>Importante:</strong> Mantenha este URL em segredo. Qualquer pessoa com ele poderia injetar falsas reuniões no seu painel.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
