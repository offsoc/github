import {createRepository} from '@github-ui/current-repository/test-helpers'

import type {BlackbirdSymbol} from '@github-ui/code-view-types'
import {
  CodeNavigationInfo,
  isAfterSymbol,
  parseAlephBackendType,
  searchInBlobContent,
  searchInBlobIncrementally,
} from '../code-navigation-info'
import {type CodeReference, type CodeSymbol, SymbolSource} from '../code-symbol'
import {symbolMatchable, textMatchable} from '../get-match'

const repo = createRepository({
  id: 0,
  name: 'github',
  ownerLogin: 'blackbird',
})

const refInfo = {
  name: 'main',
  listCacheKey: 'main',
  canEdit: true,
  currentOid: '1a2b3c4d',
}

const path = '/a/b/c/file.txt'

const language = 'python'

it('implements symbol kind preference heuristics', async () => {
  const info = new CodeNavigationInfo(
    repo,
    refInfo,
    path,
    true,
    ['hello', 'hello'],
    [
      {
        name: 'hello',
        kind: 'SYMBOL_KIND_FIELD_DEF',
        fully_qualified_name: 'hello',
        ident_utf16: {start: {line_number: 0, utf16_col: 0}, end: {line_number: 0, utf16_col: 5}},
        extent_utf16: {start: {line_number: 0, utf16_col: 0}, end: {line_number: 0, utf16_col: 5}},
      },
      {
        name: 'hello',
        kind: 'SYMBOL_KIND_FUNCTION_DEF',
        fully_qualified_name: 'hello',
        ident_utf16: {start: {line_number: 1, utf16_col: 0}, end: {line_number: 1, utf16_col: 5}},
        extent_utf16: {start: {line_number: 1, utf16_col: 0}, end: {line_number: 1, utf16_col: 5}},
      },
    ],
    undefined,
    language,
    false,
    jest.fn,
  )
  expect(info.getLocalDefinitions('hello')[0]!.kind.fullName).toBe('function')
})

it('can find text', async () => {
  const info = new CodeNavigationInfo(
    repo,
    refInfo,
    path,
    true,
    ['hello', 'world'],
    [],
    [[], []],
    language,
    false,
    jest.fn,
  )
  const results = info.getReferencesToSearch('hello')
  expect(results.length).toBe(1)
  expect(results[0]!.bodyText).toBe('hello')
  expect(results[0]!.stylingDirectives).toEqual([])
})

it('builds the tree correctly', async () => {
  const symbols = [
    {
      name: 'getInputName',
      kind: 'SYMBOL_KIND_FUNCTION_DEF',
      fully_qualified_name: 'getInputName',
      ident_utf16: {start: {line_number: 3, utf16_col: 9}, end: {line_number: 3, utf16_col: 21}},
      extent_utf16: {start: {line_number: 3, utf16_col: 0}, end: {line_number: 5, utf16_col: 1}},
    },
    {
      name: 'setInput',
      kind: 'SYMBOL_KIND_FUNCTION_DEF',
      fully_qualified_name: 'setInput',
      ident_utf16: {start: {line_number: 6, utf16_col: 17}, end: {line_number: 6, utf16_col: 25}},
      extent_utf16: {start: {line_number: 6, utf16_col: 8}, end: {line_number: 9, utf16_col: 0}},
    },
    {
      name: 'CacheInput',
      kind: 'SYMBOL_KIND_INTERFACE_DEF',
      fully_qualified_name: 'CacheInput',
      ident_utf16: {start: {line_number: 9, utf16_col: 12}, end: {line_number: 9, utf16_col: 22}},
      extent_utf16: {start: {line_number: 9, utf16_col: 2}, end: {line_number: 14, utf16_col: 1}},
    },
    {
      name: 'setInputs',
      kind: 'SYMBOL_KIND_FUNCTION_DEF',
      fully_qualified_name: 'setInputs',
      ident_utf16: {start: {line_number: 14, utf16_col: 19}, end: {line_number: 14, utf16_col: 28}},
      extent_utf16: {start: {line_number: 14, utf16_col: 10}, end: {line_number: 21, utf16_col: 3}},
    },
    {
      name: 'clearInputs',
      kind: 'SYMBOL_KIND_FUNCTION_DEF',
      fully_qualified_name: 'clearInputs',
      ident_utf16: {start: {line_number: 21, utf16_col: 21}, end: {line_number: 21, utf16_col: 32}},
      extent_utf16: {start: {line_number: 21, utf16_col: 12}, end: {line_number: 26, utf16_col: 1}},
    },
  ] as BlackbirdSymbol[]

  const rawLines = `
import { Inputs } from "../constants";
// See: https://github.com/actions/toolkit/blob/master/packages/core/src/core.ts#L67
function getInputName(name: string): string {
    return -INPUT_-{name.replace(/ /g, "_").toUpperCase()}-;
}
export function setInput(name: string, value: string): void {
    process.env[getInputName(name)] = value;
}
interface CacheInput {
    path: string;
    key: string;
    restoreKeys?: string[];
}
export function setInputs(input: CacheInput): void {
    setInput(Inputs.Path, input.path);
    setInput(Inputs.Key, input.key);
    input.restoreKeys &&
        setInput(Inputs.RestoreKeys, input.restoreKeys.join("\n"));
}
export function clearInputs(): void {
    delete process.env[getInputName(Inputs.Path)];
    delete process.env[getInputName(Inputs.Key)];
    delete process.env[getInputName(Inputs.RestoreKeys)];
    delete process.env[getInputName(Inputs.UploadChunkSize)];
}
`.split('\n')

  const directives = new Array(rawLines.length).fill([])

  const info = new CodeNavigationInfo(
    repo,
    refInfo,
    path,
    true,
    rawLines,
    symbols,
    directives,
    language,
    false,
    jest.fn,
  )
  expect(info.symbolTree.length).toBe(5)
  expect(info.symbolTree[0]).toEqual({
    children: [],
    isParent: false,
    symbol: {
      bodyText: 'function getInputName(name: string): string {',
      depth: 0,
      extent: {end: {column: 1, line: 5}, start: {column: 0, line: 3}},
      ident: {end: {column: 21, line: 3}, start: {column: 9, line: 3}},
      fullyQualifiedName: 'getInputName',
      stylingDirectives: [],
      kind: {
        enumStringVal: 'SYMBOL_KIND_FUNCTION_DEF',
        fullName: 'function',
        shortName: 'func',
        plColor: 'prettylights.syntax.entity',
        rank: 6,
      },
      name: 'getInputName',
      path: '/a/b/c/file.txt',
      refInfo: {canEdit: true, currentOid: '1a2b3c4d', listCacheKey: 'main', name: 'main'},
      repo,
      source: SymbolSource.BLACKBIRD_ANALYSIS,
    },
  })
  expect(info.symbolTree[1]).toEqual({
    children: [],
    isParent: false,
    symbol: {
      bodyText: 'export function setInput(name: string, value: string): void {',
      depth: 0,
      ident: {start: {line: 6, column: 17}, end: {line: 6, column: 25}},
      extent: {start: {line: 6, column: 8}, end: {line: 9, column: 0}},
      fullyQualifiedName: 'setInput',
      stylingDirectives: [],
      kind: {
        enumStringVal: 'SYMBOL_KIND_FUNCTION_DEF',
        fullName: 'function',
        shortName: 'func',
        plColor: 'prettylights.syntax.entity',
        rank: 6,
      },
      name: 'setInput',
      path: '/a/b/c/file.txt',
      refInfo: {canEdit: true, currentOid: '1a2b3c4d', listCacheKey: 'main', name: 'main'},
      repo,
      source: SymbolSource.BLACKBIRD_ANALYSIS,
    },
  })
  expect(info.symbolTree[2]).toEqual({
    children: [],
    isParent: false,
    symbol: {
      bodyText: 'interface CacheInput {',
      depth: 0,
      ident: {start: {line: 9, column: 12}, end: {line: 9, column: 22}},
      extent: {start: {line: 9, column: 2}, end: {line: 14, column: 1}},
      fullyQualifiedName: 'CacheInput',
      stylingDirectives: [],
      kind: {
        enumStringVal: 'SYMBOL_KIND_INTERFACE_DEF',
        fullName: 'interface',
        shortName: 'intf',
        plColor: 'prettylights.syntax.keyword',
        rank: 3,
      },
      name: 'CacheInput',
      path: '/a/b/c/file.txt',
      refInfo: {canEdit: true, currentOid: '1a2b3c4d', listCacheKey: 'main', name: 'main'},
      repo,
      source: SymbolSource.BLACKBIRD_ANALYSIS,
    },
  })
  expect(info.symbolTree[3]).toEqual({
    children: [],
    isParent: false,
    symbol: {
      bodyText: 'export function setInputs(input: CacheInput): void {',
      depth: 0,
      ident: {start: {line: 14, column: 19}, end: {line: 14, column: 28}},
      extent: {start: {line: 14, column: 10}, end: {line: 21, column: 3}},
      fullyQualifiedName: 'setInputs',
      stylingDirectives: [],
      kind: {
        enumStringVal: 'SYMBOL_KIND_FUNCTION_DEF',
        fullName: 'function',
        shortName: 'func',
        plColor: 'prettylights.syntax.entity',
        rank: 6,
      },
      name: 'setInputs',
      path: '/a/b/c/file.txt',
      refInfo: {canEdit: true, currentOid: '1a2b3c4d', listCacheKey: 'main', name: 'main'},
      repo,
      source: SymbolSource.BLACKBIRD_ANALYSIS,
    },
  })
  expect(info.symbolTree[4]).toEqual({
    children: [],
    isParent: false,
    symbol: {
      bodyText: 'export function clearInputs(): void {',
      depth: 0,
      ident: {start: {line: 21, column: 21}, end: {line: 21, column: 32}},
      extent: {start: {line: 21, column: 12}, end: {line: 26, column: 1}},

      fullyQualifiedName: 'clearInputs',
      stylingDirectives: [],
      kind: {
        enumStringVal: 'SYMBOL_KIND_FUNCTION_DEF',
        fullName: 'function',
        shortName: 'func',
        plColor: 'prettylights.syntax.entity',
        rank: 6,
      },
      name: 'clearInputs',
      path: '/a/b/c/file.txt',
      refInfo: {canEdit: true, currentOid: '1a2b3c4d', listCacheKey: 'main', name: 'main'},
      repo,
      source: SymbolSource.BLACKBIRD_ANALYSIS,
    },
  })
})

describe('searchInBlobContent', () => {
  describe('symbol search', () => {
    it('can find text from regex from multiple lines', () => {
      const info = new CodeNavigationInfo(
        repo,
        refInfo,
        path,
        true,
        ['hello', 'world', 'hello!'],
        [],
        undefined,
        language,
        false,
        jest.fn,
      )

      const results = searchInBlobContent(info.blobLines, symbolMatchable('hello'))
      expect(results).toHaveLength(2)
      expect(results[0]!).toEqual({start: {line: 0, column: 0}, end: {line: 0, column: 5}})
      expect(results[1]).toEqual({start: {line: 2, column: 0}, end: {line: 2, column: 5}})
    })

    it('returns correct column when searching for a symbol', () => {
      const line = '    def send_file_max_age_default(self) -> t.Optional[timedelta]:'
      const info = new CodeNavigationInfo(repo, refInfo, path, true, [line], [], undefined, language, false, jest.fn)
      const results = searchInBlobContent(info.blobLines, symbolMatchable('Optional'))
      expect(results).toHaveLength(1)
      expect(line.substring(results[0]!.start.column, results[0]!.end.column)).toEqual('Optional')
    })

    it('returns correct column when searching for a symbol when symbol is the line beginning', () => {
      const line = 'Optional[timedelta]:'
      const info = new CodeNavigationInfo(repo, refInfo, path, true, [line], [], undefined, language, false, jest.fn)
      const results = searchInBlobContent(info.blobLines, symbolMatchable('Optional'))
      expect(results).toHaveLength(1)
      expect(line.substring(results[0]!.start.column, results[0]!.end.column)).toEqual('Optional')
      expect(results[0]!.start.line).toEqual(0)
      expect(results[0]!.end.line).toEqual(0)
    })

    it('returns correct column when there is whitespace indentation', () => {
      const line = '     Optional[timedelta]:'
      const results = searchInBlobContent([line], symbolMatchable('Optional'))
      expect(results).toHaveLength(1)
      expect(line.substring(results[0]!.start.column, results[0]!.end.column)).toEqual('Optional')
    })

    it('returns correct column when there is tab indentation', () => {
      const line = '\tOptional[timedelta]:'
      const info = new CodeNavigationInfo(repo, refInfo, path, true, [line], [], undefined, language, false, jest.fn)
      const results = searchInBlobContent(info.blobLines, symbolMatchable('Optional'))
      expect(results).toHaveLength(1)
      expect(line.substring(results[0]!.start.column, results[0]!.end.column)).toEqual('Optional')
    })
  })

  describe('plain text search', () => {
    it('can find text from regex from multiple lines find in file search', () => {
      const info = new CodeNavigationInfo(
        repo,
        refInfo,
        path,
        true,
        ['hello', 'world', 'hello!'],
        [],
        undefined,
        language,
        false,
        jest.fn,
      )
      const results = searchInBlobContent(info.blobLines, textMatchable('hello'))
      expect(results).toHaveLength(2)
      expect(results[0]!).toEqual({start: {line: 0, column: 0}, end: {line: 0, column: 5}})
      expect(results[1]).toEqual({start: {line: 2, column: 0}, end: {line: 2, column: 5}})
    })

    it('can find multiple matches in one line while in file search mode', () => {
      const line = 'hello world hello!'
      const info = new CodeNavigationInfo(repo, refInfo, path, true, [line], [], undefined, language, false, jest.fn)
      const results = searchInBlobContent(info.blobLines, textMatchable('hello'))
      expect(results).toHaveLength(2)
      expect(line.substring(results[0]!.start.column, results[0]!.end.column)).toEqual('hello')
      expect(results[0]!).toEqual({start: {line: 0, column: 0}, end: {line: 0, column: 5}})
      expect(results[1]).toEqual({start: {line: 0, column: 12}, end: {line: 0, column: 17}})
    })

    it('does not match regex', () => {
      const info = new CodeNavigationInfo(
        repo,
        refInfo,
        path,
        true,
        ['hello', 'world', 'hello!'],
        [],
        undefined,
        language,
        false,
        jest.fn,
      )
      const results = searchInBlobContent(info.blobLines, textMatchable('test'))
      expect(results).toHaveLength(0)
    })
  })
})

describe('searchInBlobIncrementally', () => {
  it('returns correct results', () => {
    const text = 'hello world hello!'
    const codeRef1 = {
      ident: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 5,
        },
      },
      bodyText: 'hello world hello!',
    } as CodeReference

    const codeRef2 = {
      ident: {
        start: {
          line: 0,
          column: 12,
        },
        end: {
          line: 0,
          column: 15,
        },
      },
      bodyText: 'hello world hello!',
    } as CodeReference
    const results = searchInBlobIncrementally([codeRef1, codeRef2], text.split('\n'), textMatchable('hello'))
    expect(results).toEqual([
      {start: {line: 0, column: 0}, end: {line: 0, column: 5}},
      {start: {line: 0, column: 12}, end: {line: 0, column: 17}},
    ])
  })

  it('returns correct results when there is a whitespace in the beginning', () => {
    const text = '   hello world hello!'
    const codeRef1 = {
      ident: {
        start: {
          line: 0,
          column: 3,
        },
        end: {
          line: 0,
          column: 8,
        },
      },
      bodyText: text,
    } as CodeReference

    const codeRef2 = {
      ident: {
        start: {
          line: 0,
          column: 8,
        },
        end: {
          line: 0,
          column: 12,
        },
      },
      bodyText: text,
    } as CodeReference
    const results = searchInBlobIncrementally([codeRef1, codeRef2], text.split('\n'), textMatchable('hello'))
    expect(results).toEqual([
      {start: {line: 0, column: 3}, end: {line: 0, column: 8}},
      {start: {line: 0, column: 15}, end: {line: 0, column: 20}},
    ])
  })

  it('does not return new results from blob if output from known references did not reach limit', () => {
    const text = 'foo foo\nfooBar'
    const codeRef1 = {
      ident: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 5,
        },
      },
      bodyText: 'foo foo',
    } as CodeReference

    const codeRef2 = {
      ident: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 5,
        },
      },
      bodyText: 'foo foo',
    } as CodeReference

    const results = searchInBlobIncrementally([codeRef1, codeRef2], text.split('\n'), textMatchable('foo'))
    expect(results).toEqual([
      {start: {line: 0, column: 0}, end: {line: 0, column: 3}}, // Existing reference
      {start: {line: 0, column: 4}, end: {line: 0, column: 7}}, // Existing reference
    ])
  })

  it('shortcut if results array is empty', () => {
    const text = 'foo\nfooBar'
    const results = searchInBlobIncrementally([], text.split('\n'), textMatchable('foo'))
    expect(results).toEqual([])
  })

  it("discard previous results when after narrowing they don't match", () => {
    const text = 'hello world hello!\nhellos'
    const codeRef1 = {
      ident: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 5,
        },
      },
      bodyText: 'hello world hello!',
      lineNumber: 1,
    } as CodeReference

    const codeRef2 = {
      ident: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 5,
        },
      },
      bodyText: 'hello world hello!',
      lineNumber: 1,
    } as CodeReference

    const codeRef3 = {
      ident: {
        start: {
          line: 1,
          column: 0,
        },
        end: {
          line: 1,
          column: 5,
        },
      },
      bodyText: 'hellos',
      lineNumber: 2,
    } as CodeReference
    const results = searchInBlobIncrementally([codeRef1, codeRef2, codeRef3], text.split('\n'), textMatchable('hellos'))
    expect(results).toEqual([{start: {line: 1, column: 0}, end: {line: 1, column: 6}}])
  })
})

describe('isAfterSymbol', () => {
  const createSymbol = (range: CodeSymbol['extent']) =>
    ({
      extent: range,
    }) as CodeSymbol

  const scenarios: Array<[CodeSymbol, CodeSymbol, boolean]> = [
    [
      createSymbol({start: {column: 0, line: 0}, end: {column: 1, line: 0}}),
      createSymbol({start: {column: 0, line: 0}, end: {column: 1, line: 0}}),
      false,
    ],
    [
      createSymbol({start: {column: 2, line: 0}, end: {column: 3, line: 0}}),
      createSymbol({start: {column: 0, line: 0}, end: {column: 1, line: 0}}),
      true,
    ],
    [
      createSymbol({start: {column: 0, line: 1}, end: {column: 1, line: 1}}),
      createSymbol({start: {column: 0, line: 0}, end: {column: 1, line: 0}}),
      true,
    ],
    [
      createSymbol({start: {column: 0, line: 0}, end: {column: 1, line: 0}}),
      createSymbol({start: {column: 0, line: 1}, end: {column: 1, line: 1}}),
      false,
    ],
  ]
  it.each(scenarios)('compares correctly', (symbolA, symbolB, expected) => {
    expect(isAfterSymbol(symbolA, symbolB)).toEqual(expected)
  })
})

describe('parseAlephBackendType', () => {
  const precises = ['ALEPH_PRECISE', 'ALEPH_PRECISE_PREVIEW', 'ALEPH_PRECISE_DEVELOPMENT']
  const searches = ['BLACKBIRD']
  it.each(precises)('parse precise type', name => {
    expect(parseAlephBackendType(name)).toEqual('precise')
  })
  it.each(searches)('parse search type', name => {
    expect(parseAlephBackendType(name)).toEqual('search')
  })
  it('reject garbage', () => {
    expect(parseAlephBackendType('0000')).toBeNull()
  })
})
