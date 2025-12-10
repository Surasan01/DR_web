import React, { useEffect, useState } from 'react'
import { getApiBase, getStoredApiBase, setStoredApiBase, normalizeUrl, getDefaultApiBase } from '../lib/apiConfig'

export default function ApiSettings() {
  const [value, setValue] = useState(getStoredApiBase() || getApiBase())
  const [status, setStatus] = useState('checking...')
  const [checking, setChecking] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const defaultBase = getDefaultApiBase()

  const checkHealth = async (base) => {
    const url = normalizeUrl(base) + '/health'
    try {
      setChecking(true)
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const dev = (data && (data.device || '')) || ''
      const gpu = (data && data.gpu_available) ? ' / GPU' : ''
      setStatus(`OK (${dev}${gpu})`)
    } catch {
      setStatus('unreachable')
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    checkHealth(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSave = async () => {
    setStoredApiBase(value)
    await checkHealth(value)
    alert('Saved API base URL')
  }

  const onClear = async () => {
    setStoredApiBase('')
    const fallback = getApiBase()
    setValue(fallback)
    await checkHealth(fallback)
    alert('Cleared override; using default')
  }

  const currentDisplayUrl = normalizeUrl(value) || defaultBase

  return (
    <div style={{ 
      background: 'rgba(248, 250, 252, 0.95)', 
      border: '1px solid #e5e7eb', 
      borderRadius: 12, 
      padding: 16, 
      marginBottom: 24,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 auto', minWidth: 200 }}>
          <strong style={{ color: '#374151', fontSize: '1rem' }}>API Base URL</strong>
          <div style={{ color: '#1d4ed8', fontSize: '0.9rem', marginTop: 4 }}>
            {currentDisplayUrl}
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
            สถานะ: {checking ? 'กำลังตรวจสอบ...' : status}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #3b82f6',
            background: isOpen ? '#3b82f6' : 'white',
            color: isOpen ? 'white' : '#1d4ed8',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isOpen ? 'ปิดการตั้งค่า' : 'เปิดการตั้งค่า'}
        </button>
      </div>

      {isOpen && (
        <>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: 12 }}>
            ระบบจะใช้ค่าเริ่มต้น <code>{defaultBase}</code> โดยอัตโนมัติ หากต้องการกำหนดเองให้กรอกด้านล่าง
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://<your-backend-domain>"
              style={{ 
                flex: 1, 
                minWidth: 220,
                padding: 8, 
                border: '1px solid #cbd5e1', 
                borderRadius: 6,
                fontSize: '0.9rem'
              }}
            />
            <button 
              type="button" 
              onClick={onSave} 
              disabled={checking} 
              style={{ 
                padding: '8px 12px',
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: 6, 
                cursor: checking ? 'not-allowed' : 'pointer',
                opacity: checking ? 0.7 : 1,
                flexShrink: 0
              }}
            >
              Save
            </button>
            <button 
              type="button" 
              onClick={onClear} 
              disabled={checking} 
              style={{ 
                padding: '8px 12px',
                background: '#6b7280', 
                color: 'white', 
                border: 'none', 
                borderRadius: 6, 
                cursor: checking ? 'not-allowed' : 'pointer',
                opacity: checking ? 0.7 : 1,
                flexShrink: 0
              }}
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  )
}