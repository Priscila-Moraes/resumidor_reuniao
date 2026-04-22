import { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, Clock, Share2, RefreshCw,
  FileDown, Star, ListChecks, AlertCircle, MessageSquare,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import './MeetingDetails.css';

const BACKEND_URL = 'https://n8n-backend.v6mtnf.easypanel.host';

interface ItemAcao {
  tarefa: string;
  responsavel: string;
  prazo: string;
}

interface AproveitamentoCriterios {
  objetivos_claros: boolean;
  decisoes_tomadas: boolean;
  responsaveis_definidos: boolean;
  prazos_definidos: boolean;
  foco_mantido: boolean;
}

interface Meeting {
  id: string;
  titulo: string;
  data: string;
  tipo_reuniao: string;
  objetivo: string;
  resumo_executivo: string;
  topicos_discutidos: string[];
  decisoes: string;
  itens_acao: ItemAcao[];
  pendencias: string[];
  aproveitamento_nota: number;
  aproveitamento_motivo: string;
  aproveitamento_criterios: AproveitamentoCriterios;
  transcricao_bruta: string;
  duration: number;
  status: string;
}

const criteriosLabels: Record<keyof AproveitamentoCriterios, string> = {
  objetivos_claros: 'Objetivos claros',
  decisoes_tomadas: 'Decisões tomadas',
  responsaveis_definidos: 'Responsáveis definidos',
  prazos_definidos: 'Prazos definidos',
  foco_mantido: 'Foco mantido',
};

const MeetingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'completa' | 'destaques'>('completa');
  const [reprocessing, setReprocessing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
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
    const text = meeting?.resumo_executivo
      ? `${meeting.resumo_executivo.slice(0, 120)}…`
      : 'Veja o resumo desta reunião no ReuniãoAI.';

    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch { /* cancelado */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.info('Link copiado para a área de transferência.');
    }
  };

  const handleExportPDF = async () => {
    if (!meeting) return;
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const margin = 15;
      let y = 20;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(meeting.titulo, margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`${formatDate(meeting.data)}  •  ${meeting.tipo_reuniao || ''}  •  Aproveitamento: ${meeting.aproveitamento_nota ?? '—'}/100`, margin, y);
      y += 10;

      if (meeting.objetivo) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Objetivo', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const objLines = doc.splitTextToSize(meeting.objetivo, 180);
        doc.text(objLines, margin, y);
        y += objLines.length * 5 + 6;
      }

      if (meeting.resumo_executivo) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Resumo Executivo', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const resLines = doc.splitTextToSize(meeting.resumo_executivo, 180);
        doc.text(resLines, margin, y);
        y += resLines.length * 5 + 6;
      }

      if (meeting.itens_acao?.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Itens de Ação', margin, y);
        y += 4;
        autoTable(doc, {
          startY: y,
          head: [['Tarefa', 'Responsável', 'Prazo']],
          body: meeting.itens_acao.map((i) => [i.tarefa, i.responsavel, i.prazo]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      if (meeting.pendencias?.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Pendências', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        meeting.pendencias.forEach((p) => {
          const lines = doc.splitTextToSize(`• ${p}`, 180);
          doc.text(lines, margin, y);
          y += lines.length * 5 + 2;
        });
      }

      doc.save(`${meeting.titulo.replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar PDF. Verifique se jspdf está instalado.');
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

  const toggleItem = (i: number) =>
    setCheckedItems((prev) => ({ ...prev, [i]: !prev[i] }));

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
  const nota = meeting.aproveitamento_nota ?? null;
  const notaColor = nota === null ? '#94a3b8' : nota >= 80 ? '#16a34a' : nota >= 60 ? '#d97706' : '#dc2626';

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
            {meeting.duration > 0 && <span>{meeting.duration} min</span>}
            {meeting.tipo_reuniao && (
              <span className="meeting-tag">{meeting.tipo_reuniao}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {(meeting.status === 'erro' || meeting.status === 'concluido') && (
            <button className="btn-reprocess" onClick={handleReprocess} disabled={reprocessing} title="Reprocessar com IA">
              <RefreshCw size={15} className={reprocessing ? 'spin' : ''} />
              {reprocessing ? 'Reprocessando...' : 'Reprocessar'}
            </button>
          )}
          <button className="btn-action" onClick={handleExportPDF} title="Exportar PDF">
            <FileDown size={16} />
            PDF
          </button>
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

          {/* Aproveitamento */}
          {nota !== null && (
            <div className="analysis-card aproveitamento-card">
              <div className="aproveitamento-header">
                <div>
                  <h3 className="analysis-card-title">
                    <Star size={16} className="card-title-icon" />
                    Aproveitamento da Reunião
                  </h3>
                  {meeting.aproveitamento_motivo && (
                    <p className="analysis-card-text" style={{ marginTop: '0.25rem' }}>
                      {meeting.aproveitamento_motivo}
                    </p>
                  )}
                </div>
                <div className="nota-badge" style={{ color: notaColor, borderColor: notaColor }}>
                  {nota}<span style={{ fontSize: '0.75rem' }}>/100</span>
                </div>
              </div>

              {meeting.aproveitamento_criterios && (
                <div className="criterios-grid">
                  {(Object.keys(criteriosLabels) as Array<keyof AproveitamentoCriterios>).map((key) => (
                    <div key={key} className={`criterio-item ${meeting.aproveitamento_criterios[key] ? 'criterio-ok' : 'criterio-fail'}`}>
                      <span className="criterio-dot" />
                      {criteriosLabels[key]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Objetivo */}
          {meeting.objetivo && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">Objetivo da Reunião</h3>
              <p className="analysis-card-text">{meeting.objetivo}</p>
            </div>
          )}

          {/* Resumo executivo */}
          {meeting.resumo_executivo && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">Resumo Executivo</h3>
              <p className="analysis-card-text" style={{ whiteSpace: 'pre-line' }}>{meeting.resumo_executivo}</p>
            </div>
          )}

          <div className="analysis-two-col">
            {/* Decisões */}
            {meeting.decisoes && (
              <div className="analysis-card">
                <h3 className="analysis-card-title">
                  <CheckCircle2 size={15} className="card-title-icon" style={{ color: '#16a34a' }} />
                  Decisões-Chave
                </h3>
                <div className="analysis-card-text decisoes-text" style={{ whiteSpace: 'pre-line' }}>
                  {meeting.decisoes}
                </div>
              </div>
            )}

            {/* Tópicos */}
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

          {/* Itens de Ação */}
          {meeting.itens_acao?.length > 0 && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">
                <ListChecks size={15} className="card-title-icon" style={{ color: '#2563eb' }} />
                Itens de Ação
              </h3>
              <div className="action-items-list">
                {meeting.itens_acao.map((item, i) => (
                  <div key={i} className={`action-item ${checkedItems[i] ? 'action-item-done' : ''}`}>
                    <button className="action-checkbox" onClick={() => toggleItem(i)} aria-label="Marcar como feito">
                      <CheckCircle2 size={18} className={checkedItems[i] ? 'check-done' : 'check-pending'} />
                    </button>
                    <div className="action-item-content">
                      <p className="action-tarefa">{item.tarefa}</p>
                      <div className="action-meta">
                        {item.responsavel && item.responsavel !== 'A definir' && (
                          <span className="action-badge action-responsavel">{item.responsavel}</span>
                        )}
                        {item.prazo && item.prazo !== 'A definir' && (
                          <span className="action-badge action-prazo">
                            <Clock size={11} /> {item.prazo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendências */}
          {meeting.pendencias?.length > 0 && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">
                <AlertCircle size={15} className="card-title-icon" style={{ color: '#d97706' }} />
                Pendências
              </h3>
              <ul className="decision-list">
                {meeting.pendencias.map((item, i) => (
                  <li key={i} className="decision-item">
                    <AlertCircle size={15} className="pending-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Coluna direita — transcrição */}
        <div className="transcript-col">
          <div className="transcript-header">
            <h3 className="transcript-title">
              <MessageSquare size={15} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
              Transcrição
            </h3>
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
              meeting.decisoes
                ? meeting.decisoes.split('\n').filter(Boolean).map((item, i) => (
                    <div key={i} className="speech-bubble">
                      <p className="speech-text">{item.replace(/^[•\-]\s*/, '')}</p>
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
