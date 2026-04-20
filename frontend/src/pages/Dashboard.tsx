import { useState, useEffect } from 'react';
import { Search, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

const BACKEND_URL = 'https://n8n-backend.v6mtnf.easypanel.host';

interface Meeting {
  id: string;
  titulo: string;
  data: string;
  tipo_reuniao: string;
  resumo: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showProcessForm, setShowProcessForm] = useState(false);
  const [transcriptId, setTranscriptId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState('');
  const [processSuccess, setProcessSuccess] = useState('');

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('meetings')
      .select('id, titulo, data, tipo_reuniao, resumo')
      .eq('user_id', user.id)
      .order('data', { ascending: false });
    if (!error && data) setMeetings(data);
    setLoading(false);
  };

  useEffect(() => { fetchMeetings(); }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setProcessError('');
    setProcessSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      const res = await fetch(`${BACKEND_URL}/api/meetings/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ transcript_id: transcriptId }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao processar');

      setProcessSuccess('Reunião processada com sucesso!');
      setTranscriptId('');
      await fetchMeetings();
      setTimeout(() => { setShowProcessForm(false); setProcessSuccess(''); }, 2000);
    } catch (err: any) {
      setProcessError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const filtered = meetings.filter((m) =>
    m.titulo.toLowerCase().includes(search.toLowerCase()) ||
    m.resumo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar reuniões..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-process" onClick={() => setShowProcessForm(!showProcessForm)}>
          <Zap size={16} />
          Processar por ID
        </button>
      </header>

      {showProcessForm && (
        <div className="process-banner">
          <form onSubmit={handleProcess} className="process-form">
            <div className="process-form-row">
              <input
                type="text"
                className="input-field"
                placeholder="Cole o Transcript ID do Fireflies..."
                value={transcriptId}
                onChange={(e) => setTranscriptId(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={processing}>
                {processing ? 'Processando...' : 'Processar'}
              </button>
              <button type="button" className="btn-close" onClick={() => setShowProcessForm(false)}>
                <X size={18} />
              </button>
            </div>
            {processError && <p className="process-error">{processError}</p>}
            {processSuccess && <p className="process-success">{processSuccess}</p>}
          </form>
        </div>
      )}

      <div className="dashboard-content">
        <h1 className="page-title">Minhas Reuniões</h1>

        {loading && <p className="section-text">Carregando...</p>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma reunião encontrada.</p>
            <p className="section-text">As reuniões aparecerão aqui após serem processadas pelo Fireflies.</p>
          </div>
        )}

        <div className="meetings-grid">
          {filtered.map((meeting) => (
            <div
              key={meeting.id}
              className="card meeting-card"
              onClick={() => navigate(`/meeting/${meeting.id}`)}
            >
              <div className="card-header">
                <span className="meeting-date">{formatDate(meeting.data)}</span>
                {meeting.tipo_reuniao && (
                  <span className={`tag ${meeting.tipo_reuniao.toLowerCase().replace(/\s+/g, '-')}`}>
                    {meeting.tipo_reuniao}
                  </span>
                )}
              </div>
              <h3 className="meeting-title">{meeting.titulo}</h3>
              <p className="meeting-summary">{meeting.resumo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
