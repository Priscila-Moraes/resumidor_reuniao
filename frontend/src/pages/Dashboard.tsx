import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

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

  useEffect(() => {
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

    fetchMeetings();
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
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
      </header>

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
