import React from 'react'
import './ResultDisplay.css'

const ResultDisplay = ({ result, onReset }) => {
  const getResultIcon = (prediction) => {
    if (prediction.toLowerCase().includes('no') || prediction.toLowerCase().includes('normal')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    } else {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  }

  const getResultColor = (prediction) => {
    if (prediction.toLowerCase().includes('no') || prediction.toLowerCase().includes('normal')) {
      return 'success'
    } else {
      return 'warning'
    }
  }

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.9) return 'Very High'
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.7) return 'Moderate'
    if (confidence >= 0.6) return 'Fair'
    return 'Low'
  }

  return (
    <div className="result-display">
      <div className="result-header">
        <h3>Analysis Complete</h3>
        <button onClick={onReset} className="reset-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.5008 19.9616 6.12688 18.364M3 12V7M3 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Analyze Another Image
        </button>
      </div>

      <div className={`result-card ${getResultColor(result.prediction)}`}>
        <div className="result-icon">
          {getResultIcon(result.prediction)}
        </div>
        
        <div className="result-content">
          <h4>Diagnosis Result</h4>
          <p className="prediction-text">{result.prediction}</p>
          
          <div className="confidence-section">
            <div className="confidence-header">
              <span>Confidence Level</span>
              <span className="confidence-value">
                {getConfidenceLevel(result.confidence)} ({(result.confidence * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{ width: `${result.confidence * 100}%` }}
              ></div>
            </div>
          </div>

          {result.recommendations && (
            <div className="recommendations">
              <h5>Recommendations</h5>
              <ul>
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="result-details">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Processing Time</span>
            <span className="detail-value">{result.processing_time || '< 1s'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Model Version</span>
            <span className="detail-value">{result.model_version || 'v1.0'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Image Quality</span>
            <span className="detail-value">{result.image_quality || 'Good'}</span>
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <div className="disclaimer-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="disclaimer-content">
          <h6>Important Notice</h6>
          <p>This AI analysis is for screening purposes only and should not replace professional medical diagnosis. Please consult with a qualified ophthalmologist for proper medical evaluation.</p>
        </div>
      </div>
    </div>
  )
}

export default ResultDisplay