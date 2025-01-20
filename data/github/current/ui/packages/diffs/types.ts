export type DiffLineType = 'ADDITION' | 'CONTEXT' | 'DELETION' | 'HUNK' | 'INJECTED_CONTEXT' | 'EMPTY'

export interface SimpleDiffLine {
  left: number | null
  html: string
  right: number | null
  type: DiffLineType
}

export type DiffAnchor = `diff-${string}`
