import React, { useState } from 'react'
import './App.css'
import Header from './components/Header'
import UploadForm from './components/UploadForm'
import ResultDisplay from './components/ResultDisplay'
import ApiSettings from './components/ApiSettings'

function App() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleUploadSuccess = (data) => {
    console.log('Upload success:', data)
    console.log('Data keys:', Object.keys(data))
    console.log('Data.prediction:', data.prediction)
    console.log('Data.confidence:', data.confidence)
    setResult(data)
    setIsLoading(false)
  }

  const handleUploadStart = () => {
    console.log('Upload started')
    setIsLoading(true)
    setResult(null)
  }

  const handleReset = () => {
    console.log('Reset called')
    setResult(null)
    setIsLoading(false)
  }

  // Debug log
  console.log('App state:', { isLoading, result: !!result })

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="container">
          <ApiSettings />
          <div className="app-description">
            <h2>AI-Powered Diabetic Retinopathy Detection</h2>
            <p>Upload a retinal image to get instant AI analysis for diabetic retinopathy detection</p>
          </div>

          <UploadForm
            onUploadSuccess={handleUploadSuccess}
            onUploadStart={handleUploadStart}
            isLoading={isLoading}
          />

          {isLoading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Analyzing image...</p>
            </div>
          )}

          {result && (
            <>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.9)', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                color: '#333',
                fontSize: '0.9rem'
              }}>
                <strong>Debug Info:</strong>
                <pre style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              <ResultDisplay
                result={result}
                onReset={handleReset}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App