import {referenceName, referencePath, referenceURL} from '../copilot-chat-helpers'
import type {CopilotChatReference, FileDiffReference, FileReference, SnippetReference} from '../copilot-chat-types'

jest.mock('@github-ui/feature-flags')

describe('#referenceName', () => {
  const baseFileDiff: FileDiffReference = {
    type: 'file-diff',
    id: 'some-id',
    url: 'fake-url',
    baseFile: {
      type: 'file',
      url: 'fake-url',
      path: '/some-file-name.ts',
      repoID: 1,
      repoOwner: 'my-owner',
      repoName: 'my-repo-name',
      ref: 'main',
      commitOID: '1234567',
    },
    headFile: {
      type: 'file',
      url: 'fake-url',
      path: '/some-file-name.ts',
      repoID: 1,
      repoOwner: 'my-owner',
      repoName: 'my-repo-name',
      ref: 'branch',
      commitOID: '2345678',
    },
    base: null,
    head: null,
  }
  const fileDiffStartOnly: FileDiffReference = {
    ...baseFileDiff,
    selectedRange: {
      start: 'L8',
    },
  }
  const fileDiffStartAndEndSame: FileDiffReference = {
    ...baseFileDiff,
    selectedRange: {
      start: 'L8',
      end: 'L8',
    },
  }
  const fileDiffStartAndEndDifferentLines: FileDiffReference = {
    ...baseFileDiff,
    selectedRange: {
      start: 'L1',
      end: 'L9',
    },
  }
  const fileDiffStartAndEndDifferentSides: FileDiffReference = {
    ...baseFileDiff,
    selectedRange: {
      start: 'L1',
      end: 'R1',
    },
  }
  it.each`
    description                                       | input                                | expected
    ${'File diff without selected ranges'}            | ${baseFileDiff}                      | ${'some-file-name.ts'}
    ${'File diff with start range only'}              | ${fileDiffStartOnly}                 | ${'some-file-name.ts L8'}
    ${'File diff with same start and end'}            | ${fileDiffStartAndEndSame}           | ${'some-file-name.ts L8'}
    ${'File diff with different start and end lines'} | ${fileDiffStartAndEndDifferentLines} | ${'some-file-name.ts L1-L9'}
    ${'File diff with different start and end sides'} | ${fileDiffStartAndEndDifferentSides} | ${'some-file-name.ts L1-R1'}
  `(
    'formats the name properly given a $description',
    ({input, expected}: {input: CopilotChatReference; expected: string}) => {
      expect(referenceName(input)).toEqual(expected)
    },
  )
})

describe('#referencePath', () => {
  test('returns the path of a file reference', () => {
    const ref: FileReference = {
      type: 'file',
      url: 'fake-url',
      path: 'some-file-name.ts',
      repoID: 1,
      repoOwner: 'my-owner',
      repoName: 'my-repo-name',
      ref: 'main',
      commitOID: '1234567',
    }
    const ref2: FileReference = {
      ...ref,
      path: 'foo/bar/baz.ts',
    }
    expect(referencePath(ref)).toEqual('/')
    expect(referencePath(ref2)).toEqual('foo/bar')
  })
})

describe('#referenceUrl', () => {
  const nonMarkdownSnippet: SnippetReference = {
    type: 'snippet',
    url: 'https://example.com/monalisa/smile/blob/master/README.md',
    path: 'README.md',
    repoID: 1,
    repoOwner: 'monalisa',
    repoName: 'smile',
    ref: '',
    commitOID: 'main',
    languageName: 'Ruby',
    range: {
      start: 1,
      end: 8,
    },
  }
  const markdownSnippet: SnippetReference = {
    ...nonMarkdownSnippet,
    languageName: 'Markdown',
  }

  test('returns the url of a non-markdown snippet', () => {
    const result = referenceURL(nonMarkdownSnippet)
    expect(result).toEqual(nonMarkdownSnippet.url)
    expect(result).not.toContain('plain=1')
  })

  test('adds a `plain` parameter to markdown snippets', () => {
    const result = referenceURL(markdownSnippet)
    expect(result).toContain('plain=1')
    expect(result).toContain(markdownSnippet.url)
  })
})
