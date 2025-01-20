import type {Repository} from '@github-ui/current-repository'
import {codeNavigationPath} from '@github-ui/paths'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import type {RefInfo} from '@github-ui/repos-types'
import type {BlackbirdSymbol, StylingDirectivesDocument} from '@github-ui/code-view-types'
import type {
  CodeNavBackendType,
  CodeNavPromise,
  CodeNavResultDetails,
  SymbolTreeBuildingData,
  TreeNode,
} from './code-nav-types'
import {
  CodeReference,
  type CodeSymbol,
  type DefinitionOrReference,
  type Range,
  SymbolKind,
  SymbolSource,
} from './code-symbol'
import {getMatchGenerator, type Matchable, symbolMatchable, textMatchable} from './get-match'
import {alephSymbolToCodeReference, alephSymbolToCodeSymbol, outlineSymbolToCodeSymbol} from './symbol-result-converter'

const SEARCH_RESULT_LIMIT = 200

export interface CodeSection {
  startLine: number
  endLine: number
  collapsed: boolean
  index: number
  level: number
}

export class CodeNavigationInfo {
  repo: Repository
  refInfo: RefInfo
  language: string
  path: string
  loggedIn: boolean
  blobLines: string[]
  symbols: CodeSymbol[]
  lineIndexedSymbols: {[line: number]: CodeSymbol} = {}
  isPlain: boolean

  symbolTree: TreeNode[]
  stylingDirectives: StylingDirectivesDocument | undefined
  setLoading: (loading: boolean) => void
  codeSections: Map<number, CodeSection[]>
  lineToSectionMap: Map<number, CodeSection[]>

  constructor(
    repo: Repository,
    refInfo: RefInfo,
    path: string,
    loggedIn: boolean,
    rawLines: string[],
    symbols: BlackbirdSymbol[],
    stylingDirectives: StylingDirectivesDocument | undefined,
    language: string,
    isPlain: boolean,
    setLoading: (loading: boolean) => void,
  ) {
    this.setLoading = setLoading
    this.setLoading(true)
    this.repo = repo
    this.refInfo = refInfo
    this.path = path
    this.loggedIn = loggedIn
    this.language = language

    this.blobLines = rawLines
    this.stylingDirectives = stylingDirectives
    this.isPlain = isPlain
    this.symbols = this.initSymbols(symbols)

    this.initSymbolTree()
    this.initCodeSections()
    this.setLoading(false)
  }

  initCodeSections() {
    const m = new Map()
    const lineToSectionMap = new Map()
    for (let i = 0; i < this.symbols.length; i++) {
      //we don't want to deal with applying sticky if it is going to be a 2 line long sticky section
      if (this.symbols[i]!.lineNumber < this.symbols[i]!.extent.end.line - 2) {
        const section = {
          startLine: this.symbols[i]!.lineNumber,
          endLine: this.symbols[i]!.extent.end.line,
          index: i,
          collapsed: false,
          level: this.symbols[i]!.depth,
        }
        if (m.has(section.startLine)) {
          const tempArray = m.get(section.startLine)
          tempArray.push(section)
          m.set(section.startLine, tempArray)
        } else {
          m.set(section.startLine, [section])
        }
        if (m.has(section.endLine)) {
          const tempArray = m.get(section.endLine)
          tempArray.push(section)
          m.set(section.endLine, tempArray)
        } else {
          m.set(section.endLine, [section])
        }

        //don't include the start lines or end lines because they're in the other map
        for (let j = section.startLine + 1; j < section.endLine; j++) {
          if (lineToSectionMap.has(j)) {
            const tempArray = lineToSectionMap.get(j)
            tempArray.push(section)
            lineToSectionMap.set(j, tempArray)
          } else {
            lineToSectionMap.set(j, [section])
          }
        }
      }
    }

    this.lineToSectionMap = lineToSectionMap
    this.codeSections = m
  }

  initSymbols(symbols: BlackbirdSymbol[]) {
    return symbols.map(outlineSymbol => {
      const snippet = this.blobLines[outlineSymbol.ident_utf16.start.line_number] || ''
      const codeSymbol = outlineSymbolToCodeSymbol(outlineSymbol, snippet, {
        stylingDirectives: this.stylingDirectives,
        repo: this.repo,
        refInfo: this.refInfo,
        path: this.path,
      })

      this.lineIndexedSymbols[codeSymbol.lineNumber] = codeSymbol

      return codeSymbol
    })
  }

  getBlobLine(line: number) {
    return this.blobLines[line] || ''
  }

  getSymbolOnLine(lineNumber: number): CodeSymbol | undefined {
    return this.lineIndexedSymbols[lineNumber]
  }

  initSymbolTree() {
    if (this.symbols) {
      const tempParents: CodeSymbol[] = []
      const symbolTree: SymbolTreeBuildingData[] = this.symbols
        .filter(s => s.kind.fullName !== 'field')
        .map(symbol => {
          let depth = 0
          for (let i = tempParents.length - 1; i >= 0; i--) {
            const parentSymbol = tempParents[i]!
            if (isAfterSymbol(symbol, parentSymbol)) {
              tempParents.pop()
            } else {
              depth = tempParents.length
              break
            }
          }
          tempParents.push(symbol)
          symbol.setSymbolDepth(depth)
          return {symbol, depth}
        })
      this.symbolTree = []

      for (let index = 0; index < symbolTree.length; index++) {
        const symbol = symbolTree[index]!
        if (index + 1 < symbolTree.length) {
          const nextSymbol = symbolTree[index + 1]!
          if (nextSymbol.depth > symbol.depth) {
            const symbolChildren = buildSymbolTreeChildren(symbolTree, index)
            index += determineTotalNumberOfChildren(symbolChildren)
            this.symbolTree.push({symbol: symbol.symbol, isParent: true, children: symbolChildren})
            continue
          }
        }
        this.symbolTree.push({symbol: symbol.symbol, isParent: false, children: []})
      }
    }
  }

  createReferences(matches: Range[]): CodeReference[] {
    return matches.map(match => {
      const reference = new CodeReference({
        ident: match,
        repo: this.repo,
        refInfo: this.refInfo,
        path: this.path,
        isPlain: this.isPlain,
        source: SymbolSource.BLOB_CONTENT,
      })
      reference.setSnippet(
        undefined,
        this.stylingDirectives?.[match.start.line],
        this.blobLines[match.start.line]!,
        undefined,
      )
      return reference
    })
  }

  getReferencesToSymbol(symbolName: string): CodeReference[] {
    //TODO: figure out loading once this is async
    const ranges = searchInBlobContent(this.blobLines, symbolMatchable(symbolName))
    return this.createReferences(ranges)
  }

  getReferencesToSearch(term: string): CodeReference[] {
    //TODO: figure out loading once this is async
    const ranges = searchInBlobContent(this.blobLines, textMatchable(term))
    return this.createReferences(ranges)
  }

  getDefinitionsAndReferences(text: string, row: number, column: number): CodeNavPromise {
    this.setLoading(true)

    const defs = (async () => {
      const selectedSymbol = this.getSymbolOnLine(row + 1) // row is 0-indexed, line numbers are 1-indexed
      if (selectedSymbol && selectedSymbol.name === text) {
        return {
          definitions: [selectedSymbol],
          backend: 'search' as CodeNavBackendType,
        }
      }

      let [definitions, backend] = await this.getAlephDefinitions(text, row, column, this.loggedIn)

      // Prefer locally-defined symbols over search-based definitions, unless precise results are available.
      if (backend === 'search') {
        const localDefinitions = this.getLocalDefinitions(text)
        if (localDefinitions.length > 0) {
          definitions = localDefinitions
        }

        // If we get a definition from the current file, suppress all the others
        const localDefinition = definitions.find(d => d.path === this.path && d.repo === this.repo)
        if (localDefinition) {
          definitions = [localDefinition]
        }
        backend = 'search'
      } else {
        const localDefinitionsForKindFallback = this.getLocalDefinitions(text, true)
        for (const definition of definitions) {
          if (definition.kind.fullName === '' && definition.name === text) {
            //local definitions always returns an array with a single item if it returns anything
            //instead of empty string we can choose a default kind to display here when aleph and local have nothing,
            //but for now keeping as empty string
            definition.kind = localDefinitionsForKindFallback[0]
              ? localDefinitionsForKindFallback[0].kind
              : new SymbolKind({kind: ''})
          }
        }
      }
      return {
        definitions,
        backend,
      }
    })()

    const localRefs = (async () => {
      const {definitions} = await defs
      const definitionLines = definitions.map(d => d.lineNumber)
      const references = this.getReferencesToSymbol(text).filter(r => !definitionLines.includes(r.lineNumber))

      return {
        references,
        backend: 'search' as CodeNavBackendType,
      }
    })()

    const alephRefs = (async () => {
      let symbolKind = 'SYMBOL_KIND_UNKNOWN'
      const sym = this.getSymbolOnLine(row + 1) // row is 0-indexed, line numbers are 1-indexed
      if (sym) {
        // If we have this in the symbol outline (from blackbird analysis): use it.
        symbolKind = sym.kind.enumStringVal
      } else {
        // Otherwise, try to use the first def
        const {definitions} = await defs
        symbolKind = definitions[0]?.kind?.enumStringVal || symbolKind
      }
      return this.getAlephReferences(text, row, column, this.loggedIn, symbolKind)
    })()

    const crossRefs = (async () => {
      const [references, backend] = await alephRefs
      return {
        references,
        backend,
      }
    })()

    // Exclude definitions from references
    return {
      definitions: defs,
      localReferences: localRefs,
      crossReferences: crossRefs,
      setLoading: this.setLoading,
    }
  }

  getLocalDefinitions(text: string, getSymbolKind = false): CodeSymbol[] {
    let bestRank = 9
    let definitions: CodeSymbol[] = []
    for (const sym of this.symbols) {
      if (sym.name === text && (sym.kind.rank < bestRank || getSymbolKind)) {
        bestRank = sym.kind.rank
        definitions = [sym]
      }
    }

    return definitions
  }

  async getAlephDefinitions(
    text: string,
    row: number,
    column: number,
    loggedIn: boolean,
  ): Promise<[CodeSymbol[], CodeNavBackendType]> {
    let backend: CodeNavBackendType = 'search'
    if ((text === '' && row === -1 && column === -1) || !loggedIn) {
      return [[], backend]
    }

    const definitionsUrl = codeNavigationPath({
      repo: this.repo,
      type: 'definition',
      q: text,
      language: this.language,
      row,
      column,
      ref: this.refInfo.name,
      path: this.path,
      codeNavContext: 'BLOB_VIEW',
      symbolKind: null,
    })

    let response: Response
    try {
      response = await verifiedFetchJSON(definitionsUrl)
    } catch (e) {
      return [[], backend]
    }

    if (!response.ok) {
      return [[], backend]
    }

    let resultDetails: CodeNavResultDetails
    try {
      resultDetails = await response.json()
    } catch (e) {
      return [[], backend]
    }

    backend = parseAlephBackendType(resultDetails.backend) ?? 'search'

    const definitions = resultDetails.payload
      .flatMap(refs => refs)
      .map(alephSymbol => {
        return alephSymbolToCodeSymbol(alephSymbol, {
          stylingDirectives: this.stylingDirectives,
          repo: this.repo,
          refInfo: this.refInfo,
          path: this.path,
          symbol: text,
          backend,
        })
      })

    return [definitions, backend]
  }

  async getAlephReferences(
    text: string,
    row: number,
    column: number,
    loggedIn: boolean,
    symbolKind: string,
  ): Promise<[CodeReference[], CodeNavBackendType]> {
    let backend: CodeNavBackendType = 'search'
    if ((text === '' && row === -1 && column === -1) || !loggedIn) {
      return [[], backend]
    }

    const referencesUrl = codeNavigationPath({
      repo: this.repo,
      type: 'references',
      q: text,
      language: this.language,
      row,
      column,
      ref: this.refInfo.name,
      path: this.path,
      codeNavContext: 'BLOB_VIEW',
      symbolKind,
    })

    const partialResponse = await verifiedFetchJSON(referencesUrl)
    if (!partialResponse.ok) {
      return [[], backend]
    }

    let response: CodeNavResultDetails
    try {
      response = await partialResponse.json()
    } catch (e) {
      return [[], backend]
    }

    backend = parseAlephBackendType(response.backend) ?? 'search'

    const observedLines = new Set<number>()
    const isCheckedLine = (line: number) => {
      if (observedLines.has(line)) {
        return true
      } else {
        observedLines.add(line)
        return false
      }
    }

    const references = response.payload
      .flatMap(refs => refs)
      .reduce<CodeReference[]>((results, alephSymbol) => {
        if (alephSymbol.path === this.path) {
          return results
        }
        const reference = alephSymbolToCodeReference(alephSymbol, {
          stylingDirectives: this.stylingDirectives,
          repo: this.repo,
          refInfo: this.refInfo,
          path: this.path,
          backend,
        })

        if (isCheckedLine(reference.lineNumber)) {
          return results
        }

        results.push(reference)
        return results
      }, [])
      // For some reason, aleph returns references out of order, so we need to sort
      // them by line number.
      .sort((a, b) => a.lineNumber - b.lineNumber)

    return [references, backend]
  }
}

export function parseAlephBackendType(fromAleph: string): CodeNavBackendType | null {
  switch (fromAleph) {
    case 'ALEPH_PRECISE':
    case 'ALEPH_PRECISE_PREVIEW':
    case 'ALEPH_PRECISE_DEVELOPMENT':
      return 'precise'
    case 'BLACKBIRD':
      return 'search'
    default:
      return null
  }
}

export function isAfterSymbol(symbolA: CodeSymbol, symbolB: CodeSymbol): boolean {
  return symbolA.extent.start.line === symbolB.extent.end.line
    ? symbolA.extent.start.column > symbolB.extent.end.column
    : symbolA.extent.start.line > symbolB.extent.end.line
}

function buildSymbolTreeChildren(symbolTree: SymbolTreeBuildingData[], currentIndex: number) {
  const symbolChildren: TreeNode[] = []
  const symbol = symbolTree[currentIndex]!
  for (let i = currentIndex + 1; i < symbolTree.length; i++) {
    const tempSymbol = symbolTree[i]!
    if (tempSymbol.depth > symbol.depth) {
      const tempChildren = buildSymbolTreeChildren(symbolTree, i)
      i += determineTotalNumberOfChildren(tempChildren)
      symbolChildren.push({
        symbol: tempSymbol.symbol,
        children: tempChildren,
        isParent: tempChildren.length > 0,
      })
    } else {
      break
    }
  }
  return symbolChildren
}

function determineTotalNumberOfChildren(node: TreeNode[]) {
  let total = node.length
  for (let i = 0; i < node.length; i++) {
    const currNode = node[i]!
    if (currNode.isParent) {
      total += determineTotalNumberOfChildren(currNode.children)
    }
  }

  return total
}

export function searchInBlobContent(lines: string[], m: Matchable): Range[] {
  const output: Range[] = []
  const matches = getMatchGenerator(m, lines)
  let match = matches.next()

  while (!match.done && output.length < SEARCH_RESULT_LIMIT) {
    const {column, columnEnd, line} = match.value
    output.push({
      start: {
        line,
        column,
      },
      end: {
        line,
        column: columnEnd,
      },
    })

    match = matches.next()
  }
  return output
}

export function searchInBlobIncrementally(
  codeRefs: DefinitionOrReference[],
  lines: string[],
  matchable: Matchable,
): Range[] {
  if (codeRefs.length === 0) {
    // In the incremental search we are narrowing results. If there are no results for a less specific search, there won't be any further matches.
    return []
  }

  const startedAtResultLimit = codeRefs.length >= SEARCH_RESULT_LIMIT

  const checkedLine: Record<number, true> = {}
  const searchResults = codeRefs.reduce<Range[]>((output, ref) => {
    if (checkedLine[ref.ident.start.line]) {
      return output
    }

    checkedLine[ref.ident.start.line] = true
    const matches = getMatchGenerator(matchable, [lines[ref.ident.start.line]!])
    let match = matches.next()
    while (!match.done && output.length < SEARCH_RESULT_LIMIT) {
      const {column, columnEnd} = match.value
      output.push({
        start: {
          line: ref.ident.start.line,
          column,
        },
        end: {
          line: ref.ident.start.line,
          column: columnEnd,
        },
      })
      match = matches.next()
    }

    return output
  }, [])

  // Add new results from the raw blob. Note: this is only necessary if we dropped the number
  // of results below the maximum in the previous phase!
  if (searchResults.length < SEARCH_RESULT_LIMIT && startedAtResultLimit) {
    const startFromLine = codeRefs[codeRefs.length - 1]!.ident.start.line
    const matchesInRawBlob = getMatchGenerator(matchable, lines, startFromLine)
    let match = matchesInRawBlob.next()
    while (!match.done && searchResults.length < SEARCH_RESULT_LIMIT) {
      const {line, column, columnEnd} = match.value
      searchResults.push({
        start: {
          line,
          column,
        },
        end: {
          line,
          column: columnEnd,
        },
      })
      match = matchesInRawBlob.next()
    }
  }

  return searchResults
}
