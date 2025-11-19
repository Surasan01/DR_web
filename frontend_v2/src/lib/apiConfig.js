const DEFAULT_API_BASE = 'https://8000-dep-01kabqt5aktqkvgc2zrfjadxhe-d.cloudspaces.litng.ai'

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
  return normalizeUrl(DEFAULT_API_BASE)
}

export function getDefaultApiBase() {
  return normalizeUrl(DEFAULT_API_BASE)
}