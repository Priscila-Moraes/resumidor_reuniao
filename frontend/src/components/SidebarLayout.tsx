import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, Calendar, Plug, Settings as SettingsIcon, Plus, LogOut } from 'lucide-react';
import './SidebarLayout.css';

const SidebarLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity className="sidebar-logo" size={24} />
          <h2>MeetingAI</h2>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Calendar size={20} />
            <span>My Meetings</span>
          </NavLink>
          
          <NavLink to="/integrations" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Plug size={20} />
            <span>Integrations</span>
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </NavLink>

          <button className="nav-btn-new mt-4">
            <Plus size={20} />
            <span>New Meeting</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
