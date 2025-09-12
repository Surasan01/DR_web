import React, { useState } from 'react'
import './UploadForm.css'
import { getApiBase } from '../lib/apiConfig'

const UploadForm = ({ onUploadSuccess, onUploadStart, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null)
    setError('')
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
      onUploadSuccess?.(data)
    } catch (err) {
      console.error(err)
      setError('Upload failed. Check API Base URL or backend status.')
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="file-input">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <button type="submit" disabled={isLoading}>Analyze Image</button>
      {error && <div className="error" style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
    </form>
  )
}

export default UploadForm