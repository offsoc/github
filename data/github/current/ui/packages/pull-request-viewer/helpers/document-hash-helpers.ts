export function parseDiffHash(hash: string): string | undefined {
  const diffMatch = hash.match(/^#?(diff-[a-f0-9]+)/)
  return diffMatch?.[1]
}

export function updateURLHash(hash: string) {
  const newHash = `#${hash}`
  if (newHash === window.location.hash) return

  const oldURL = window.location.href
  history.replaceState({...history.state}, '', newHash)
  window.dispatchEvent(
    new HashChangeEvent('hashchange', {
      newURL: window.location.href,
      oldURL,
    }),
  )
}
export const clearURLHash = () => updateURLHash('')
