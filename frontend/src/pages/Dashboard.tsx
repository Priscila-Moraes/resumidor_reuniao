import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const mockMeetings = [
  { id: '1', date: 'Oct 26, 10:00 AM', title: 'Weekly Team Sync', summary: 'Discussed Q4 goals and new feature deployment timeline.', type: 'Team' },
  { id: '2', date: 'Oct 25, 2:00 PM', title: 'Q3 Sales Review', summary: 'Analyzed sales performance and pipeline obstacles.', type: 'Sales' },
  { id: '3', date: 'Oct 24, 11:00 AM', title: 'Project Kickoff: Alpha', summary: 'Defined project scope and key milestones.', type: 'Kickoff' },
  { id: '4', date: 'Oct 23, 4:00 PM', title: 'Client Demo - Acme Corp', summary: 'Showcased platform capabilities and addressed feedback.', type: 'Kickoff' },
  { id: '5', date: 'Oct 22, 9:00 AM', title: 'Design Sync', summary: 'Reviewed new dashboard mockups.', type: 'Team' },
  { id: '6', date: 'Oct 21, 1:00 PM', title: 'Partnership Call', summary: 'Explored integration possibilities with DataCo.', type: 'Sales' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search meetings..." className="search-input" />
        </div>
        <div className="user-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="User" className="avatar" />
          <ChevronDown size={16} />
        </div>
      </header>

      <div className="dashboard-content">
        <h1 className="page-title">Meeting Dashboard</h1>
        
        <div className="meetings-grid">
          {mockMeetings.map((meeting) => (
            <div 
              key={meeting.id} 
              className="card meeting-card"
              onClick={() => navigate(`/meeting/${meeting.id}`)}
            >
              <div className="card-header">
                <span className="meeting-date">{meeting.date}</span>
                <span className={`tag ${meeting.type.toLowerCase()}`}>{meeting.type}</span>
              </div>
              <h3 className="meeting-title">{meeting.title}</h3>
              <p className="meeting-summary">{meeting.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
