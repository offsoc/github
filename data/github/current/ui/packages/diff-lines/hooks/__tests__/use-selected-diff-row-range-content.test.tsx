import {MemoryRouter} from 'react-router-dom'
import {renderHook} from '@testing-library/react'
import type {DiffLine} from '../../types'

import {useSelectedDiffRowRangeContent} from '../use-selected-diff-row-range-content'
import {useSelectedDiffRowRangeContext} from '../../contexts/SelectedDiffRowRangeContext'
import {groupDiffLines} from '../../helpers/line-helpers'

jest.mock('../../contexts/SelectedDiffRowRangeContext')
const mockedSelectedDiffRowRangeContext = jest.mocked(useSelectedDiffRowRangeContext)

const mockedDiffAnchor = 'diff-mockedFileAnchor'

const selectedDiffRowRangeContextReturnDataMock = {
  selectedDiffLines: {leftLines: [], rightLines: []},
  selectedDiffRowRange: undefined,
  updateSelectedDiffRowRange: jest.fn(),
  clearSelectedDiffRowRange: jest.fn(),
  replaceSelectedDiffRowRange: jest.fn(),
  replaceSelectedDiffRowRangeFromGridCells: jest.fn(),
  updateDiffLines: jest.fn(),
  getDiffLinesFromLineRange: jest.fn(),
  getDiffLinesByDiffAnchor: jest.fn(),
}

const testDiffLines: DiffLine[] = [
  {
    left: 0,
    right: 0,
    blobLineNumber: 0,
    html: '@@ -1,5 +1,5 @@',
    type: 'HUNK',
    text: '@@ -1,5 +1,5 @@',
  },
  {
    left: 1,
    right: 1,
    blobLineNumber: 1,
    html: ' <span class=pl-k>import</span> <span class=pl-kos>{</span><span class=pl-s1>copyText</span><span class=pl-kos>}</span> <span class=pl-k>from</span> <span class=pl-s>&#39;@github-ui/copy-to-clipboard&#39;</span>',
    type: 'CONTEXT',
    text: " import {copyText} from '@github-ui/copy-to-clipboard'",
  },
  {
    left: 2,
    right: 1,
    blobLineNumber: 2,
    html: '-<span class="pl-k">import</span> <span class="pl-s1 x x-first">type</span><span class="x x-last"> </span><span class="pl-kos">{</span><span class="pl-v">SimpleDiffLine</span><span class="pl-kos">}</span> <span class="pl-k">from</span> <span class="pl-s">\'@github-ui/diffs/types\'</span>',
    type: 'DELETION',
    text: "-import type {SimpleDiffLine} from '@github-ui/diffs/types'",
  },
  {
    left: 2,
    right: 2,
    blobLineNumber: 2,
    html: '+<span class="pl-k">import</span> <span class="pl-kos">{</span><span class="pl-v">SimpleDiffLine</span><span class="pl-kos">}</span> <span class="pl-k">from</span> <span class="pl-s">\'@github-ui/diffs/types\'</span>',
    type: 'ADDITION',
    text: "+import {SimpleDiffLine} from '@github-ui/diffs/types'",
  },
  {
    left: 3,
    right: 3,
    blobLineNumber: 3,
    html: ' <span class=pl-k>import</span> <span class=pl-kos>{</span>',
    type: 'CONTEXT',
    text: ' import {',
  },
  {
    left: 4,
    right: 4,
    blobLineNumber: 4,
    html: '   <span class=pl-v>CommentDiscussionIcon</span><span class=pl-kos>,</span>',
    type: 'CONTEXT',
    text: '   CommentDiscussionIcon,',
  },
  {
    left: 5,
    right: 5,
    blobLineNumber: 5,
    html: '   <span class=pl-v>CopyIcon</span><span class=pl-kos>,</span>',
    type: 'INJECTED_CONTEXT',
    text: '   CopyIcon,',
  },
  {
    left: 6,
    right: 6,
    blobLineNumber: 6,
    html: '   <span class=pl-v>CloseIcon</span><span class=pl-kos>,</span>',
    type: 'INJECTED_CONTEXT',
    text: '   CloseIcon,',
  },
]

const wrapper = ({children}: {children: React.ReactNode}) => <MemoryRouter>{children}</MemoryRouter>

describe('getting unified diffline content', () => {
  test('returns all line types in range', () => {
    mockedSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffRowRange: {
        firstSelectedOrientation: 'right',
        diffAnchor: mockedDiffAnchor,
        endLineNumber: 6,
        endOrientation: 'right',
        startLineNumber: 0,
        firstSelectedLineNumber: 0,
        startOrientation: 'right',
      },
      getDiffLinesByDiffAnchor: () => testDiffLines,
    })

    const {
      result: {
        current: {getUnifiedDiffLineCode},
      },
    } = renderHook(() => useSelectedDiffRowRangeContent(mockedDiffAnchor), {wrapper})

    expect(getUnifiedDiffLineCode()).toEqual(
      `@@ -1,5 +1,5 @@\nimport {copyText} from '@github-ui/copy-to-clipboard'\nimport type {SimpleDiffLine} from '@github-ui/diffs/types'\nimport {SimpleDiffLine} from '@github-ui/diffs/types'\nimport {\nCommentDiscussionIcon,\nCopyIcon,\nCloseIcon,`,
    )
  })
})

describe('getting multi-line left side diffline content', () => {
  test('returns all left side difflines in range', () => {
    const {leftLines, rightLines} = groupDiffLines(testDiffLines)
    mockedSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines, rightLines},
      getDiffLinesByDiffAnchor: () => testDiffLines,
    })

    const {
      result: {
        current: {getSplitDiffMultiLineCode},
      },
    } = renderHook(() => useSelectedDiffRowRangeContent(mockedDiffAnchor), {wrapper})

    expect(getSplitDiffMultiLineCode('left')).toEqual(
      `@@ -1,5 +1,5 @@\nimport {copyText} from '@github-ui/copy-to-clipboard'\nimport type {SimpleDiffLine} from '@github-ui/diffs/types'\nimport {\nCommentDiscussionIcon,\nCopyIcon,\nCloseIcon,`,
    )
  })
})

describe('getting multi-line right side diffline content', () => {
  test('returns all right side difflines in range', () => {
    const {leftLines, rightLines} = groupDiffLines(testDiffLines)
    mockedSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      selectedDiffLines: {leftLines, rightLines},
      getDiffLinesByDiffAnchor: () => testDiffLines,
    })

    const {
      result: {
        current: {getSplitDiffMultiLineCode},
      },
    } = renderHook(() => useSelectedDiffRowRangeContent(mockedDiffAnchor), {wrapper})

    expect(getSplitDiffMultiLineCode('right')).toEqual(
      `@@ -1,5 +1,5 @@\nimport {copyText} from '@github-ui/copy-to-clipboard'\nimport {SimpleDiffLine} from '@github-ui/diffs/types'\nimport {\nCommentDiscussionIcon,\nCopyIcon,\nCloseIcon,`,
    )
  })
})

describe('getting single-line left side diffline content', () => {
  test('returns left side code', () => {
    mockedSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      getDiffLinesByDiffAnchor: () => testDiffLines,
    })

    const {
      result: {
        current: {getSplitDiffSingleLineCode},
      },
    } = renderHook(() => useSelectedDiffRowRangeContent(mockedDiffAnchor), {wrapper})

    expect(getSplitDiffSingleLineCode('left', 2)).toEqual(`import type {SimpleDiffLine} from '@github-ui/diffs/types'`)
  })
})

describe('getting single-line right side diffline content', () => {
  test('returns right side code', () => {
    mockedSelectedDiffRowRangeContext.mockReturnValue({
      ...selectedDiffRowRangeContextReturnDataMock,
      getDiffLinesByDiffAnchor: () => testDiffLines,
    })

    const {
      result: {
        current: {getSplitDiffSingleLineCode},
      },
    } = renderHook(() => useSelectedDiffRowRangeContent(mockedDiffAnchor), {wrapper})

    expect(getSplitDiffSingleLineCode('right', 2)).toEqual(`import {SimpleDiffLine} from '@github-ui/diffs/types'`)
  })
})
