import React, { useState } from 'react'
import './App.css'
import Header from './components/Header'
import UploadForm from './components/UploadForm'
import ResultDisplay from './components/ResultDisplay'
import BatchUploadForm from './components/BatchUploadForm'
import BatchResultDisplay from './components/BatchResultDisplay'
import ApiSettings from './components/ApiSettings'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [result, setResult] = useState(null)
  const [batchResult, setBatchResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisMode, setAnalysisMode] = useState('single') // 'single' or 'batch'

  const handleUploadSuccess = (data) => {
    console.log('Single upload success:', data)
    setResult(data)
    setBatchResult(null)
    setIsLoading(false)
  }

  const handleBatchUploadSuccess = (data) => {
    console.log('Batch upload success:', data)
    setBatchResult(data)
    setResult(null)
    setIsLoading(false)
  }

  const handleUploadStart = () => {
    console.log('Upload started')
    setIsLoading(true)
    setResult(null)
    setBatchResult(null)
  }

  const handleBatchUploadStart = () => {
    console.log('Batch upload started')
    setIsLoading(true)
    setResult(null)
    setBatchResult(null)
  }

  const handleReset = () => {
    console.log('Reset called')
    setResult(null)
    setBatchResult(null)
    setIsLoading(false)
  }

  // Debug log
  console.log('App state:', { 
    isLoading, 
    result: !!result, 
    batchResult: !!batchResult,
    analysisMode 
  })

  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <main className="main-content">
        <div className="container">
          <ApiSettings />
          <div className="app-description">
            <h2>🩺 AI-Powered Diabetic Retinopathy Detection</h2>
            <p>วิเคราะห์ภาพจอประสาทตาด้วย AI เพื่อตรวจหาอาการจอประสาทตาเสื่อมจากเบาหวาน</p>
          </div>

          {/* Mode Selection */}
          <div className="analysis-mode-selector">
            <div className="mode-tabs">
              <button 
                className={`mode-tab ${analysisMode === 'single' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('single')}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Single Image Analysis
              </button>
              <button 
                className={`mode-tab ${analysisMode === 'batch' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('batch')}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Batch Analysis
              </button>
            </div>
            <div className="mode-description">
              {analysisMode === 'single' ? (
                <p>วิเคราะห์รูปภาพจอประสาทตาภาพเดียว • เหมาะสำหรับการตรวจแบบรายกรณี</p>
              ) : (
                <p>วิเคราะห์หลายรูปภาพพร้อมกัน • เหมาะสำหรับการคัดกรองจำนวนมาก • รองรับการดาวน์โหลดรายงาน CSV</p>
              )}
            </div>
          </div>

          {/* Upload Forms */}
          {analysisMode === 'single' ? (
            <UploadForm
              onUploadSuccess={handleUploadSuccess}
              onUploadStart={handleUploadStart}
              isLoading={isLoading}
            />
          ) : (
            <BatchUploadForm
              onBatchUploadSuccess={handleBatchUploadSuccess}
              onBatchUploadStart={handleBatchUploadStart}
              isLoading={isLoading}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>
                {analysisMode === 'single' 
                  ? 'กำลังวิเคราะห์รูปภาพ...' 
                  : 'กำลังวิเคราะห์หลายรูปภาพ กรุณารอสักครู่...'
                }
              </p>
            </div>
          )}

          {/* Results */}
          {result && analysisMode === 'single' && (
            <ResultDisplay
              result={result}
              onReset={handleReset}
            />
          )}

          {batchResult && analysisMode === 'batch' && (
            <BatchResultDisplay
              batchResult={batchResult}
              onReset={handleReset}
            />
          )}

          {/* Medical Footer */}
          <div className="medical-footer">
            <div className="footer-content">
              <h4>🏥 สำหรับบุคลากรทางการแพทย์</h4>
              <div className="footer-features">
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <span>วิเคราะห์รวดเร็วด้วย AI</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📊</span>
                  <span>รายงาน CSV สำหรับการประมวลผล</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔒</span>
                  <span>ข้อมูลปลอดภัยไม่เก็บบนเซิร์ฟเวอร์</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🎯</span>
                  <span>แม่นยำสูงในการคัดกรอง</span>
                </div>
              </div>
              <p className="footer-disclaimer">
                เครื่องมือนี้ใช้สำหรับการคัดกรองเบื้องต้นเท่านั้น ไม่สามารถใช้แทนการวินิจฉัยทางการแพทย์
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ThemeProvider>
  )
}

export default App