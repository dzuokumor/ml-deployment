import React, { useState, useEffect } from 'react';
import './App.css';
import Predict from './components/Predict';
import Monitor from './components/Monitor';
import Visualizations from './components/Visualizations';
import Retrain from './components/Retrain';
import Insights from './components/Insights';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'predict';
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    {
      id: 'predict',
      label: 'Predict',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'monitor',
      label: 'Monitor',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    {
      id: 'visualizations',
      label: 'Visualizations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      id: 'retrain',
      label: 'Retrain',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      )
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      )
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('activeTab', tabId);
    setMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-badge">ML Pipeline</div>
          <h1>Land Cover Classification</h1>
          <p className="subtitle">Satellite imagery analysis and model deployment</p>
        </div>
        <button
          onClick={() => {
            const link = document.createElement("a");
            link.href = process.env.PUBLIC_URL + "/sample-training-data.zip";
            link.download = "sample-training-data.zip";
            link.click();
          }}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "2rem",
            padding: "0.5rem 0.9rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#45a049";
            e.target.style.boxShadow = "0 3px 6px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#4CAF50";
            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
          }}
          title="Download sample training dataset"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Sample
        </button>
      </header>

      <nav className="nav-container">
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}
      </nav>

      <div className="content">
        {activeTab === 'predict' && <Predict />}
        {activeTab === 'monitor' && <Monitor />}
        {activeTab === 'visualizations' && <Visualizations />}
        {activeTab === 'retrain' && <Retrain />}
        {activeTab === 'insights' && <Insights />}
      </div>
    </div>
  );
}

export default App;
