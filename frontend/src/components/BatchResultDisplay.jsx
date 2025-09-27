import React, { useState, useMemo } from 'react'
import './BatchResultDisplay.css'
import { getApiBase } from '../lib/apiConfig'

const BatchResultDisplay = ({ batchResult, onReset }) => {
  const [sortBy, setSortBy] = useState('filename') // filename, confidence, class
  const [filterBy, setFilterBy] = useState('all') // all, success, failed, no-dr, mild, moderate, severe, proliferative
  const [showDetailsFor, setShowDetailsFor] = useState(new Set())

  if (!batchResult || !batchResult.results) {
    return null
  }

  const getClassInfo = (predictedClass) => {
    const classMap = {
      0: { name: "No DR", description: "ไม่พบภาวะจอประสาทตาเสื่อม", severity: "normal", color: "#10b981" },
      1: { name: "Mild DR", description: "ระดับเล็กน้อย", severity: "mild", color: "#f59e0b" },
      2: { name: "Moderate DR", description: "ระดับปานกลาง", severity: "moderate", color: "#f97316" },
      3: { name: "Severe DR", description: "ระดับรุนแรง", severity: "severe", color: "#ef4444" },
      4: { name: "Proliferative DR", description: "แบบแพร่กระจาย", severity: "critical", color: "#dc2626" }
    }
    return classMap[predictedClass] || { name: "Unknown", description: "ไม่ทราบ", severity: "unknown", color: "#6b7280" }
  }

  // สถิติโดยรวม
  const stats = useMemo(() => {
    const results = batchResult.results || []
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    const classCounts = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0
    }
    
    successful.forEach(r => {
      if (r.predicted_class !== undefined) {
        classCounts[r.predicted_class] = (classCounts[r.predicted_class] || 0) + 1
      }
    })

    const avgConfidence = successful.length > 0 
      ? successful.reduce((sum, r) => sum + (r.confidence || 0), 0) / successful.length 
      : 0

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      classCounts,
      avgConfidence,
      drCases: classCounts[1] + classCounts[2] + classCounts[3] + classCounts[4],
      noDrCases: classCounts[0]
    }
  }, [batchResult.results])

  // กรองและจัดเรียงข้อมูล
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...(batchResult.results || [])]

    // กรอง
    if (filterBy === 'success') filtered = filtered.filter(r => r.success)
    else if (filterBy === 'failed') filtered = filtered.filter(r => !r.success)
    else if (filterBy === 'no-dr') filtered = filtered.filter(r => r.success && r.predicted_class === 0)
    else if (filterBy === 'mild') filtered = filtered.filter(r => r.success && r.predicted_class === 1)
    else if (filterBy === 'moderate') filtered = filtered.filter(r => r.success && r.predicted_class === 2)
    else if (filterBy === 'severe') filtered = filtered.filter(r => r.success && r.predicted_class === 3)
    else if (filterBy === 'proliferative') filtered = filtered.filter(r => r.success && r.predicted_class === 4)

    // จัดเรียง
    filtered.sort((a, b) => {
      if (sortBy === 'filename') {
        return a.filename.localeCompare(b.filename)
      } else if (sortBy === 'confidence') {
        return (b.confidence || 0) - (a.confidence || 0)
      } else if (sortBy === 'class') {
        if (!a.success && !b.success) return 0
        if (!a.success) return 1
        if (!b.success) return -1
        return (a.predicted_class || 0) - (b.predicted_class || 0)
      }
      return 0
    })

    return filtered
  }, [batchResult.results, sortBy, filterBy])

  const toggleDetails = (index) => {
    const newSet = new Set(showDetailsFor)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setShowDetailsFor(newSet)
  }

  const handleDownloadCSV = async () => {
    try {
      const API_BASE = getApiBase()
      const response = await fetch(`${API_BASE}/api/generate-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: batchResult.results
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate CSV')
      }

      // ดาวน์โหลดไฟล์
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dr_analysis_results_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด CSV')
    }
  }

  return (
    <div className="batch-result-display">
      {/* Header */}
      <div className="batch-result-header">
        <div className="header-content">
          <h3>📊 Batch Analysis Results</h3>
          <p>วิเคราะห์เสร็จสิ้น • {stats.successful} สำเร็จ • {stats.failed} ล้มเหลว</p>
        </div>
        <div className="header-actions">
          <button onClick={handleDownloadCSV} className="download-csv-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Download CSV Report
          </button>
          <button onClick={onReset} className="reset-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.5008 19.9616 6.12688 18.364M3 12V7M3 12H8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Analyze New Batch
          </button>
        </div>
      </div>

      {/* สถิติโดยรวม */}
      <div className="batch-stats">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📁</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Files</div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.successful}</div>
              <div className="stat-label">Successful</div>
            </div>
          </div>
          
          <div className="stat-card no-dr">
            <div className="stat-icon">😊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.noDrCases}</div>
              <div className="stat-label">No DR</div>
            </div>
          </div>
          
          <div className="stat-card has-dr">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.drCases}</div>
              <div className="stat-label">Has DR</div>
            </div>
          </div>

          <div className="stat-card confidence">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{(stats.avgConfidence * 100).toFixed(1)}%</div>
              <div className="stat-label">Avg Confidence</div>
            </div>
          </div>
        </div>

        {/* DR Classification Breakdown */}
        <div className="dr-breakdown">
          <h4>DR Classification Breakdown</h4>
          <div className="breakdown-chart">
            {[0, 1, 2, 3, 4].map(classNum => {
              const classInfo = getClassInfo(classNum)
              const count = stats.classCounts[classNum] || 0
              const percentage = stats.successful > 0 ? (count / stats.successful * 100) : 0
              
              return (
                <div key={classNum} className="breakdown-item">
                  <div className="breakdown-bar" style={{ backgroundColor: classInfo.color }}>
                    <div 
                      className="breakdown-fill"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: classInfo.color 
                      }}
                    />
                  </div>
                  <div className="breakdown-info">
                    <span className="breakdown-label">{classInfo.name}</span>
                    <span className="breakdown-count">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="result-controls">
        <div className="control-group">
          <label>จัดเรียงตาม:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="filename">ชื่อไฟล์</option>
            <option value="confidence">ความเชื่อมั่น</option>
            <option value="class">คลาส</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>กรองโดย:</label>
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="all">ทั้งหมด</option>
            <option value="success">สำเร็จ</option>
            <option value="failed">ล้มเหลว</option>
            <option value="no-dr">No DR</option>
            <option value="mild">Mild DR</option>
            <option value="moderate">Moderate DR</option>
            <option value="severe">Severe DR</option>
            <option value="proliferative">Proliferative DR</option>
          </select>
        </div>
        
        <div className="showing-count">
          แสดง {filteredAndSortedResults.length} จาก {stats.total} ไฟล์
        </div>
      </div>

      {/* Results List */}
      <div className="results-list">
        {filteredAndSortedResults.map((result, index) => {
          const classInfo = result.success ? getClassInfo(result.predicted_class) : null
          const isExpanded = showDetailsFor.has(index)
          
          return (
            <div key={index} className={`result-item ${result.success ? 'success' : 'failed'}`}>
              <div className="result-item-header" onClick={() => toggleDetails(index)}>
                <div className="result-basic-info">
                  <div className={`result-status ${result.success ? 'success' : 'failed'}`}>
                    {result.success ? '✅' : '❌'}
                  </div>
                  
                  <div className="result-filename">
                    {result.filename}
                  </div>
                  
                  {result.success && classInfo && (
                    <div className="result-class" style={{ color: classInfo.color }}>
                      <span className="class-badge" style={{ backgroundColor: classInfo.color }}>
                        {result.predicted_class}
                      </span>
                      {classInfo.name}
                    </div>
                  )}
                  
                  {result.success && (
                    <div className="result-confidence">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                  
                  {!result.success && (
                    <div className="result-error">
                      {result.error}
                    </div>
                  )}
                </div>
                
                <div className="expand-icon">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              
              {isExpanded && (
                <div className="result-item-details">
                  {result.success ? (
                    <div className="success-details">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Class:</span>
                          <span className="detail-value">
                            {result.predicted_class} - {classInfo?.name}
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Confidence:</span>
                          <span className="detail-value">{(result.confidence * 100).toFixed(2)}%</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">DR Probability:</span>
                          <span className="detail-value">{(result.dr_any_probability * 100).toFixed(2)}%</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Processing Time:</span>
                          <span className="detail-value">{result.processing_time}</span>
                        </div>
                      </div>
                      
                      {result.probabilities && (
                        <div className="probabilities">
                          <span className="detail-label">All Probabilities:</span>
                          <div className="prob-bars">
                            {result.probabilities.map((prob, i) => (
                              <div key={i} className="prob-bar">
                                <div className="prob-label">Class {i}</div>
                                <div className="prob-bar-bg">
                                  <div 
                                    className="prob-bar-fill"
                                    style={{ 
                                      width: `${prob * 100}%`,
                                      backgroundColor: getClassInfo(i).color 
                                    }}
                                  />
                                </div>
                                <div className="prob-value">{(prob * 100).toFixed(1)}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="error-details">
                      <div className="error-message">
                        <strong>Error:</strong> {result.error}
                      </div>
                      <div className="error-timestamp">
                        <strong>Time:</strong> {result.timestamp}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredAndSortedResults.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h4>ไม่พบผลลัพธ์</h4>
          <p>ลองเปลี่ยนตัวกรองหรือการจัดเรียง</p>
        </div>
      )}

      {/* Processing Info */}
      <div className="processing-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Total Processing Time:</span>
            <span className="info-value">{batchResult.total_processing_time}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Model Version:</span>
            <span className="info-value">v1.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Processed At:</span>
            <span className="info-value">{batchResult.timestamp}</span>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="medical-disclaimer">
        <div className="disclaimer-icon">⚕️</div>
        <div className="disclaimer-content">
          <h6>คำแนะนำทางการแพทย์</h6>
          <p>ผลการวิเคราะห์นี้เป็นเพียงการคัดกรองเบื้องต้นเท่านั้น ไม่สามารถใช้แทนการวินิจฉัยทางการแพทย์ที่แท้จริง กรุณาปรึกษาจักษุแพทย์เพื่อการตรวจประเมินที่ถูกต้อง</p>
        </div>
      </div>
    </div>
  )
}

export default BatchResultDisplay