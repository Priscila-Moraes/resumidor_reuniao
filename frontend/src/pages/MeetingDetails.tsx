import { useState, useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './MeetingDetails.css';

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
}

const MeetingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcription' | 'highlights'>('transcription');

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

  if (loading) {
    return (
      <div className="details-container" style={{ padding: '2rem' }}>
        <p>Carregando reunião...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="details-container" style={{ padding: '2rem' }}>
        <button className="btn-outline back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <p style={{ marginTop: '1rem' }}>Reunião não encontrada.</p>
      </div>
    );
  }

  const transcriptLines = meeting.transcricao_bruta ? parseTranscript(meeting.transcricao_bruta) : [];

  return (
    <div className="details-container">
      <header className="top-bar">
        <button className="btn-outline back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </button>
      </header>

      <div className="details-header">
        <div>
          <h1 className="meeting-title-large">{meeting.titulo}</h1>
          <div className="meeting-meta">
            <span>{formatDate(meeting.data)}</span>
            {meeting.tipo_reuniao && (
              <span className="tag team ml-2">{meeting.tipo_reuniao}</span>
            )}
          </div>
        </div>
        <button className="btn-outline share-btn">
          <Share2 size={16} /> Compartilhar
        </button>
      </div>

      <div className="details-content">
        <div className="main-column">
          {meeting.objetivo && (
            <div className="card mb-4">
              <h3 className="section-title">Objetivo da Reunião</h3>
              <p className="section-text">{meeting.objetivo}</p>
            </div>
          )}

          <div className="card mb-4">
            <h3 className="section-title">Resumo</h3>
            <p className="section-text">{meeting.resumo}</p>
          </div>

          <div className="two-columns mb-4">
            {meeting.pontos_importantes?.length > 0 && (
              <div className="card">
                <h3 className="section-title">Pontos Importantes</h3>
                <ul className="checklist">
                  {meeting.pontos_importantes.map((ponto, i) => (
                    <li key={i}>
                      <input type="checkbox" checked readOnly />
                      <span>{ponto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.topicos_discutidos?.length > 0 && (
              <div className="card">
                <h3 className="section-title">Tópicos Discutidos</h3>
                <div className="word-cloud">
                  {meeting.topicos_discutidos.map((topico, i) => (
                    <span key={i} className={`word ${i % 3 === 0 ? 'w-large' : i % 3 === 1 ? 'w-medium' : 'w-small'}`}>
                      {topico}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-column card">
          <div className="tabs-header">
            <h3 className="section-title m-0">Transcrição</h3>
            <div className="tabs-toggle">
              <button
                className={`tab-btn ${activeTab === 'transcription' ? 'active' : ''}`}
                onClick={() => setActiveTab('transcription')}
              >
                Completa
              </button>
              <button
                className={`tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
                onClick={() => setActiveTab('highlights')}
              >
                Destaques
              </button>
            </div>
          </div>

          <div className="transcription-content">
            {activeTab === 'transcription' && transcriptLines.map((line) => (
              <div key={line.key} className="speech-bubble">
                {line.speaker && (
                  <span className="timestamp">
                    <span className="speaker">{line.speaker}</span>:
                  </span>
                )}
                <p>{line.text}</p>
              </div>
            ))}

            {activeTab === 'highlights' && meeting.pontos_importantes?.map((ponto, i) => (
              <div key={i} className="speech-bubble">
                <p>{ponto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;
