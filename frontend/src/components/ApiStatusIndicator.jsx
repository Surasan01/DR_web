import React, { useCallback, useEffect, useRef, useState } from 'react'
import './ApiStatusIndicator.css'
import { getApiBase } from '../lib/apiConfig'

const STATUS = {
  CHECKING: 'checking',
  ONLINE: 'online',
  OFFLINE: 'offline'
}

export default function ApiStatusIndicator() {
  const [status, setStatus] = useState(STATUS.CHECKING)
  const [message, setMessage] = useState('กำลังตรวจสอบการเชื่อมต่อ...')
  const isMounted = useRef(true)

  const checkConnection = useCallback(async () => {
    if (!isMounted.current) return
    setStatus(STATUS.CHECKING)
    setMessage('กำลังตรวจสอบการเชื่อมต่อ...')

    const baseUrl = getApiBase()
    if (!baseUrl) {
      if (!isMounted.current) return
      setStatus(STATUS.OFFLINE)
      setMessage('ไม่พบ API base URL ที่กำหนดไว้')
      return
    }

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      })

      if (!response.ok) throw new Error('bad status')
      const data = await response.json()
      const info = [data?.device, data?.gpu_available ? 'GPU' : null]
        .filter(Boolean)
        .join(' · ')

      if (!isMounted.current) return
      setStatus(STATUS.ONLINE)
      setMessage(info ? `พร้อมใช้งาน (${info})` : 'พร้อมใช้งาน')
    } catch (error) {
      if (!isMounted.current) return
      setStatus(STATUS.OFFLINE)
      setMessage('ไม่สามารถเชื่อมต่อ API ได้')
    }
  }, [])

  useEffect(() => {
    const wrappedCheck = async () => {
      await checkConnection()
    }

    wrappedCheck()
    const intervalId = setInterval(wrappedCheck, 30000)

    return () => {
      isMounted.current = false
      clearInterval(intervalId)
    }
  }, [checkConnection])

  useEffect(() => () => {
    isMounted.current = false
  }, [])

  return (
    <div className={`api-status-indicator ${status}`}>
      <span className="status-dot" aria-hidden="true"></span>
      <div className="status-info">
        <span className="status-label">
          {status === STATUS.ONLINE && 'เชื่อมต่อ API แล้ว'}
          {status === STATUS.OFFLINE && 'เชื่อมต่อ API ไม่ได้'}
          {status === STATUS.CHECKING && 'กำลังเชื่อมต่อ...'}
        </span>
        <span className="status-message">{message}</span>
      </div>
      <button
        className="status-refresh"
        type="button"
        onClick={checkConnection}
        aria-label="รีเฟรชสถานะ API"
        title="รีเฟรชสถานะ API"
      >
        ↻
      </button>
    </div>
  )
}
