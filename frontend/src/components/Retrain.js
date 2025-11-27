import React, { useState } from 'react';
import axios from 'axios';

function Retrain() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [epochs, setEpochs] = useState(10);
  const [batchPath, setBatchPath] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [trainResult, setTrainResult] = useState(null);
  const [error, setError] = useState(null);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({ cpu: 0, memory: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadETA, setUploadETA] = useState(0);

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setUploadResult(null);
    setValidationResults(null);
    setTrainResult(null);
    setError(null);
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setUploadResult(null);
    setValidationResults(null);
    setTrainResult(null);
    setError(null);
    setBatchPath(null);
    document.getElementById('files-input').value = '';
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadSpeed(0);
    setUploadETA(0);

    const formData = new FormData();
    let startTime = Date.now();
    let lastLoaded = 0;

    selectedFiles.forEach(file => {
      formData.append('files', file, file.webkitRelativePath || file.name);
    });

    console.log('Starting upload with', selectedFiles.length, 'files');
    console.log('FormData entries:', formData.entries ? Array.from(formData.entries()).length : 'N/A');
    try {
      console.log('Sending POST request to http://localhost:8000/upload-bulk');
      const response = await axios.post('http://localhost:8000/upload-bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000,
        onUploadProgress: (progressEvent) => {
          console.log('Upload progress:', progressEvent.loaded, '/', progressEvent.total);
          const percentCompleted = Math.min(95, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          setUploadProgress(percentCompleted);

          const elapsedTime = (Date.now() - startTime) / 1000;
          const uploadedBytes = progressEvent.loaded - lastLoaded;
          const speed = uploadedBytes / elapsedTime;
          setUploadSpeed(speed);

          const remainingBytes = progressEvent.total - progressEvent.loaded;
          const eta = speed > 0 ? remainingBytes / speed : 0;
          setUploadETA(eta);

          lastLoaded = progressEvent.loaded;
          startTime = Date.now();
        }
      });
      console.log('Upload completed, response received');
      setUploadProgress(95);
      setUploadResult(response.data);
      setValidationResults(response.data.validation_results);
      setBatchPath(response.data.batch_path);

      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          setUploadProgress(0);
          setUploadSpeed(0);
          setUploadETA(0);
        }, 2000);
      }, 300);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
      setError(errorMessage);
      setUploadProgress(0);
      setUploadSpeed(0);
      setUploadETA(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRetrain = async () => {
    if (!batchPath) return;

    setTraining(true);
    setError(null);
    setTrainingLogs([]);

    try {
      const response = await axios.post(
        `http://localhost:8000/retrain?train_data_path=${batchPath}&epochs=${epochs}`
      );
      setTrainResult(response.data);

      const logInterval = setInterval(async () => {
        try {
          const logsResponse = await axios.get('http://localhost:8000/training-logs');
          if (logsResponse.data.logs && logsResponse.data.logs.length > 0) {
            setTrainingLogs(logsResponse.data.logs);
          if (logsResponse.data.progress !== undefined) {
            setTrainingProgress(logsResponse.data.progress);
          }
          }
          if (logsResponse.data.status === 'completed' || logsResponse.data.status === 'failed') {
            clearInterval(logInterval);
            setTimeout(() => { setTraining(false); setTrainingProgress(0); }, 2000);
          }
        } catch (err) {
          console.error('Failed to fetch logs:', err);
        }
      }, 2000);

      const metricsInterval = setInterval(async () => {
        try {
          const metricsResponse = await axios.get('http://localhost:8000/health');
          setSystemMetrics({
            cpu: metricsResponse.data.cpu_percent || 0,
            memory: metricsResponse.data.memory_percent || 0
          });
        } catch (err) {
          console.error('Failed to fetch metrics:', err);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(logInterval);
        clearInterval(metricsInterval);
        setTraining(false);
      }, epochs * 30000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Retraining failed');
      setTraining(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Model Retraining</h2>
        <p className="card-subtitle">Upload new training data to improve model performance</p>

        <div className="alert" style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ffb74d',
          color: '#e65100',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <strong>Important:</strong> For production retraining, your training folder must contain samples from all 9 land cover classes. The model requires balanced representation across all classes for optimal performance.
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label>Training Epochs</label>
          <input
            type="number"
            min="1"
            max="50"
            value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value))}
          />
        </div>

        <div className="file-upload" onClick={() => document.getElementById('files-input').click()}>
          <input
            id="files-input"
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFileSelect}
          />
          <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p style={{ fontSize: '1rem', color: '#2e7d32', fontWeight: '600', marginBottom: '0.5rem' }}>
            {selectedFiles.length > 0 ? `${selectedFiles.length} Files Selected` : 'Select Training Folder'}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#9e9e9e' }}>
            Click to select a folder containing class subfolders with images
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '8px',
              border: '1px solid #c8e6c9'
            }}>
              <div>
                <span style={{ fontWeight: '600', color: '#2e7d32' }}>
                  {selectedFiles.length} files selected
                </span>
                {selectedFiles[0]?.webkitRelativePath && (
                  <span style={{ marginLeft: '0.5rem', color: '#616161', fontSize: '0.9rem' }}>
                    from {selectedFiles[0].webkitRelativePath.split('/')[0]}
                  </span>
                )}
              </div>
              <button
                onClick={clearSelectedFiles}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #c62828',
                  color: '#c62828',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        )}

        {uploading && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            border: '1px solid #90caf9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1976d2' }}>
                {uploadProgress < 95 ? 'Uploading...' : 'Validating...'}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#616161' }}>
                {uploadProgress}%
              </span>
            </div>
            <div style={{
              height: '8px',
              backgroundColor: '#bbdefb',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                height: '100%',
                width: `${uploadProgress}%`,
                backgroundColor: '#1976d2',
                transition: 'width 0.3s ease',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#616161' }}>
              <span>
                {uploadProgress < 95 && uploadSpeed > 0 ? `${(uploadSpeed / 1024).toFixed(1)} KB/s` : uploadProgress >= 95 ? 'Processing...' : 'Calculating...'}
              </span>
              <span>
                {uploadETA > 0 && uploadETA < 300 && uploadProgress < 95 ? `ETA: ${Math.ceil(uploadETA)}s` : ''}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            className="button"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0 || training}
            style={{ flex: 1, opacity: (uploading || selectedFiles.length === 0 || training) ? 0.5 : 1 }}
          >
            {uploading ? (uploadProgress < 95 ? `Uploading ${uploadProgress}%...` : 'Validating...') : 'Upload Data'}
          </button>

          <button
            className="button button-secondary"
            onClick={handleRetrain}
            disabled={training || !batchPath || uploading}
            style={{
              flex: 1,
              opacity: (training || !batchPath || uploading) ? 0.5 : 1,
              backgroundColor: batchPath && !training ? '#2e7d32' : undefined,
              color: batchPath && !training ? '#ffffff' : undefined
            }}
          >
            {training ? 'Training...' : 'Start Training'}
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>{error}</div>
        )}

        {uploadResult && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: uploadResult.invalid_files > 0 ? '#fff3e0' : '#e8f5e9',
            border: `1px solid ${uploadResult.invalid_files > 0 ? '#ffb74d' : '#c8e6c9'}`,
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: '600', color: uploadResult.invalid_files > 0 ? '#e65100' : '#2e7d32' }}>
                Upload Complete
              </div>
              <div style={{ fontSize: '0.9rem', color: '#616161' }}>
                {uploadResult.files_uploaded} total • {uploadResult.valid_files} valid • {uploadResult.invalid_files} invalid
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9e9e9e', marginLeft: 'auto' }}>
                {uploadResult.batch_id}
              </div>
            </div>
            {uploadResult.invalid_files > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#e65100' }}>
                ⚠ Some files failed validation. Check the table below for details.
              </div>
            )}
          </div>
        )}

        {validationResults && validationResults.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Validation Results</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem', color: '#424242' }}>File</th>
                    <th style={{ padding: '0.5rem', color: '#424242' }}>Claimed Class</th>
                    <th style={{ padding: '0.5rem', color: '#424242' }}>Predicted Class</th>
                    <th style={{ padding: '0.5rem', color: '#424242' }}>Confidence</th>
                    <th style={{ padding: '0.5rem', color: '#424242' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResults.map((result, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '0.5rem', color: '#616161' }}>{result.filename.split('/').pop()}</td>
                      <td style={{ padding: '0.5rem', color: '#616161' }}>{result.claimed_class}</td>
                      <td style={{ padding: '0.5rem', color: '#616161' }}>{result.predicted_class}</td>
                      <td style={{ padding: '0.5rem', color: '#616161' }}>{(result.confidence * 100).toFixed(1)}%</td>
                      <td style={{ padding: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: result.valid ? '#e8f5e9' : '#ffebee',
                            color: result.valid ? '#2e7d32' : '#c62828'
                          }}>
                            {result.valid ? 'Valid' : result.error || 'Mismatch'}
                          </span>
                          {result.note && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              color: '#616161',
                              fontStyle: 'italic'
                            }}>
                              {result.note}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {trainResult && (
          <div className="alert alert-success" style={{ marginTop: '1.5rem' }}>
            <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{trainResult.message}</div>
            <div style={{ fontSize: '0.9rem' }}>
              Training with {trainResult.epochs} epochs.
            </div>
          </div>
        )}

        {trainingLogs.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div className="card" style={{ flex: 1, backgroundColor: '#1e1e1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#4caf50', margin: 0 }}>Training Logs</h3>
                {training && (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#4caf50',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div className="spinner" style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid #4caf50',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Training in progress... {trainingProgress}%
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${trainingProgress}%`,
                        height: '100%',
                        backgroundColor: '#4caf50',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                backgroundColor: '#0d0d0d',
                padding: '1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#e0e0e0',
                lineHeight: '1.5'
              }}>
                {trainingLogs.map((log, idx) => (
                  <div key={idx} style={{
                    marginBottom: '0.25rem',
                    color: log.includes('Error') ? '#ff5252' : log.includes('Epoch') ? '#4caf50' : '#e0e0e0'
                  }}>{log}</div>
                ))}
              </div>
            </div>

            {training && (
              <div className="card" style={{ width: '200px', backgroundColor: '#1e1e1e', padding: '1.5rem' }}>
                <h4 style={{ color: '#4caf50', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>System Load</h4>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#9e9e9e', fontSize: '0.75rem' }}>CPU</span>
                    <span style={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: '600' }}>
                      {systemMetrics.cpu.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#0d0d0d',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${systemMetrics.cpu}%`,
                      backgroundColor: systemMetrics.cpu > 80 ? '#ff5252' : '#4caf50',
                      transition: 'width 0.5s ease',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#9e9e9e', fontSize: '0.75rem' }}>Memory</span>
                    <span style={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: '600' }}>
                      {systemMetrics.memory.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#0d0d0d',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${systemMetrics.memory}%`,
                      backgroundColor: systemMetrics.memory > 80 ? '#ff5252' : '#4caf50',
                      transition: 'width 0.5s ease',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Training Requirements
        </h3>
        <p style={{ color: '#757575', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.875rem' }}>
          Ensure your training data meets these specifications before uploading.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{
            padding: '1.25rem',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#424242',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                Folder Structure Required
              </div>
            </div>
            <p style={{ color: '#616161', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
              Select a parent folder containing class subfolders. Structure: parent_folder/class_name/images. Example: training_data/trees/img001.png, training_data/water/img002.png. Each file is validated by the model before training.
            </p>
          </div>

          <div style={{
            padding: '1.25rem',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#f3e5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#424242',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                Supported Classes
              </div>
            </div>
            <p style={{ color: '#616161', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
              Trees, Shrubland, Grassland, Cropland, Built-up, Bare_Sparse (underscore), Water, Wetland, and Mangroves. Folder names must match exactly (case-insensitive, use underscore not hyphen).
            </p>
          </div>

          <div style={{
            padding: '1.25rem',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#fff3e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#424242',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                Image Specifications
              </div>
            </div>
            <p style={{ color: '#616161', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
              Images are automatically resized to 64×64 pixels. Supported formats include JPG, JPEG, and PNG. RGB color mode is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Retrain;
