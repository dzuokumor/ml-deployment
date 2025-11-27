import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Monitor() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      const [healthRes, metricsRes] = await Promise.all([
        axios.get('http://localhost:8000/health'),
        axios.get('http://localhost:8000/metrics')
      ]);
      setHealth(healthRes.data);
      setMetrics(metricsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#757575' }}>Loading metrics...</p>
      </div>
    );
  }

  if (!health || !metrics) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#757575' }}>Unable to load metrics</p>
      </div>
    );
  }

  const cpuColor = health.cpu_percent > 80 ? '#ef5350' : health.cpu_percent > 60 ? '#ff9800' : '#2196f3';
  const memoryColor = health.memory_percent > 80 ? '#ef5350' : health.memory_percent > 60 ? '#ff9800' : '#9c27b0';

  const chartData = [
    { name: 'Min', value: metrics.min_latency_ms },
    { name: 'Avg', value: metrics.average_latency_ms },
    { name: 'Max', value: metrics.max_latency_ms }
  ];

  const predictionData = [
    { name: 'Total', value: metrics.total_predictions }
  ];

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 className="card-title">System Monitor</h2>
            <p className="card-subtitle">Real-time performance metrics and resource utilization</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={fetchData}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#424242',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
                e.target.style.borderColor = '#2196f3';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#e0e0e0';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ display: 'none' }}
              />
              <div style={{
                width: '44px',
                height: '24px',
                backgroundColor: autoRefresh ? '#2196f3' : '#e0e0e0',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background-color 0.2s ease'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: autoRefresh ? '22px' : '2px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#424242' }}>
                Auto-refresh
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-4" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#4caf50',
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health.status === 'healthy' ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Uptime
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health.uptime_hours.toFixed(1)}<span style={{ fontSize: '0.875rem', color: '#757575' }}>h</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Predictions
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {metrics.total_predictions}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Avg Latency
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {metrics.average_latency_ms.toFixed(0)}<span style={{ fontSize: '0.875rem', color: '#757575' }}>ms</span>
                </div>
              </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: health.cpu_percent > 80 ? '#ffebee' : health.cpu_percent > 60 ? '#fff3e0' : '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={cpuColor} strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="1" x2="9" y2="4"></line>
                  <line x1="15" y1="1" x2="15" y2="4"></line>
                  <line x1="9" y1="20" x2="9" y2="23"></line>
                  <line x1="15" y1="20" x2="15" y2="23"></line>
                  <line x1="20" y1="9" x2="23" y2="9"></line>
                  <line x1="20" y1="14" x2="23" y2="14"></line>
                  <line x1="1" y1="9" x2="4" y2="9"></line>
                  <line x1="1" y1="14" x2="4" y2="14"></line>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CPU Usage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health.cpu_percent.toFixed(1)}<span style={{ fontSize: '1rem', color: '#757575' }}>%</span>
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
                width: `${health.cpu_percent}%`,
                height: '100%',
                backgroundColor: cpuColor,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: health.memory_percent > 80 ? '#ffebee' : health.memory_percent > 60 ? '#fff3e0' : '#f3e5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={memoryColor} strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Memory Usage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#212121', marginTop: '0.25rem' }}>
                  {health.memory_percent.toFixed(1)}<span style={{ fontSize: '1rem', color: '#757575' }}>%</span>
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
                width: `${health.memory_percent}%`,
                height: '100%',
                backgroundColor: memoryColor,
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
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
              Latency Distribution (ms)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{ fill: '#757575', fontSize: 12 }} />
                <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#2196f3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              Total Predictions
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{ fill: '#757575', fontSize: 12 }} />
                <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#9c27b0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

export default Monitor;
