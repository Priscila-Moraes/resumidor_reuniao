import React, { useState } from 'react';
import { ArrowLeft, Share2, Search, Bell } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './MeetingDetails.css';

const MeetingDetails: React.FC = () => {
  const navigate = useNavigate();
  useParams();
  const [activeTab, setActiveTab] = useState<'transcription' | 'highlights'>('transcription');

  return (
    <div className="details-container">
      <header className="top-bar">
        <button className="btn-outline back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="header-actions">
          <Search size={20} className="icon-btn" />
          <Bell size={20} className="icon-btn" />
          <div className="user-profile">
            <img src="https://i.pravatar.cc/150?img=11" alt="User" className="avatar" />
          </div>
        </div>
      </header>

      <div className="details-header">
        <div>
          <h1 className="meeting-title-large">Q3 Roadmap & Sprint Planning Sync</h1>
          <div className="meeting-meta">
            <span>Oct 26, 2023 • 10:00 AM</span>
            <span className="tag team ml-2">Product Sync</span>
          </div>
        </div>
        <button className="btn-outline share-btn">
          <Share2 size={16} />
          Share
        </button>
      </div>

      <div className="details-content">
        <div className="main-column">
          <div className="card mb-4">
            <h3 className="section-title">Meeting Objective</h3>
            <h4 className="subsection-title">Purpose</h4>
            <p className="section-text">Finalize the Q3 product roadmap and agree on sprint commitments for the upcoming cycle.</p>
          </div>

          <div className="card mb-4">
            <h3 className="section-title">Summary</h3>
            <p className="section-text">
              The team discussed the key features for the Q3 roadmap, focusing on user retention and platform scalability. Decisions were made to prioritize the new analytics dashboard and delay the social sharing integration. Sprint commitments were finalized, with initial tasks assigned for next week.
            </p>
          </div>

          <div className="two-columns mb-4">
            <div className="card">
              <h3 className="section-title">Key Points & Decisions</h3>
              <ul className="checklist">
                <li>
                  <input type="checkbox" checked readOnly />
                  <span>Q3 Roadmap approved by stakeholders.</span>
                </li>
                <li>
                  <input type="checkbox" checked readOnly />
                  <span>Sprint 1 tasks assigned in Jira.</span>
                </li>
                <li>
                  <input type="checkbox" checked readOnly />
                  <span>Analytics dashboard prioritized.</span>
                </li>
                <li>
                  <input type="checkbox" readOnly />
                  <span>Social sharing feature postponed to Q4.</span>
                </li>
                <li>
                  <input type="checkbox" checked readOnly />
                  <span>Next sync scheduled for Nov 2.</span>
                </li>
              </ul>
            </div>

            <div className="card">
              <h3 className="section-title">Topics Discussed</h3>
              <div className="word-cloud">
                <span className="word w-large">Roadmap</span>
                <span className="word w-medium">Sprint Planning</span>
                <span className="word w-small">User Retention</span>
                <span className="word w-large">Scalability</span>
                <span className="word w-medium">Analytics Dashboard</span>
                <span className="word w-small">Jira</span>
                <span className="word w-small">Stakeholders</span>
                <span className="word w-medium">Feature Prioritization</span>
                <span className="word w-small">Social Sharing</span>
                <span className="word w-small">Timelines</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-column card">
          <div className="tabs-header">
            <h3 className="section-title m-0">Full Transcription</h3>
            <div className="tabs-toggle">
              <button 
                className={`tab-btn ${activeTab === 'transcription' ? 'active' : ''}`}
                onClick={() => setActiveTab('transcription')}
              >
                Transcription
              </button>
              <button 
                className={`tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
                onClick={() => setActiveTab('highlights')}
              >
                Highlights
              </button>
            </div>
          </div>

          <div className="transcription-content">
            <div className="speech-bubble">
              <span className="timestamp">10:00 AM | <span className="speaker">Sarah L. (PM)</span>:</span>
              <p>Let's kick off the Q3 planning. I've shared the proposed roadmap.</p>
            </div>
            <div className="speech-bubble">
              <span className="timestamp">10:02 AM | <span className="speaker">Mike T. (Eng Lead)</span>:</span>
              <p>Thanks, Sarah. The focus on scalability makes sense. We'll need to allocate resources for the backend migration.</p>
            </div>
            <div className="speech-bubble">
              <span className="timestamp">10:05 AM | <span className="speaker">David K. (Design)</span>:</span>
              <p>I've updated the mockups for the analytics dashboard. It's ready for review.</p>
            </div>
            <div className="speech-bubble">
              <span className="timestamp">10:08 AM | <span className="speaker">Sarah L. (PM)</span>:</span>
              <p>Great, David. Let's move that to the top of the list.</p>
            </div>
            <div className="speech-bubble">
              <span className="timestamp">10:15 AM | <span className="speaker">Lisa M. (Marketing)</span>:</span>
              <p>Are we still targeting the social sharing feature for this quarter?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;
