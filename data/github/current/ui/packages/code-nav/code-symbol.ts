import type {Repository} from '@github-ui/current-repository'
import type {StylingDirectivesLine} from '@github-ui/code-view-types'
import {blamePath, blobPath} from '@github-ui/paths'
import type {RefInfo} from '@github-ui/repos-types'
import type {SafeHTMLString} from '@github-ui/safe-html'

interface Position {
  line: number
  column: number
}

export interface Range {
  start: Position
  end: Position
}

export enum SymbolSource {
  BLACKBIRD_SEARCH = 'blackbird-search',
  BLACKBIRD_ANALYSIS = 'blackbird-analysis',
  ALEPH_PRECISE = 'aleph-precise',
  BLOB_CONTENT = 'blob-content-search',
}

export class SymbolKind {
  enumStringVal: string
  fullName: string
  shortName: string
  plColor: string
  rank: number

  constructor({kind}: {kind: string | number}) {
    const [fullName, enumStringVal] = convertBlackbirdSymbolKind(kind)

    this.enumStringVal = enumStringVal
    this.fullName = fullName
    this.shortName = symbolKindShortName(fullName)
    this.plColor = symbolKindColor(fullName)
    this.rank = symbolKindRank(fullName)
  }
}

// Convert a blackbird SymbolKind enum value to a display friendly string.
// Source of truth: https://github.com/github/hydro-schemas/blob/main/proto/hydro/schemas/blackbird/v0/entities/symbol_kind.proto
function convertBlackbirdSymbolKind(kind: string | number): [string, string] {
  if (typeof kind === 'string') {
    const name = kind.toString().replace('SYMBOL_KIND_', '').replace(/_DEF$/, '').replace(/_REF$/, '').toLowerCase()
    if (kind.startsWith('SYMBOL_KIND_')) {
      return [name, kind.toString()]
    } else if (kind !== '' && kind !== 'unknown') {
      let enumVal = `SYMBOL_KIND_${kind.toUpperCase()}`
      if (kind === 'call') {
        enumVal += '_REF'
      } else {
        enumVal += '_DEF'
      }
      return [kind, enumVal]
    }
  }

  return ['unknown', 'SYMBOL_KIND_UNKNOWN']
}

export function symbolKindShortName(fullName: string) {
  switch (fullName) {
    case 'function':
    case 'method':
      return 'func'
    case 'interface':
      return 'intf'
    case 'implementation':
      return 'impl'
    case 'constant':
      return 'const'
    case 'module':
      return 'mod'

    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
    case 'class':
    case 'call':
    case 'enum':
    case 'field':
    case 'macro':
    case 'struct':
    case 'trait':
    case 'type':
    case 'union':
      return fullName

    default:
      return fullName.substring(0, 1)
  }
}

function symbolKindColor(fullName: string) {
  switch (fullName) {
    case 'function':
    case 'method':
      return 'prettylights.syntax.entity'
    case 'class':
    case 'enum':
    case 'struct':
    case 'union':
      return 'prettylights.syntax.constant'
    case 'interface':
    case 'trait':
      return 'prettylights.syntax.keyword'
    case 'constant':
    case 'field':
    case 'enum member':
      return 'prettylights.syntax.variable'
    case 'implementation':
      return 'prettylights.syntax.string'

    default:
      return 'prettylights.syntax.entity'
  }
}

// Relative rank of symbol kinds. Lower is higher relevance.
function symbolKindRank(kind: string): number {
  return (
    {
      class: 1,
      struct: 1,
      enum: 1,
      type: 2,
      interface: 3,
      trait: 3,
      module: 4,
      implementation: 5,
      function: 6,
      method: 7,
      call: 8,
      field: 9,
    }[kind] || 9
  )
}

export class CodeSymbol {
  ident: Range
  extent: Range

  kind: SymbolKind
  name: string
  fullyQualifiedName: string
  depth: number

  repo: Repository
  refInfo: RefInfo
  path: string

  // Snippet for the line the symbol is defined on
  highlightedText: SafeHTMLString | undefined
  stylingDirectives: StylingDirectivesLine | undefined
  bodyText: string
  leadingWhitespace: number | undefined

  source: SymbolSource

  constructor({
    ident,
    extent,
    kind,
    name,
    fullyQualifiedName,
    source,
  }: {
    ident: Range
    extent: Range
    kind: string | number
    name: string
    fullyQualifiedName: string
    source: SymbolSource
  }) {
    this.ident = ident
    this.extent = extent
    this.kind = new SymbolKind({kind})
    this.name = name
    this.fullyQualifiedName = fullyQualifiedName
    this.source = source
  }

  setSymbolDepth(depth: number) {
    this.depth = depth
  }
  setFileInfo(repo: Repository, refInfo: RefInfo, path: string) {
    this.repo = repo
    this.refInfo = refInfo
    this.path = path
  }

  get lineNumber() {
    return this.ident.start.line + 1
  }

  setSnippet(
    highlightedText: SafeHTMLString | undefined,
    stylingDirectives: StylingDirectivesLine | undefined,
    bodyText: string,
    leadingWhitespace: number | undefined,
  ) {
    this.highlightedText = highlightedText
    this.stylingDirectives = stylingDirectives
    this.bodyText = bodyText
    this.leadingWhitespace = leadingWhitespace
  }

  href(): string {
    if (!this.repo || !this.refInfo || !this.path) {
      return `/${window.location.pathname}#L${this.lineNumber}`
    }

    const commitish =
      this.source === SymbolSource.BLACKBIRD_SEARCH
        ? this.repo.defaultBranch
        : this.refInfo.name || this.refInfo.currentOid

    return blobPath({
      owner: this.repo.ownerLogin,
      repo: this.repo.name,
      commitish,
      filePath: this.path,
      lineNumber: this.lineNumber,
    })
  }

  // Generates a string which uniquely identifies the file this reference comes from
  pathKey(): string {
    return `${this.repo.ownerLogin}/${this.repo.name}/${this.refInfo.currentOid}/${this.path}`
  }
}

export class CodeReference {
  ident: Range
  repo: Repository
  refInfo: RefInfo
  path: string
  isPlain: boolean

  // Snippet information for the line the reference is from
  highlightedText: SafeHTMLString | undefined
  stylingDirectives: StylingDirectivesLine | undefined
  bodyText: string
  source: SymbolSource
  leadingWhitespace: number | undefined

  constructor({
    ident,
    repo,
    refInfo,
    path,
    isPlain,
    source,
  }: {
    ident: Range
    repo: Repository
    refInfo: RefInfo
    path: string
    isPlain?: boolean
    source: SymbolSource
  }) {
    this.ident = ident
    this.repo = repo
    this.refInfo = refInfo
    this.path = path
    this.isPlain = isPlain ?? false
    this.source = source
  }

  get lineNumber() {
    return this.ident.start.line + 1
  }

  href(blame: boolean): string {
    if (!this.repo || !this.refInfo || !this.path) {
      return `/${window.location.pathname}#L${this.lineNumber}`
    }

    const commitish =
      this.source === SymbolSource.BLACKBIRD_SEARCH
        ? this.repo.defaultBranch
        : this.refInfo.name || this.refInfo.currentOid

    const params = {
      owner: this.repo.ownerLogin,
      repo: this.repo.name,
      commitish,
      filePath: this.path,
      lineNumber: this.lineNumber,
      plain: this.isPlain ? 1 : undefined,
    }

    return blame ? blamePath(params) : blobPath(params)
  }

  setSnippet(
    highlightedText: SafeHTMLString | undefined,
    stylingDirectives: StylingDirectivesLine | undefined,
    bodyText: string,
    leadingWhitespace: number | undefined,
  ) {
    this.highlightedText = highlightedText
    this.stylingDirectives = stylingDirectives
    this.bodyText = bodyText
    this.leadingWhitespace = leadingWhitespace
  }

  // Generates a string which uniquely identifies the file this reference comes from
  pathKey(): string {
    return `${this.repo.ownerLogin}/${this.repo.name}/${this.refInfo.currentOid}/${this.path}`
  }
}

export type DefinitionOrReference = CodeSymbol | CodeReference
