export function normalizeUrl(url) {
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

export function getStoredApiBase() {
  try {
    return normalizeUrl(localStorage.getItem('apiBaseUrl') || '')
  } catch {
    return ''
  }
}

export function setStoredApiBase(url) {
  try {
    const val = normalizeUrl(url)
    if (val) localStorage.setItem('apiBaseUrl', val)
    else localStorage.removeItem('apiBaseUrl')
  } catch {}
}

export function getApiBase() {
  const override = getStoredApiBase()
  if (override) return override
  const envBase = normalizeUrl(import.meta.env.VITE_API_BASE_URL || '')
  if (envBase) return envBase
  return normalizeUrl(window.location.origin || '')
}