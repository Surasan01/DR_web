import React, { useState, useRef } from 'react'
import './UploadForm.css'

const UploadForm = ({ onUploadSuccess, onUploadStart, isLoading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      alert('Please select an image file')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    onUploadStart()
    const formData = new FormData()
    formData.append('file', selectedFile)

    const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()
      onUploadSuccess(data)
    } catch (err) {
      console.error(err)
      alert('Upload failed. Please try again.')
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="upload-form-container">
      <form onSubmit={handleSubmit} className="upload-form">
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          
          {previewUrl ? (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
              <div className="preview-overlay">
                <p>Click to change image</p>
              </div>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L7 11H10V4H14V11H17L12 16Z" fill="currentColor"/>
                  <path d="M20 18H4V20H20V18Z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Drop your retinal image here</h3>
              <p>or <span className="browse-text">browse</span> to choose a file</p>
              <div className="supported-formats">
                <span>Supports: JPG, PNG, JPEG</span>
              </div>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="file-info">
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button type="button" onClick={resetForm} className="remove-btn">
              Remove
            </button>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={!selectedFile || isLoading}
            className="analyze-btn"
          >
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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