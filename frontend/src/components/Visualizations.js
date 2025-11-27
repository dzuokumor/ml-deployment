import React from 'react';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

function Visualizations() {
  const classData = [
    { name: 'Trees', samples: 800 },
    { name: 'Shrubland', samples: 650 },
    { name: 'Grassland', samples: 720 },
    { name: 'Cropland', samples: 680 },
    { name: 'Built-up', samples: 850 },
    { name: 'Bare/Sparse', samples: 420 },
    { name: 'Water', samples: 590 },
    { name: 'Wetland', samples: 380 },
    { name: 'Mangroves', samples: 230 }
  ];

  const performanceData = [
    { metric: 'Accuracy', training: 0.94, validation: 0.89 },
    { metric: 'Precision', training: 0.93, validation: 0.88 },
    { metric: 'Recall', training: 0.92, validation: 0.87 },
    { metric: 'F1-Score', training: 0.93, validation: 0.88 }
  ];

  const confidenceData = [
    { range: '0-20%', count: 45 },
    { range: '20-40%', count: 120 },
    { range: '40-60%', count: 280 },
    { range: '60-80%', count: 650 },
    { range: '80-100%', count: 1905 }
  ];

  const COLORS = [
    '#1b5e20',
    '#7cb342',
    '#9ccc65',
    '#fdd835',
    '#757575',
    '#8d6e63',
    '#1976d2',
    '#00897b',
    '#004d40'
  ];

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Data Visualizations</h2>
        <p className="card-subtitle">Comprehensive analysis of training data and model performance</p>
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
            Class Distribution
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={classData}
                dataKey="samples"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={(entry) => entry.name}
                labelLine={{ stroke: '#e0e0e0', strokeWidth: 1 }}
              >
                {classData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
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
            Sample Counts
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: '#757575', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="samples" fill="#2196f3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginTop: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#424242',
          marginBottom: '1.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Model Performance
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="metric" tick={{ fill: '#757575', fontSize: 12 }} />
            <YAxis domain={[0, 1]} tick={{ fill: '#757575', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="training" fill="#2196f3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="validation" fill="#9c27b0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginTop: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#424242',
          marginBottom: '1.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Confidence Distribution
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={confidenceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="range" tick={{ fill: '#757575', fontSize: 12 }} />
            <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="count" fill="#9c27b0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Visualizations;
