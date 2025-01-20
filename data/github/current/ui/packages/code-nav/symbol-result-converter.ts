import type {Repository} from '@github-ui/current-repository'

import type {RefInfo} from '@github-ui/repos-types'
import type {BlackbirdSymbol, StylingDirectivesDocument} from '@github-ui/code-view-types'
import {CodeReference, CodeSymbol, SymbolSource} from './code-symbol'
import type {AlephSymbol, CodeNavBackendType} from './code-nav-types'

interface Options {
  stylingDirectives: StylingDirectivesDocument | undefined
  path: string
  repo: Repository
  refInfo: RefInfo
}

interface AlephSymbolOptions extends Options {
  backend: CodeNavBackendType
}

export function outlineSymbolToCodeSymbol(
  outlineSymbol: BlackbirdSymbol,
  snippet: string,
  {stylingDirectives, repo, refInfo, path}: Options,
): CodeSymbol {
  const {extent_utf16: extentUtf16, ident_utf16: identUtf16} = outlineSymbol

  const codeSymbol = new CodeSymbol({
    kind: outlineSymbol.kind,
    fullyQualifiedName: outlineSymbol.fully_qualified_name,
    name: outlineSymbol.name,
    extent: {
      start: {line: extentUtf16.start.line_number, column: extentUtf16.start.utf16_col},
      end: {line: extentUtf16.end.line_number, column: extentUtf16.end.utf16_col},
    },
    ident: {
      start: {line: identUtf16.start.line_number, column: identUtf16.start.utf16_col},
      end: {line: identUtf16.end.line_number, column: identUtf16.end.utf16_col},
    },
    source: SymbolSource.BLACKBIRD_ANALYSIS,
  })

  codeSymbol.setSnippet(undefined, stylingDirectives?.[identUtf16.start.line_number], snippet, undefined)
  codeSymbol.setFileInfo(repo, refInfo, path)

  return codeSymbol
}

export function alephSymbolToCodeSymbol(
  alephSymbol: AlephSymbol,
  {symbol, refInfo, repo, path, backend}: AlephSymbolOptions & {symbol: string},
): CodeSymbol {
  const symbolStartIdx = alephSymbol.ident?.start?.character
  const symbolEndIdx = alephSymbol.ident?.end?.character ?? alephSymbol.ident?.start?.character
  const ident = {
    start: {
      line: alephSymbol.ident.start.line,
      column: symbolStartIdx ? symbolStartIdx - alephSymbol.leadingWhitespace : 0,
    },
    end: {
      line: alephSymbol.ident?.end?.line ?? alephSymbol.ident.start.line,
      column: symbolEndIdx ? symbolEndIdx - alephSymbol.leadingWhitespace : 0,
    },
  }

  const extentStartIdx = alephSymbol.extent?.start?.character
  const extentEndIdx = alephSymbol.extent?.end?.character ?? alephSymbol.extent?.start?.character
  const extent = {
    start: {
      line: alephSymbol.extent.start.line,
      column: extentStartIdx ? extentStartIdx : 0,
    },
    end: {
      line: alephSymbol.extent.end?.line ?? alephSymbol.extent.start.line,
      column: extentEndIdx ? extentEndIdx : 0,
    },
  }

  const codeSymbol = new CodeSymbol({
    ident,
    extent,
    kind: alephSymbol.symbolKind,
    name: symbol,
    // I guess aleph doesn't support fully qualified names? Just use the name
    fullyQualifiedName: symbol,
    source: backend === 'search' ? SymbolSource.BLACKBIRD_SEARCH : SymbolSource.ALEPH_PRECISE,
  })

  if (alephSymbol.local) {
    codeSymbol.setFileInfo(repo, refInfo, path)
  } else if (alephSymbol.commitOid && alephSymbol.path) {
    let symbolRefInfo = refInfo

    if (alephSymbol.commitOid !== refInfo.currentOid) {
      symbolRefInfo = {
        name: '',
        listCacheKey: alephSymbol.commitOid,
        currentOid: alephSymbol.commitOid,
        canEdit: false,
      }
    }

    codeSymbol.setFileInfo(alephSymbol.repo ?? repo, symbolRefInfo, alephSymbol.path)
  }

  const whiteSpace = new Array(alephSymbol.leadingWhitespace).fill(' ').join('')
  const firstLineWithWhiteSpace = whiteSpace + (alephSymbol.firstLine || '')
  codeSymbol.setSnippet(alephSymbol.highlightedText, undefined, firstLineWithWhiteSpace, alephSymbol.leadingWhitespace)
  return codeSymbol
}

export function alephSymbolToCodeReference(
  alephSymbol: AlephSymbol,
  {refInfo, path, repo, backend}: AlephSymbolOptions,
): CodeReference {
  let symbolRefInfo = refInfo
  let symbolPath = path

  if (!alephSymbol.local && alephSymbol.commitOid && alephSymbol.path) {
    symbolRefInfo = refInfo
    symbolPath = alephSymbol.path

    if (alephSymbol.commitOid !== refInfo.currentOid) {
      symbolRefInfo = {
        name: '',
        listCacheKey: alephSymbol.commitOid,
        currentOid: alephSymbol.commitOid,

        // TODO: this is probably the wrong value sometimes... but we most
        // likely won't read this field
        canEdit: false,
      }
    }
  }

  const identStartSymbolIdx = alephSymbol.ident.start.character
  const identEndSymbolIdx = alephSymbol.ident.end?.character
  const codeReference = new CodeReference({
    repo,
    refInfo: symbolRefInfo,
    path: symbolPath,
    ident: {
      start: {
        line: alephSymbol.ident.start.line,
        column: identStartSymbolIdx ? identStartSymbolIdx - alephSymbol.leadingWhitespace : 0,
      },
      end: {
        line: alephSymbol.ident.end?.line || alephSymbol.ident.start.line,
        column: identEndSymbolIdx ? identEndSymbolIdx - alephSymbol.leadingWhitespace : 0,
      },
    },
    source: backend === 'search' ? SymbolSource.BLACKBIRD_SEARCH : SymbolSource.ALEPH_PRECISE,
  })

  const firstLineWithWhiteSpace =
    new Array(alephSymbol.leadingWhitespace).fill(' ').join('') + (alephSymbol.firstLine || '')
  codeReference.setSnippet(
    alephSymbol.highlightedText,
    undefined,
    firstLineWithWhiteSpace,
    alephSymbol.leadingWhitespace,
  )
  return codeReference
}
