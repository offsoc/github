let _isWebkit: boolean | null = null

export function isWebkit(): boolean {
  if (_isWebkit != null) return _isWebkit
  const ua = navigator.userAgent.toLowerCase()
  _isWebkit = ua.includes('webkit') && !ua.includes('chrome')
  return _isWebkit
}
