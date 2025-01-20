import {createRepository} from '@github-ui/current-repository/test-helpers'
import type {SafeHTMLString} from '@github-ui/safe-html'

import type {BlackbirdSymbol} from '@github-ui/code-view-types'
import {
  alephSymbolToCodeReference,
  alephSymbolToCodeSymbol,
  outlineSymbolToCodeSymbol,
} from '../symbol-result-converter'

const repo = createRepository({id: 0, name: 'github', ownerLogin: 'blackbird', currentUserCanPush: false})

const anotherRepo = createRepository({id: 1, name: 'msft', ownerLogin: 'msft', currentUserCanPush: false})

const path = 'a/path'

const refInfo = {
  name: 'main',
  listCacheKey: 'main',
  canEdit: true,
  currentOid: '1a2b3c4d',
}

const blob = 'def test() {\nconsole.log()\n}'
const blobLines = blob.split('\n') as SafeHTMLString[]
const stylingDirectives = [[], [], []]

describe('outlineSymbolToCodeSymbol', () => {
  it('correctly converts to code symbol', () => {
    const symbol = {
      name: 'getInputName',
      kind: 'SYMBOL_KIND_FUNCTION_DEF',
      fully_qualified_name: 'test.getInputName',
      ident_utf16: {
        start: {line_number: 0, utf16_col: 4},
        end: {line_number: 0, utf16_col: 8},
      },
      extent_utf16: {
        start: {line_number: 0, utf16_col: 0},
        end: {line_number: 0, utf16_col: 12},
      },
    } as BlackbirdSymbol

    const result = outlineSymbolToCodeSymbol(symbol, 'def test() {', {
      repo,
      refInfo,
      path,
      stylingDirectives,
    })

    expect(result).toMatchObject({
      bodyText: 'def test() {',
      ident: {end: {column: 8, line: 0}, start: {column: 4, line: 0}},
      extent: {end: {column: 12, line: 0}, start: {column: 0, line: 0}},
      fullyQualifiedName: 'test.getInputName',
      stylingDirectives: [],
      kind: {
        fullName: 'function',
        shortName: 'func',
        plColor: 'prettylights.syntax.entity',
      },
      lineNumber: 1,
      name: 'getInputName',
    })
  })
})

describe('alephSymbolToCodeSymbol', () => {
  const symbol = {
    firstLine: 'def test() {',
    ident: {end: {character: 12, line: 0}, start: {character: 0, line: 0}},
    extent: {end: {character: 12, line: 0}, start: {character: 0, line: 0}},
    local: true,
    path,
    highlightedText: blobLines[0]!,
    leadingWhitespace: 0,
    kind: 'function',
    symbolKind: 'SYMBOL_KIND_FUNCTION_DEF',
  }

  const match = 'test'

  const context = {
    repo,
    refInfo,
    path,
    stylingDirectives,
    symbol: match,
    backend: 'search',
  } as const

  it('works for same file symbol', () => {
    const result = alephSymbolToCodeSymbol(symbol, context)

    expect(result).toMatchObject({
      bodyText: 'def test() {',
      ident: {end: {column: 12, line: 0}, start: {column: 0, line: 0}},
      extent: {end: {column: 12, line: 0}, start: {column: 0, line: 0}},
      fullyQualifiedName: 'test',
      highlightedText: 'def test() {',
      kind: {
        fullName: 'function',
        shortName: 'func',
        plColor: 'prettylights.syntax.entity',
      },
      lineNumber: 1,
      name: 'test',
    })
  })

  it('uses first line if symbol is from a different file', () => {
    const result = alephSymbolToCodeSymbol(
      {
        ...symbol,
        local: false,
        path: 'another/path',
        commitOid: '123456',
        firstLine: 'line from another_path',
        highlightedText: 'line from another_path' as SafeHTMLString,
        repo: anotherRepo,
      },
      context,
    )

    expect(result).toMatchObject({
      bodyText: 'line from another_path',
      fullyQualifiedName: 'test',
      highlightedText: 'line from another_path',
      kind: {
        fullName: 'function',
        shortName: 'func',
        plColor: 'prettylights.syntax.entity',
      },
      name: 'test',
      path: 'another/path',
      repo: anotherRepo,
    })
  })
})

describe('alephSymbolToCodeReference', () => {
  const symbol = {
    firstLine: 'def test() {',
    ident: {end: {character: 12, line: 0}, start: {character: 0, line: 0}},
    extent: {end: {character: 12, line: 0}, start: {character: 0, line: 0}},
    local: true,
    path,
    highlightedText: blobLines[0]!,
    leadingWhitespace: 0,
    kind: 'function',
    symbolKind: 'SYMBOL_KIND_FUNCTION_DEF',
  }

  const match = 'test'

  const context = {
    repo,
    refInfo,
    path,
    stylingDirectives,
    symbol: match,
    backend: 'search',
  } as const

  it('works for a symbol in the same file', () => {
    const result = alephSymbolToCodeReference(symbol, context)

    expect(result).toMatchObject({
      bodyText: 'def test() {',
      highlightedText: 'def test() {',
      isPlain: false,
      path: 'a/path',
      refInfo: {currentOid: '1a2b3c4d'},
      repo: {
        name: 'github',
      },
    })
  })

  it('redirects to the default branch only for results from blackbird', () => {
    const refOnNonDefaultBranch = {
      ...refInfo,
      name: 'another-branch',
    }

    const preciseResult = alephSymbolToCodeReference(symbol, {
      ...context,
      refInfo: refOnNonDefaultBranch,
      backend: 'precise',
    })
    const blackbirdResult = alephSymbolToCodeReference(symbol, {
      ...context,
      refInfo: refOnNonDefaultBranch,
      backend: 'search',
    })

    expect(preciseResult.href(false)).not.toContain('/main/')
    expect(preciseResult.href(false)).toContain('/another-branch/')
    expect(blackbirdResult.href(false)).not.toContain('/another-branch/')
    expect(blackbirdResult.href(false)).toContain('/main/')
  })

  it('uses first line if symbol is from a different file', () => {
    const result = alephSymbolToCodeReference(
      {
        ...symbol,
        local: false,
        path: 'another/path',
        firstLine: 'line from another_path',
        commitOid: '123456',
        highlightedText: 'line from another_path' as SafeHTMLString,
      },

      context,
    )

    expect(result).toMatchObject({
      path: 'another/path',
      refInfo: {canEdit: false, currentOid: '123456', listCacheKey: '123456', name: ''},
      repo,
    })
  })
})
