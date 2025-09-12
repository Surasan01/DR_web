import React, { useEffect, useState } from 'react'
import { getApiBase, getStoredApiBase, setStoredApiBase, normalizeUrl } from '../lib/apiConfig'

export default function ApiSettings() {
  const [value, setValue] = useState(getStoredApiBase() || getApiBase())
  const [status, setStatus] = useState('checking...')
  const [checking, setChecking] = useState(false)

  const checkHealth = async (base) => {
    const url = normalizeUrl(base) + '/api/health'
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

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 16 }}>
      <strong>API Base URL</strong>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://<your-backend-domain>"
          style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
        <button type="button" onClick={onSave} disabled={checking} style={{ padding: '8px 12px' }}>Save</button>
        <button type="button" onClick={onClear} disabled={checking} style={{ padding: '8px 12px' }}>Clear</button>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
        Health: {status} {checking ? '...' : ''}
      </div>
    </div>
  )
}