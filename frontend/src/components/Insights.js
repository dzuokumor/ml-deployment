import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Insights() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const classData = [
    { name: 'Trees', code: 10, color: '#2d5016' },
    { name: 'Shrubland', code: 20, color: '#78643c' },
    { name: 'Grassland', code: 30, color: '#648c46' },
    { name: 'Cropland', code: 40, color: '#969650' },
    { name: 'Built-up', code: 50, color: '#b4b4b4' },
    { name: 'Bare/Sparse', code: 60, color: '#c8beaa' },
    { name: 'Water', code: 80, color: '#1e3c78' },
    { name: 'Wetland', code: 90, color: '#466e5a' },
    { name: 'Mangroves', code: 95, color: '#326446' }
  ];

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/health');
      setHealth(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch health:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#757575' }}>Loading insights...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title">System Insights</h2>
        <p className="card-subtitle">Real-time metrics and visualizations for the deployed model</p>

        <div className="grid grid-2" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  System Status
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health?.status === 'healthy' ? 'Healthy' : 'Offline'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#616161', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
              Uptime: <span style={{ fontWeight: '500', color: '#424242' }}>{health?.uptime_hours ? `${health.uptime_hours} hours` : 'N/A'}</span>
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Predictions
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health?.prediction_count || 0}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#616161', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
              Avg Latency: <span style={{ fontWeight: '500', color: '#424242' }}>{health?.average_latency_ms?.toFixed(0) || 0}ms</span>
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: '#fff3e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CPU Usage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health?.cpu_percent?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#f5f5f5',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${health?.cpu_percent || 0}%`,
                height: '100%',
                backgroundColor: '#ff9800',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: '#f3e5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Memory Usage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health?.memory_percent?.toFixed(1) || 0}%
                </div>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#f5f5f5',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${health?.memory_percent || 0}%`,
                height: '100%',
                backgroundColor: '#9c27b0',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fafafa',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#424242',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            ESA WorldCover Land Cover Classes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {classData.map((cls, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  minWidth: '120px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#424242'
                }}>
                  {cls.name}
                </div>
                <div style={{
                  minWidth: '60px',
                  fontSize: '0.75rem',
                  color: '#757575',
                  fontFamily: 'monospace'
                }}>
                  Code {cls.code}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: cls.color,
                    borderRadius: '3px',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}></div>
                  <div style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: cls.color,
                      opacity: 0.4
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#424242',
            marginBottom: '1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Model Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.875rem', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontWeight: '500', color: '#757575' }}>Architecture:</span>
              <span style={{ color: '#424242', fontWeight: '500' }}>Convolutional Neural Network (CNN)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.875rem', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontWeight: '500', color: '#757575' }}>Input Size:</span>
              <span style={{ color: '#424242', fontWeight: '500' }}>64x64x3 (RGB)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.875rem', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontWeight: '500', color: '#757575' }}>Output Classes:</span>
              <span style={{ color: '#424242', fontWeight: '500' }}>9 Land Cover Types</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.875rem', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontWeight: '500', color: '#757575' }}>Dataset:</span>
              <span style={{ color: '#424242', fontWeight: '500' }}>ESA WorldCover 2021 (Lagos, Nigeria)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '500', color: '#757575' }}>Framework:</span>
              <span style={{ color: '#424242', fontWeight: '500' }}>TensorFlow/Keras</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;
