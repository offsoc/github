import type {Repository} from '@github-ui/current-repository'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type {CodeReference, CodeSymbol} from './code-symbol'

export type CodeNavBackendType = 'precise' | 'search'

export type CodeNavResultsBackend =
  | 'ALEPH_PRECISE'
  | 'ALEPH_PRECISE_PREVIEW'
  | 'ALEPH_PRECISE_DEVELOPMENT'
  | 'BLACKBIRD'

export interface CodeNavResultDetails {
  backend: CodeNavResultsBackend
  filePaths: string[]
  payload: AlephSymbol[][]
}

export interface CodeNavPromise {
  definitions: Promise<DefinitionsResult>
  localReferences: Promise<ReferencesResult>
  crossReferences: Promise<ReferencesResult>
  setLoading: (loading: boolean) => void
}

export interface ReferencesResult {
  references: CodeReference[]
  backend: CodeNavBackendType
}

export interface DefinitionsResult {
  definitions: CodeSymbol[]
  backend: CodeNavBackendType
}

export interface AlephSymbol {
  firstLine?: string
  ident: NavRange
  extent: NavRange
  local?: boolean
  path?: string
  kind?: string
  symbolKind: string | number
  uri?: string
  commitOid?: string
  repo?: Repository
  highlightedText: SafeHTMLString
  leadingWhitespace: number
}

interface NavRange {
  start: {
    line: number
    character?: number
  }
  end?: {
    line: number
    character: number
  }
}

export interface TreeNode {
  symbol: CodeSymbol
  children: TreeNode[]
  isParent: boolean
}
export interface SymbolTreeBuildingData {
  symbol: CodeSymbol
  depth: number
}
