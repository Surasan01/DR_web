import React, { useState } from 'react'
import './UploadForm.css'
import { getApiBase } from '../lib/apiConfig'

const UploadForm = ({ onUploadSuccess, onUploadStart, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setError('')
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setError('Please select a valid image file')
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setError('')
    onUploadStart?.()

    const formData = new FormData()
    formData.append('file', selectedFile)

    const API_BASE = getApiBase()
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${txt}`)
      }
      const data = await res.json()
      console.log('API Response:', data)
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }
      
      // Ensure required fields exist
      const processedData = {
        prediction: data.prediction || data.result || 'Unknown',
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.5,
        recommendations: data.recommendations || [],
        timestamp: new Date().toISOString(),
        ...data
      }
      
      onUploadSuccess?.(processedData)
    } catch (err) {
      console.error(err)
      setError('Upload failed. Check API Base URL or backend status.')
    }
  }

  return (
    <div className="upload-form-container">
      <form className="upload-form" onSubmit={handleSubmit}>
        <div 
          className={`upload-area ${isDragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input 
            id="file-input"
            className="file-input"
            type="file" 
            accept="image/*" 
            onChange={handleInputChange}
          />
          
          {!selectedFile ? (
            <div className="upload-content">
              <div className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Upload Retinal Image</h3>
              <p>Drag and drop your image here, or <span className="browse-text">browse</span></p>
              <div className="supported-formats">
                JPG, PNG, GIF up to 10MB
              </div>
            </div>
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <div className="preview-overlay">
                <p>Click to change image</p>
              </div>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="file-info">
            <div className="file-details">
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">{formatFileSize(selectedFile.size)}</div>
            </div>
            <button 
              type="button" 
              className="remove-btn"
              onClick={handleRemoveFile}
            >
              Remove
            </button>
          </div>
        )}

        {error && (
          <div className="error" style={{ 
            color: '#dc2626', 
            marginTop: '1rem', 
            padding: '0.75rem', 
            backgroundColor: '#fef2f2', 
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="analyze-btn"
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Analyze Image
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UploadForm