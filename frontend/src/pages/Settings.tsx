import React, { useState, useEffect } from 'react';
import { Copy, Check, Shield, Plug } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const WEBHOOK_URL = 'https://n8n-backend.v6mtnf.easypanel.host/api/webhooks/fireflies';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [openaiKey, setOpenaiKey] = useState('');
  const [firefliesKey, setFirefliesKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [openaiStatus, setOpenaiStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [firefliesStatus, setFirefliesStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('openai_api_key, fireflies_api_key')
          .eq('id', user.id)
          .single();

        if (ignore) return;
        if (error) throw error;
        
        if (data) {
          setOpenaiKey(data.openai_api_key || '');
          setFirefliesKey(data.fireflies_api_key || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [user]);

  const saveKey = async (column: string, value: string, setStatus: React.Dispatch<React.SetStateAction<'idle' | 'loading' | 'saved' | 'error'>>) => {
    if (!user) return;
    
    setStatus('loading');
    setErrorMsg('');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [column]: value })
        .eq('id', user.id);

      if (error) throw error;
      
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar a chave';
      setStatus('error');
      setErrorMsg(message);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="page-title">Configurações</h1>
      </div>

      <div className="settings-content">
        {/* OpenAI */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="icon-container">
              <Plug size={20} className="settings-icon" />
            </div>
            <h3 className="section-title">Integração OpenAI</h3>
          </div>
          <p className="section-description">Configure sua chave de API para habilitar a análise de inteligência artificial.</p>

          <form onSubmit={(e) => { e.preventDefault(); saveKey('openai_api_key', openaiKey, setOpenaiStatus); }}>
            <div className="form-group">
              <label className="label">Chave API OpenAI</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                required
              />
              <p className="help-text">Sua chave é armazenada de forma segura (RLS) no banco de dados. Apenas você tem acesso.</p>
            </div>
            {openaiStatus === 'error' && <p className="error-text">{errorMsg}</p>}
            <div className="button-container">
              <button type="submit" className="btn-primary" disabled={openaiStatus === 'loading'}>
                {openaiStatus === 'loading' ? 'Salvando...' : openaiStatus === 'saved' ? 'Chave Salva!' : 'Salvar Chave'}
              </button>
            </div>
          </form>
        </div>

        {/* Fireflies */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="icon-container">
              <Plug size={20} className="settings-icon" />
            </div>
            <h3 className="section-title">Integração Fireflies</h3>
          </div>
          <p className="section-description">Configure sua chave do Fireflies.ai para buscar as transcrições das reuniões.</p>

          <form onSubmit={(e) => { e.preventDefault(); saveKey('fireflies_api_key', firefliesKey, setFirefliesStatus); }}>
            <div className="form-group">
              <label className="label">Chave API Fireflies</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••••••••••••••••••••••••••"
                value={firefliesKey}
                onChange={(e) => setFirefliesKey(e.target.value)}
                required
              />
              <p className="help-text">Encontre sua chave em fireflies.ai → Configurações → API.</p>
            </div>
            {firefliesStatus === 'error' && <p className="error-text">{errorMsg}</p>}
            <div className="button-container">
              <button type="submit" className="btn-primary" disabled={firefliesStatus === 'loading'}>
                {firefliesStatus === 'loading' ? 'Salvando...' : firefliesStatus === 'saved' ? 'Chave Salva!' : 'Salvar Chave'}
              </button>
            </div>
          </form>
        </div>

        {/* Webhook */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="icon-container">
              <Shield size={20} className="settings-icon" />
            </div>
            <h3 className="section-title">Webhook Fireflies</h3>
          </div>
          <p className="section-description">Cole esta URL no painel do Fireflies.ai para sincronizar suas reuniões automaticamente.</p>

          <div className="form-group">
            <label className="label">URL do Endpoint</label>
            <div className="webhook-field">
              <input type="text" className="input-field readonly" value={WEBHOOK_URL} readOnly />
              <button type="button" className="btn-icon-only" onClick={copyWebhook} title="Copiar URL">
                {copied ? <Check size={18} className="success-icon" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="alert-important">
            <p><strong>Importante:</strong> Mantenha este URL em segredo. Qualquer pessoa com ele poderia injetar falsas reuniões no seu painel.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
