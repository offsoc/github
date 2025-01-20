// Find element within document matching location hash.
export function findFragmentTarget(document: Document, hash: string = location.hash): Element | null {
  return findElementByFragmentName(document, decodeFragmentValue(hash))
}

// Find element within document matching id or name.
export function findElementByFragmentName(document: Document, name: string): Element | null {
  if (name === '') return null
  return document.getElementById(name) || document.getElementsByName(name)[0] || null
}

// Decode location hash.
export function decodeFragmentValue(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return ''
  }
}
