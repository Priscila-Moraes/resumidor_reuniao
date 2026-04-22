import { useState, useEffect, useRef } from 'react';
import { Search, Zap, X, Clock, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import './Dashboard.css';

const BACKEND_URL = 'https://n8n-backend.v6mtnf.easypanel.host';

interface Meeting {
  id: string;
  titulo: string;
  data: string;
  tipo_reuniao: string;
  resumo: string;
  status: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'processando') {
    return (
      <span className="status-badge status-processing">
        <Loader2 size={11} className="status-spinner" />
        Processando...
      </span>
    );
  }
  if (status === 'erro') {
    return <span className="status-badge status-error">Erro</span>;
  }
  return null;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [transcriptId, setTranscriptId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('meetings')
      .select('id, titulo, data, tipo_reuniao, resumo, status')
      .eq('user_id', user.id)
      .order('data', { ascending: false });
    if (!error && data) setMeetings(data);
    setLoading(false);
  };

  // Auto-refresh enquanto houver reuniões processando
  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    const hasProcessing = meetings.some((m) => m.status === 'processando');

    if (hasProcessing && !pollRef.current) {
      pollRef.current = setInterval(fetchMeetings, 5000);
    } else if (!hasProcessing && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [meetings]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

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

      toast.success('Processando reunião em segundo plano...');
      setTranscriptId('');
      setShowProcessForm(false);
      await fetchMeetings();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar reunião');
    } finally {
      setProcessing(false);
    }
  };

  const handleReprocess = async (e: React.MouseEvent, meetingId: string) => {
    e.stopPropagation();
    setReprocessingId(meetingId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');
      const res = await fetch(`${BACKEND_URL}/api/meetings/${meetingId}/reprocess`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao reprocessar');
      toast.info('Refazendo análise em segundo plano...');
      setMeetings((prev) => prev.map((m) => m.id === meetingId ? { ...m, status: 'processando' } : m));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReprocessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('meetings').delete().eq('id', deleteTarget);
    setMeetings((prev) => prev.filter((m) => m.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success('Reunião excluída.');
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
                {processing ? 'Enviando...' : 'Processar'}
              </button>
              <button type="button" className="btn-close" onClick={() => setShowProcessForm(false)}>
                <X size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-content">
        <h1 className="page-title">Painel de Reuniões</h1>

        {loading && <p className="section-text">Carregando...</p>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma reunião encontrada.</p>
            <p className="section-text">As reuniões aparecerão aqui após serem processadas pelo Fireflies.</p>
          </div>
        )}

        <div className="meetings-list">
          {filtered.map((meeting) => (
            <div
              key={meeting.id}
              className={`meeting-row${meeting.status === 'processando' ? ' meeting-row-processing' : ''}`}
              onClick={() => meeting.status !== 'processando' && navigate(`/meeting/${meeting.id}`)}
            >
              <div className="meeting-row-header">
                <div className="meeting-row-title-wrap">
                  <span className="meeting-row-title">{meeting.titulo}</span>
                  <StatusBadge status={meeting.status} />
                </div>
                <div className="row-actions">
                  {meeting.status !== 'processando' && (
                    <button
                      className="btn-reanalyze"
                      onClick={(e) => handleReprocess(e, meeting.id)}
                      disabled={reprocessingId === meeting.id}
                      title="Refazer análise da IA"
                    >
                      <RefreshCw size={14} className={reprocessingId === meeting.id ? 'status-spinner' : ''} />
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(meeting.id); }}
                    title="Excluir reunião"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="meeting-row-meta">
                <Clock size={13} className="meta-icon" />
                <span>{formatDate(meeting.data)}</span>
                {meeting.tipo_reuniao && (
                  <span className="meeting-tag">{meeting.tipo_reuniao}</span>
                )}
              </div>
              {meeting.resumo && meeting.status === 'concluido' && (
                <p className="meeting-row-summary">
                  <span className="summary-label">Resumo IA:</span> {meeting.resumo}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Excluir reunião"
        message="Tem certeza? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Dashboard;
