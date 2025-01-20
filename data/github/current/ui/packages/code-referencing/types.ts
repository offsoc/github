import type {SafeHTMLString} from '@github-ui/safe-html'

export type FileReference = {
  url: string
  nwo: string
  path: string
  commit_id: string
  license: string | null
  ref: {value: string; label: string}
} & (
  | {
      colorized_lines: Array<{html: SafeHTMLString; number: number}>
      language?: string
      language_color?: string
    }
  | {
      colorized_lines?: undefined
      language?: never
      language_color?: never
    }
)

export type CodeReferenceShowPayload = {
  /** total number of results for this search */
  total_results: number
  /** the number of pages for this results search */
  total_pages: number
  /** total number of matches for this cursor */
  total_matches: number
  licenses: Array<{
    label: string
    key: string
    count: number
  }>
  files: FileReference[]
}
