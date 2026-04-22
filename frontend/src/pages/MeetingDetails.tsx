import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Share2, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import './MeetingDetails.css';

const BACKEND_URL = 'https://n8n-backend.v6mtnf.easypanel.host';

interface Meeting {
  id: string;
  titulo: string;
  data: string;
  tipo_reuniao: string;
  objetivo: string;
  resumo: string;
  pontos_importantes: string[];
  topicos_discutidos: string[];
  transcricao_bruta: string;
  status: string;
}

const MeetingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'completa' | 'destaques'>('completa');
  const [reprocessing, setReprocessing] = useState(false);
  const toast = useToast();

  const handleReprocess = async () => {
    if (!meeting) return;
    setReprocessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');

      const res = await fetch(`${BACKEND_URL}/api/meetings/${meeting.id}/reprocess`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao reprocessar');

      toast.info('Reprocessando reunião em segundo plano...');
      setMeeting((prev) => prev ? { ...prev, status: 'processando' } : prev);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReprocessing(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = meeting?.titulo ?? 'ReuniãoAI';
    const text = meeting?.resumo ? `${meeting.resumo.slice(0, 120)}…` : 'Veja o resumo desta reunião no ReuniãoAI.';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // usuário cancelou — não faz nada
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.info('Link copiado para a área de transferência.');
    }
  };

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) setMeeting(data);
      setLoading(false);
    };
    fetchMeeting();
  }, [id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const parseTranscript = (raw: string) =>
    raw.split('\n').filter(Boolean).map((line, i) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return { key: i, speaker: '', text: line };
      return { key: i, speaker: line.slice(0, colonIdx).trim(), text: line.slice(colonIdx + 1).trim() };
    });

  if (loading) return <div className="details-loading"><p>Carregando reunião...</p></div>;

  if (!meeting) {
    return (
      <div className="details-loading">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Reunião não encontrada.</p>
      </div>
    );
  }

  const transcriptLines = meeting.transcricao_bruta ? parseTranscript(meeting.transcricao_bruta) : [];

  return (
    <div className="details-container">
      {/* Header */}
      <div className="details-header">
        <div className="details-header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 className="details-title">{meeting.titulo}</h1>
          <div className="details-meta">
            <Clock size={13} />
            <span>{formatDate(meeting.data)}</span>
            {meeting.tipo_reuniao && (
              <span className="meeting-tag">{meeting.tipo_reuniao}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(meeting.status === 'erro' || meeting.status === 'concluido') && (
            <button className="btn-reprocess" onClick={handleReprocess} disabled={reprocessing} title="Reprocessar com IA">
              <RefreshCw size={15} className={reprocessing ? 'spin' : ''} />
              {reprocessing ? 'Reprocessando...' : 'Reprocessar'}
            </button>
          )}
          <button className="btn-share" onClick={handleShare}>
            <Share2 size={16} />
            Compartilhar
          </button>
        </div>
      </div>

      {/* Body: análise + transcrição */}
      <div className="details-body">

        {/* Coluna esquerda — análise */}
        <div className="analysis-col">
          {meeting.objetivo && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">Objetivo da Reunião</h3>
              <p className="analysis-card-text">{meeting.objetivo}</p>
            </div>
          )}

          {meeting.resumo && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">Resumo</h3>
              <p className="analysis-card-text">{meeting.resumo}</p>
            </div>
          )}

          <div className="analysis-two-col">
            {meeting.pontos_importantes?.length > 0 && (
              <div className="analysis-card">
                <h3 className="analysis-card-title">Decisões-Chave</h3>
                <ul className="decision-list">
                  {meeting.pontos_importantes.map((item, i) => (
                    <li key={i} className="decision-item">
                      <CheckCircle2 size={17} className="decision-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.topicos_discutidos?.length > 0 && (
              <div className="analysis-card">
                <h3 className="analysis-card-title">Tópicos Discutidos</h3>
                <div className="word-cloud">
                  {meeting.topicos_discutidos.map((t, i) => (
                    <span key={i} className={`word ${i % 3 === 0 ? 'w-large' : i % 3 === 1 ? 'w-medium' : 'w-small'}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita — transcrição */}
        <div className="transcript-col">
          <div className="transcript-header">
            <h3 className="transcript-title">Transcrição</h3>
            <div className="tabs-toggle">
              <button
                className={`tab-btn${tab === 'completa' ? ' active' : ''}`}
                onClick={() => setTab('completa')}
              >
                Completa
              </button>
              <button
                className={`tab-btn${tab === 'destaques' ? ' active' : ''}`}
                onClick={() => setTab('destaques')}
              >
                Destaques
              </button>
            </div>
          </div>

          <div className="transcript-scroll">
            {tab === 'completa' && (
              transcriptLines.length === 0
                ? <p className="no-content">Nenhuma transcrição disponível.</p>
                : transcriptLines.map((line) => (
                    <div key={line.key} className="speech-bubble">
                      {line.speaker && <p className="speaker">{line.speaker}</p>}
                      <p className="speech-text">{line.text}</p>
                    </div>
                  ))
            )}

            {tab === 'destaques' && (
              meeting.pontos_importantes?.length > 0
                ? meeting.pontos_importantes.map((item, i) => (
                    <div key={i} className="speech-bubble">
                      <p className="speech-text">{item}</p>
                    </div>
                  ))
                : <p className="no-content">Nenhum destaque disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;
