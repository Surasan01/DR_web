import React, { useState, useRef } from 'react'
import './BatchUploadForm.css'
import { getApiBase } from '../lib/apiConfig'

// Helper function เพื่ออ่านไฟล์ทั้งหมดจากโฟลเดอร์
const getAllFilesFromDirectory = (dirEntry) => {
  return new Promise((resolve) => {
    const files = []
    
    const readDirectory = (entry) => {
      return new Promise((resolveDir) => {
        if (entry.isFile) {
          entry.file((file) => {
            files.push(file)
            resolveDir()
          }, () => resolveDir())
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader()
          dirReader.readEntries((entries) => {
            const promises = entries.map(readDirectory)
            Promise.all(promises).then(() => resolveDir())
          }, () => resolveDir())
        } else {
          resolveDir()
        }
      })
    }
    
    readDirectory(dirEntry).then(() => {
      resolve(files)
    })
  })
}

const BatchUploadForm = ({ onBatchUploadSuccess, onBatchUploadStart, isLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [error, setError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const handleFilesChange = (files, append = false) => {
    // กรองเฉพาะไฟล์รูปภาพ
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (imageFiles.length === 0) {
      setError('ไม่พบไฟล์รูปภาพ กรุณาเลือกไฟล์ JPG, PNG, หรือ GIF')
      return
    }
    
    if (append) {
      // เพิ่มไฟล์ใหม่เข้าไปในรายการเดิม (ไม่ให้ซ้ำกัน)
      const existingNames = new Set(selectedFiles.map(f => f.name))
      const newFiles = imageFiles.filter(file => !existingNames.has(file.name))
      
      if (newFiles.length === 0) {
        setError('ไฟล์ทั้งหมดมีอยู่ในรายการแล้ว')
        return
      }
      
      setSelectedFiles(prev => [...prev, ...newFiles])
      setError(`เพิ่ม ${newFiles.length} ไฟล์ใหม่ (รวม ${selectedFiles.length + newFiles.length} ไฟล์)`)
    } else {
      // แทนที่ไฟล์ทั้งหมด
      setSelectedFiles(imageFiles)
      setError('')
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      const append = selectedFiles.length > 0
      handleFilesChange(e.target.files, append)
    }
  }

  const handleFolderInputChange = (e) => {
    console.log('Folder input change:', e.target.files)
    if (e.target.files && e.target.files.length > 0) {
      const append = selectedFiles.length > 0
      handleFilesChange(e.target.files, append)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const items = e.dataTransfer.items
    const files = e.dataTransfer.files
    
    if (items && items.length > 0) {
      console.log('Dropped items:', items.length)
      
      // ตรวจสอบว่ามีโฟลเดอร์หรือไม่
      const allFiles = []
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry()
          if (entry) {
            if (entry.isDirectory) {
              // อ่านไฟล์จากโฟลเดอร์
              const folderFiles = await getAllFilesFromDirectory(entry)
              allFiles.push(...folderFiles)
            } else {
              // ไฟล์เดี่ยว
              const file = item.getAsFile()
              if (file) allFiles.push(file)
            }
          }
        }
      }
      
      console.log('All files found:', allFiles.length)
      
      // กรองเฉพาะไฟล์รูปภาพ
      const imageFiles = allFiles.filter(file => 
        file && file.type && file.type.startsWith('image/')
      )
      
      console.log('Image files from drop:', imageFiles.length)
      
      if (imageFiles.length === 0) {
        setError('ไม่พบไฟล์รูปภาพในสิ่งที่ลาก กรุณาลากไฟล์ JPG, PNG, GIF หรือโฟลเดอร์ที่มีรูปภาพ')
        return
      }
      
      const append = selectedFiles.length > 0
      
      if (append) {
        // เพิ่มไฟล์ใหม่เข้าไปในรายการเดิม
        const existingNames = new Set(selectedFiles.map(f => f.name))
        const newFiles = imageFiles.filter(file => !existingNames.has(file.name))
        
        if (newFiles.length === 0) {
          setError('ไฟล์ทั้งหมดมีอยู่ในรายการแล้ว')
          return
        }
        
        setSelectedFiles(prev => [...prev, ...newFiles])
        setError(`เพิ่ม ${newFiles.length} ไฟล์ใหม่ (รวม ${selectedFiles.length + newFiles.length} ไฟล์)`)
      } else {
        setSelectedFiles(imageFiles)
        setError('')
      }
    } else if (files && files.length > 0) {
      // fallback สำหรับไฟล์ธรรมดา
      const append = selectedFiles.length > 0
      handleFilesChange(files, append)
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

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    if (newFiles.length === 0) {
      setError('')
    }
  }

  const handleRemoveAll = () => {
    setSelectedFiles([])
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (folderInputRef.current) folderInputRef.current.value = ''
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setError('กรุณาเลือกไฟล์รูปภาพ')
      return
    }

    setError('')
    onBatchUploadStart?.()

    const formData = new FormData()
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })

    const API_BASE = getApiBase()
    try {
      const res = await fetch(`${API_BASE}/api/predict-batch`, {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${txt}`)
      }
      
      const data = await res.json()
      console.log('Batch API Response:', data)
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }
      
      onBatchUploadSuccess?.(data)
    } catch (err) {
      console.error(err)
      setError('การอัพโหลดล้มเหลว กรุณาตรวจสอบการเชื่อมต่อหรือ API Base URL')
    }
  }

  return (
    <div className="batch-upload-form-container">
      <form className="batch-upload-form" onSubmit={handleSubmit}>
        <div className="upload-header">
          <h3>📁 Batch Analysis</h3>
          <p>อัพโหลดหลายรูปภาพพร้อมกันเพื่อวิเคราะห์แบบกลุ่ม</p>
        </div>

        <div 
          className={`batch-upload-area ${isDragActive ? 'drag-active' : ''} ${selectedFiles.length > 0 ? 'has-files' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFiles.length === 0 ? (
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
              <h4>เลือกไฟล์รูปภาพ</h4>
              <p>คลิกปุ่มด้านล่าง หรือลากไฟล์/โฟลเดอร์มาวาง</p>
              
              <div className="upload-buttons">
                <button 
                  type="button" 
                  className="select-files-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('File button clicked')
                    fileInputRef.current?.click()
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  เลือกไฟล์
                </button>
                
                <button 
                  type="button" 
                  className="select-folder-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Folder button clicked')
                    console.log('folderInputRef.current:', folderInputRef.current)
                    folderInputRef.current?.click()
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  เลือกโฟลเดอร์
                </button>
              </div>
              
              <div className="supported-formats">
                <div>รองรับ JPG, PNG, GIF (ไม่จำกัดจำนวนไฟล์)</div>
                <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                  💡 เลือกโฟลเดอร์ = หารูปทั้งหมดในโฟลเดอร์โดยอัตโนมัติ
                </div>
              </div>
            </div>
          ) : (
            <div className="files-preview">
              <div className="files-summary">
                <div className="summary-info">
                  <span className="file-count">{selectedFiles.length} ไฟล์</span>
                  <span className="total-size">{formatFileSize(getTotalSize())}</span>
                </div>
                <div className="summary-actions">
                  <button 
                    type="button" 
                    className="add-more-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Add more files clicked')
                      fileInputRef.current?.click()
                    }}
                  >
                    + เพิ่มไฟล์
                  </button>
                  <button 
                    type="button" 
                    className="add-folder-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Add folder clicked')
                      folderInputRef.current?.click()
                    }}
                  >
                    + เพิ่มโฟลเดอร์
                  </button>
                  <button 
                    type="button" 
                    className="remove-all-btn"
                    onClick={handleRemoveAll}
                  >
                    ลบทั้งหมด
                  </button>
                </div>
              </div>
              
              <div className="files-list">
                {selectedFiles.slice(0, 10).map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                    <button 
                      type="button" 
                      className="remove-file-btn"
                      onClick={() => handleRemoveFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {selectedFiles.length > 10 && (
                  <div className="more-files">
                    และอีก {selectedFiles.length - 10} ไฟล์...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hidden inputs */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          multiple
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        
        <input 
          ref={folderInputRef}
          type="file" 
          webkitdirectory
          multiple
          style={{ display: 'none' }}
          onChange={handleFolderInputChange}
        />

        {error && (
          <div className="message" style={{ 
            color: error.includes('เพิ่ม') ? '#059669' : '#dc2626', 
            marginTop: '1rem', 
            padding: '0.75rem', 
            backgroundColor: error.includes('เพิ่ม') ? '#ecfdf5' : '#fef2f2', 
            borderRadius: '8px',
            border: error.includes('เพิ่ม') ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="analyze-batch-btn"
            disabled={isLoading || selectedFiles.length === 0}
          >
            {isLoading ? (
              <>
                <div className="btn-spinner"></div>
                กำลังวิเคราะห์ {selectedFiles.length} ไฟล์...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12c0 1.2-.2 2.3-.5 3.3m-2.4 5.4a9 9 0 1 1-11.4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                วิเคราะห์ทั้งหมด ({selectedFiles.length} ไฟล์)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BatchUploadForm