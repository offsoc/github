export type RefType = 'branch' | 'tag'

export const mapRefType = (ref?: string): RefType | undefined => {
  if (!ref) return undefined
  if (ref.startsWith('refs/tags/')) return 'tag'
  if (ref.startsWith('refs/heads/')) return 'branch'
  return undefined
}
export const qualifyRef = (ref: string, refType: RefType) => {
  if (refType === 'branch') return `refs/heads/${ref}`
  if (refType === 'tag') return `refs/tags/${ref}`
  return ref
}
export const unqualifyRef = (ref?: string) => {
  if (!ref) return undefined
  const refType = mapRefType(ref)
  if (!refType) return ref
  const [, , ...unqualifiedRef] = ref.split('/')
  return unqualifiedRef.join('/')
}
