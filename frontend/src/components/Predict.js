import React, { useState } from 'react';
import axios from 'axios';

function Predict() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Image Prediction</h2>
        <p className="card-subtitle">Upload a satellite image to analyze land cover classification</p>

        <div className="file-upload" onClick={() => document.getElementById('file-input').click()}>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p style={{ fontSize: '1rem', color: '#2e7d32', fontWeight: '600', marginBottom: '0.5rem' }}>
            {selectedFile ? selectedFile.name : 'Select Image File'}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#9e9e9e' }}>
            Supports PNG, JPG, JPEG formats
          </p>
        </div>

        {preview && (
          <div style={{ marginTop: '2.5rem' }} className="grid grid-2">
            <div>
              <div className="image-preview">
                <img src={preview} alt="preview" />
              </div>
            </div>

            <div>
              <button
                className="button"
                onClick={handlePredict}
                disabled={loading}
                style={{ width: '100%', marginBottom: '1.5rem' }}
              >
                {loading ? 'Analyzing Image...' : 'Run Prediction'}
              </button>

              {loading && <div className="spinner"></div>}

              {error && (
                <div className="alert alert-error">{error}</div>
              )}

              {result && (
                <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#e8f5e9',
                    border: '2px solid #4caf50',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#2e7d32',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.5rem'
                    }}>
                      Predicted Land Cover
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#1b5e20',
                      textTransform: 'capitalize',
                      marginBottom: '0.5rem'
                    }}>
                      {result.predicted_class_name || result.predicted_class}
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ffffff',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: result.confidence > 0.8 ? '#2e7d32' : result.confidence > 0.5 ? '#f57c00' : '#d32f2f'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {(result.confidence * 100).toFixed(1)}% Confidence
                    </div>
                  </div>

                  <div className="grid grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>
                        Processing Time
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#424242' }}>
                        {result.latency_ms.toFixed(0)}ms
                      </div>
                    </div>
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#757575', marginBottom: '0.25rem' }}>
                        ESA Code
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#424242' }}>
                        {result.predicted_class}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h3 style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#424242',
                      marginBottom: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Alternative Predictions
                    </h3>
                    {result.top_3.map((pred, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: idx < result.top_3.length - 1 ? '1rem' : 0,
                        gap: '1rem'
                      }}>
                        <div style={{
                          minWidth: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#4caf50' : idx === 1 ? '#66bb6a' : '#81c784',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.25rem'
                          }}>
                            <span style={{
                              fontWeight: '500',
                              color: '#424242',
                              textTransform: 'capitalize'
                            }}>
                              {pred.class}
                            </span>
                            <span style={{
                              fontWeight: '600',
                              color: '#2e7d32',
                              fontSize: '0.9rem'
                            }}>
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div style={{
                            height: '6px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${pred.confidence * 100}%`,
                              height: '100%',
                              backgroundColor: idx === 0 ? '#4caf50' : idx === 1 ? '#66bb6a' : '#81c784',
                              transition: 'width 0.5s ease-out'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Predict;
