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
    setResult(data)
    setIsLoading(false)
  }

  const handleUploadStart = () => {
    setIsLoading(true)
    setResult(null)
  }

  const handleReset = () => {
    setResult(null)
    setIsLoading(false)
  }

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
            <ResultDisplay
              result={result}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App