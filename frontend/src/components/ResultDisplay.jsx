import React from 'react'
import './ResultDisplay.css'

const ResultDisplay = ({ result, onReset }) => {
  // ป้องกัน null/undefined
  if (!result) {
    return null
  }

  // แปล predicted_class เป็นข้อความที่เข้าใจง่าย
  const getClassDescription = (predictedClass) => {
    const classMap = {
      0: {
        name: "No Diabetic Retinopathy",
        description: "ไม่พบภาวะจอประสาทตาเสื่อมจากเบาหวาน",
        severity: "normal"
      },
      1: {
        name: "Mild Diabetic Retinopathy", 
        description: "ภาวะจอประสาทตาเสื่อมจากเบาหวานระดับเล็กน้อย",
        severity: "mild"
      },
      2: {
        name: "Moderate Diabetic Retinopathy",
        description: "ภาวะจอประสาทตาเสื่อมจากเบาหวานระดับปานกลาง", 
        severity: "moderate"
      },
      3: {
        name: "Severe Diabetic Retinopathy",
        description: "ภาวะจอประสาทตาเสื่อมจากเบาหวานระดับรุนแรง",
        severity: "severe"
      },
      4: {
        name: "Proliferative Diabetic Retinopathy",
        description: "ภาวะจอประสาทตาเสื่อมจากเบาหวานแบบแพร่กระจาย",
        severity: "critical"
      }
    }
    
    return classMap[predictedClass] || {
      name: "Unknown",
      description: "ไม่สามารถระบุได้",
      severity: "unknown"
    }
  }

  const getResultIcon = (predictedClass) => {
    const classInfo = getClassDescription(predictedClass)
    
    if (classInfo.severity === 'normal') {
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

  const getResultColor = (predictedClass) => {
    const classInfo = getClassDescription(predictedClass)
    
    switch(classInfo.severity) {
      case 'normal': return 'success'
      case 'mild': return 'warning'
      case 'moderate': return 'warning'
      case 'severe': return 'danger'
      case 'critical': return 'danger'
      default: return 'warning'
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
        <h3>📋 ผลการวิเคราะห์</h3>
        <button onClick={onReset} className="reset-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.5008 19.9616 6.12688 18.364M3 12V7M3 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          วิเคราะห์ภาพใหม่
        </button>
      </div>

      {/* Main Content Layout - Dynamic based on image availability */}
      <div className={`main-content-grid ${!(result.original_image || result.preprocessed_image) ? 'no-images' : ''}`}>
        {/* Left Column - Images (only show if images exist) */}
        {(result.original_image || result.preprocessed_image) && (
          <div className="images-column">
            <div className="image-comparison">
              <h4>Image Processing</h4>
              <div className="image-grid">
                {result.original_image && (
                  <div className="image-container">
                    <h5>Original Image</h5>
                    <img 
                      src={result.original_image} 
                      alt="Original retinal image"
                      className="result-image"
                    />
                  </div>
                )}
                {result.preprocessed_image && (
                  <div className="image-container">
                    <h5>Preprocessed Image</h5>
                    <img 
                      src={result.preprocessed_image} 
                      alt="Preprocessed retinal image"
                      className="result-image"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Column - Results (takes full width if no images) */}
        <div className="results-column">
          {/* Show message when no images are available */}
          {!(result.original_image || result.preprocessed_image) && (
            <div className="no-images-notice">
              <div className="notice-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="notice-content">
                <h5>Image Processing Status</h5>
                <p>ไม่มีรูปภาพที่ผ่านการ preprocess จาก backend • แสดงผลการวิเคราะห์เท่านั้น</p>
              </div>
            </div>
          )}
          
          <div className={`result-card ${getResultColor(result.predicted_class !== undefined ? result.predicted_class : null)}`}>
            <div className="result-icon">
              {getResultIcon(result.predicted_class !== undefined ? result.predicted_class : null)}
            </div>
            
            <div className="result-content">
              <h4>Diagnosis Result</h4>
              
              {/* Class Information */}
              {result.predicted_class !== undefined && (
                <div className="class-info">
                  <div className="class-number">
                    <span className="label">Predicted Class:</span>
                    <span className="value">Class {result.predicted_class}</span>
                  </div>
                  <div className="class-details">
                    {(() => {
                      const classInfo = getClassDescription(result.predicted_class)
                      return (
                        <>
                          <p className="class-name">{classInfo.name}</p>
                          <p className="class-description">{classInfo.description}</p>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
              
              {/* Legacy prediction text (fallback) */}
              {result.prediction && !result.predicted_class && (
                <p className="prediction-text">{result.prediction}</p>
              )}
              
              <div className="confidence-section">
                <div className="confidence-header">
                  <span>Confidence Level</span>
                  <span className="confidence-value">
                    {getConfidenceLevel(result.confidence || 0)} ({((result.confidence || 0) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${(result.confidence || 0) * 100}%` }}
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