import {renderHook} from '@testing-library/react'
import {configureSuggestedChangesFromThreadWithDiffLines, useSuggestedChanges} from '../use-suggested-changes'
import {buildDiffLine, buildThread} from '../../test-utils/query-data'
import {MemoryRouter} from 'react-router-dom'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {useDiffLineContext} from '../../contexts/DiffLineContext'
import type {DiffAnchor} from '@github-ui/diffs/types'
import {useSelectedDiffRowRangeContext} from '../../contexts/SelectedDiffRowRangeContext'
import {buildPullRequestDiffThread, buildReviewThread, buildStaticDiffLine} from '@github-ui/conversations/test-utils'

jest.mock('../../contexts/DiffLineContext')
const mockedDiffLineContext = jest.mocked(useDiffLineContext)
jest.mock('../../contexts/SelectedDiffRowRangeContext')
const mockedSelectedDiffRowRangeContext = jest.mocked(useSelectedDiffRowRangeContext)

const mockedDiffAnchor = 'diff-mockedFileAnchor'

const getDiffLinesFromRangeMock = jest.fn()

const defaultSelectedDiffRowRangeContextMockdata = {
  selectedDiffRowRange: undefined,
  updateSelectedDiffRowRange: jest.fn(),
  clearSelectedDiffRowRange: jest.fn(),
  replaceSelectedDiffRowRange: jest.fn(),
  replaceSelectedDiffRowRangeFromGridCells: jest.fn(),
  selectedDiffRowContent: undefined,
  selectedDiffLines: {leftLines: [], rightLines: []},
  updateDiffLines: jest.fn(),
  getDiffLinesFromLineRange: getDiffLinesFromRangeMock,
  getDiffLinesByDiffAnchor: jest.fn(),
}

function wrapper({children}: {children: React.ReactNode}) {
  return (
    <MemoryRouter>
      <AnalyticsProvider appName="pull-requests" category="" metadata={{}}>
        {children}
      </AnalyticsProvider>
    </MemoryRouter>
  )
}

describe('configureSuggestedChangesFromThreadWithDiffLines', () => {
  test('never shows the suggest changes button, never inserts a suggested change automatically', () => {
    const diffLines = [
      buildStaticDiffLine({right: 1, html: '+my addition1', text: '+my addition1'}),
      buildStaticDiffLine({right: 2, html: '+my addition2', text: '+my addition2'}),
    ]
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines,
        startLine: 1,
        endLine: 2,
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange, showSuggestChangesButton, shouldInsertSuggestedChange} =
      configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(true)
    expect(showSuggestChangesButton).toBe(false)
    expect(shouldInsertSuggestedChange).toBe(false)
  })

  test('is valid suggestion range, returns correct suggestion lines, if it does not include deletions', () => {
    const diffLines = [
      buildStaticDiffLine({right: 1, html: '+my addition1', text: '+my addition1'}),
      buildStaticDiffLine({right: 2, html: '+my addition2', text: '+my addition2'}),
      buildStaticDiffLine({left: 3, right: 3, html: ' context line', text: ' context line'}),
    ]
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines,
        startLine: 1,
        endLine: 2,
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange, sourceContentFromDiffLines} =
      configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(true)
    expect(sourceContentFromDiffLines).toBe('my addition1\nmy addition2')
  })

  test('is not valid suggestion range if thread has no diffLines', () => {
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines: null,
        startLine: 1,
        endLine: 2,
        startDiffSide: 'LEFT',
        endDiffSide: 'RIGHT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange} = configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(false)
  })

  test('is not valid suggestion range if it does include deletions', () => {
    const diffLines = [
      buildStaticDiffLine({left: 1, html: '-my deletion1', text: '-my deletion', type: 'DELETION'}),
      buildStaticDiffLine({left: 2, html: '-my deletion2', text: '-my deletion2', type: 'DELETION'}),
      buildStaticDiffLine({right: 2, html: '', text: ''}),
    ]
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines,
        startLine: 1,
        endLine: 2,
        startDiffSide: 'LEFT',
        endDiffSide: 'RIGHT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange} = configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(false)
  })

  test('returns the correct suggested change line for a single addition line', () => {
    const diffLines = [buildStaticDiffLine({right: 1, html: '+my addition1', text: '+my addition1'})]
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines,
        startLine: 1,
        endLine: 1,
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange, sourceContentFromDiffLines} =
      configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(true)
    expect(sourceContentFromDiffLines).toBe('my addition1')
  })

  test('returns the correct suggested change line for a single context line', () => {
    const diffLines = [buildStaticDiffLine({right: 1, html: ' context line', text: ' context line', type: 'CONTEXT'})]
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines,
        startLine: 1,
        endLine: 1,
        startDiffSide: 'LEFT',
        endDiffSide: 'LEFT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange, sourceContentFromDiffLines} =
      configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(true)
    expect(sourceContentFromDiffLines).toBe('context line')
  })

  test('returns the correct suggested change lines for multiple context lines', () => {
    const diffLines = [
      buildStaticDiffLine({left: null, right: 1, html: '+my addition1', text: '+my addition1'}),
      buildStaticDiffLine({left: 2, right: 2, html: ' context line 1', text: ' context line 1', type: 'CONTEXT'}),
      buildStaticDiffLine({left: 3, right: 3, html: ' context line 2', text: ' context line 2', type: 'CONTEXT'}),
    ]
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines,
        startLine: 2,
        endLine: 3,
        startDiffSide: 'LEFT',
        endDiffSide: 'LEFT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange, sourceContentFromDiffLines} =
      configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(true)
    expect(sourceContentFromDiffLines).toBe('context line 1\ncontext line 2')
  })

  test('returns the correct suggested change lines for multiple lines if the range includes extra context lines', () => {
    const diffLines = [
      buildStaticDiffLine({left: null, right: 1, html: '+my addition1', text: '+my addition1'}),
      buildStaticDiffLine({left: 2, right: 2, html: ' context line 1', text: ' context line 1', type: 'CONTEXT'}),
      buildStaticDiffLine({left: 3, right: 3, html: ' context line 2', text: ' context line 2', type: 'CONTEXT'}),
      buildStaticDiffLine({left: 4, right: 4, html: ' context line 3', text: ' context line 3', type: 'CONTEXT'}),
      buildStaticDiffLine({left: 5, right: 5, html: ' context line 4', text: ' context line 4', type: 'CONTEXT'}),
    ]
    const thread = buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '12345',
        diffLines,
        startLine: 2,
        endLine: 3,
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
      }),
      subjectType: 'LINE',
    })
    const {isValidSuggestionRange, sourceContentFromDiffLines} =
      configureSuggestedChangesFromThreadWithDiffLines(thread)
    expect(isValidSuggestionRange).toBe(true)
    expect(sourceContentFromDiffLines).toBe('context line 1\ncontext line 2')
  })
})

describe('useSuggestedChanges', () => {
  describe('when suggested changes are not enabled, returns the correct configuration', () => {
    test('does not show suggested change button', () => {
      mockedSelectedDiffRowRangeContext.mockReturnValue(defaultSelectedDiffRowRangeContextMockdata)
      const suggestedChangesEnabled = false

      const selectedThreadId = 'myThreadId'
      const line = buildDiffLine({
        type: 'DELETION',
        left: 1,
        right: 1,
        threads: [buildThread({id: selectedThreadId, line: 1})],
      })
      mockedDiffLineContext.mockReturnValue({
        diffEntryId: 'mockedId',
        fileLineCount: 100,
        isSplit: false,
        rowId: 'mockedRowId',
        fileAnchor: mockedDiffAnchor as DiffAnchor,
        filePath: 'mockedFileAnchor',
        diffLine: line,
      })

      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

      const {configureSuggestedChangesFromLineRange, selectedDiffRowRange} = result.current
      expect(configureSuggestedChangesFromLineRange()).toBeUndefined()
      expect(selectedDiffRowRange).toBeUndefined()
    })
  })

  describe('auto inserting the suggested change line', () => {
    test('returns correct configuration object when suggested change line shoud auto insert into markdown editor', () => {
      mockedSelectedDiffRowRangeContext.mockReturnValue({
        ...defaultSelectedDiffRowRangeContextMockdata,
        selectedDiffRowRange: {
          diffAnchor: mockedDiffAnchor,
          startOrientation: 'right',
          startLineNumber: 23,
          endOrientation: 'right',
          endLineNumber: 23,
          firstSelectedLineNumber: 23,
          firstSelectedOrientation: 'right',
        },
      })
      const suggestedChangesEnabled = true

      const suggestion = 'my addition'
      const line = buildDiffLine({
        type: 'ADDITION',
        left: 21,
        right: 23,
        html: `+${suggestion}`,
        text: `+${suggestion}`,
      })
      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, true), {wrapper})

      const {
        configureSuggestedChangesFromLineRange,
        selectedDiffRowRange,
        shouldStartNewConversationWithSuggestedChange,
      } = result.current
      const config = configureSuggestedChangesFromLineRange(
        selectedDiffRowRange,
        shouldStartNewConversationWithSuggestedChange,
      )
      expect(config?.showSuggestChangesButton).toBe(true)
      expect(config?.sourceContentFromDiffLines).toBe(suggestion)
      expect(config?.shouldInsertSuggestedChange).toBe(true)
    })

    test('returns correct configuration object when suggested change line shoud not auto insert into markdown editor', () => {
      mockedSelectedDiffRowRangeContext.mockReturnValue({
        ...defaultSelectedDiffRowRangeContextMockdata,
        selectedDiffRowRange: {
          diffAnchor: mockedDiffAnchor,
          startOrientation: 'right',
          startLineNumber: 23,
          endOrientation: 'right',
          endLineNumber: 23,
          firstSelectedLineNumber: 23,
          firstSelectedOrientation: 'right',
        },
      })
      const suggestedChangesEnabled = true

      const suggestion = 'my addition'
      const line = buildDiffLine({
        type: 'ADDITION',
        left: 21,
        right: 23,
        html: `+${suggestion}`,
        text: `+${suggestion}`,
      })
      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

      const {
        configureSuggestedChangesFromLineRange,
        selectedDiffRowRange,
        shouldStartNewConversationWithSuggestedChange,
      } = result.current
      const config = configureSuggestedChangesFromLineRange(
        selectedDiffRowRange,
        shouldStartNewConversationWithSuggestedChange,
      )
      expect(config?.showSuggestChangesButton).toBe(true)
      expect(config?.sourceContentFromDiffLines).toBe(suggestion)
      expect(config?.shouldInsertSuggestedChange).toBe(false)
    })
  })

  describe('starting conversation on single line, with a row range', () => {
    // note: for single lines, there are no selected diff lines, but there is a selected diff row range if the user clicks on the cell
    test('shows suggested change button if line is an ADDITION', () => {
      mockedSelectedDiffRowRangeContext.mockReturnValue({
        ...defaultSelectedDiffRowRangeContextMockdata,
        selectedDiffRowRange: {
          diffAnchor: mockedDiffAnchor,
          startOrientation: 'right',
          startLineNumber: 23,
          endOrientation: 'right',
          endLineNumber: 23,
          firstSelectedLineNumber: 23,
          firstSelectedOrientation: 'right',
        },
      })
      const suggestedChangesEnabled = true

      const suggestion = 'my addition'
      const line = buildDiffLine({
        type: 'ADDITION',
        left: 21,
        right: 23,
        html: `+${suggestion}`,
        text: `+${suggestion}`,
      })
      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

      const {configureSuggestedChangesFromLineRange, selectedDiffRowRange} = result.current
      const config = configureSuggestedChangesFromLineRange(selectedDiffRowRange)
      expect(config?.showSuggestChangesButton).toBe(true)
      expect(config?.sourceContentFromDiffLines).toBe(suggestion)
      expect(config?.shouldInsertSuggestedChange).toBeUndefined()
    })

    describe('starting conversation on single line, without a row range', () => {
      // note: if the user triggers the context menu on a cell without first clicking on it, there is no diff row range
      test('shows suggested change button if line is an ADDITION', () => {
        mockedSelectedDiffRowRangeContext.mockReturnValue({
          ...defaultSelectedDiffRowRangeContextMockdata,
          selectedDiffRowRange: undefined,
        })
        const suggestedChangesEnabled = true

        const suggestion = 'my addition'
        const line = buildDiffLine({
          type: 'ADDITION',
          left: 21,
          right: 23,
          html: `+${suggestion}`,
          text: `+${suggestion}`,
        })
        const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

        const {configureSuggestedChangesFromLineRange, selectedDiffRowRange} = result.current
        const config = configureSuggestedChangesFromLineRange(selectedDiffRowRange)
        expect(config?.showSuggestChangesButton).toBe(true)
        expect(config?.sourceContentFromDiffLines).toBe(suggestion)
        expect(config?.shouldInsertSuggestedChange).toBeUndefined()
      })
    })

    test('shows suggested change button if line is a CONTEXT line', () => {
      mockedSelectedDiffRowRangeContext.mockReturnValue({
        ...defaultSelectedDiffRowRangeContextMockdata,
        selectedDiffRowRange: {
          diffAnchor: mockedDiffAnchor,
          startOrientation: 'right',
          startLineNumber: 23,
          endOrientation: 'right',
          endLineNumber: 23,
          firstSelectedLineNumber: 23,
          firstSelectedOrientation: 'right',
        },
      })
      const suggestedChangesEnabled = true

      const suggestion = 'my addition'
      const line = buildDiffLine({
        type: 'CONTEXT',
        left: 21,
        right: 23,
        html: `${suggestion}`,
        text: `${suggestion}`,
      })
      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

      const {configureSuggestedChangesFromLineRange, selectedDiffRowRange} = result.current
      const config = configureSuggestedChangesFromLineRange(selectedDiffRowRange)
      expect(config?.showSuggestChangesButton).toBe(true)
      expect(config?.sourceContentFromDiffLines).toBe(suggestion)
      expect(config?.shouldInsertSuggestedChange).toBeUndefined()
    })

    test('does not show suggested change button if line is a DELETION', () => {
      mockedSelectedDiffRowRangeContext.mockReturnValue({
        ...defaultSelectedDiffRowRangeContextMockdata,
        selectedDiffRowRange: {
          diffAnchor: mockedDiffAnchor,
          startOrientation: 'left',
          startLineNumber: 23,
          endOrientation: 'left',
          endLineNumber: 23,
          firstSelectedLineNumber: 23,
          firstSelectedOrientation: 'left',
        },
      })
      const suggestedChangesEnabled = true

      const line = buildDiffLine({
        type: 'DELETION',
        left: 21,
        right: 23,
        html: `-deletion`,
        text: `-deletion`,
      })
      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

      const {configureSuggestedChangesFromLineRange, selectedDiffRowRange} = result.current
      const config = configureSuggestedChangesFromLineRange(selectedDiffRowRange)
      expect(config?.showSuggestChangesButton).toBe(false)
      expect(config?.sourceContentFromDiffLines).toBeUndefined()
    })
  })

  describe('starting conversation on multiple lines', () => {
    test('shows suggested change button if line range does not contain a DELETION', () => {
      const suggestedChangesEnabled = true

      const leftLines = [buildDiffLine({type: 'CONTEXT', left: 21, right: 20, text: 'my context line'})]
      const rightLines = [
        buildDiffLine({
          left: 21,
          right: 21,
          type: 'ADDITION',
          html: '+my addition',
          text: '+my addition',
        }),
        buildDiffLine({
          left: 21,
          right: 22,
          type: 'ADDITION',
          html: '+my second line addition',
          text: '+my second line addition',
        }),
        buildDiffLine({
          left: 21,
          right: 23,
          type: 'ADDITION',
          html: '+my third line addition',
          text: '+my third line addition',
        }),
      ]

      mockedSelectedDiffRowRangeContext.mockReturnValue({
        ...defaultSelectedDiffRowRangeContextMockdata,
        selectedDiffRowRange: {
          diffAnchor: mockedDiffAnchor,
          startOrientation: 'left',
          startLineNumber: 21,
          endOrientation: 'right',
          endLineNumber: 23,
          firstSelectedLineNumber: 21,
          firstSelectedOrientation: 'left',
        },
        selectedDiffLines: {
          leftLines,
          rightLines,
        },
      })

      const line = buildDiffLine({
        type: 'ADDITION',
        left: 21,
        right: 23,
      })

      getDiffLinesFromRangeMock.mockReturnValue({selectedLeftLines: leftLines, selectedRightLines: rightLines})

      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

      const {configureSuggestedChangesFromLineRange, selectedDiffRowRange} = result.current
      const config = configureSuggestedChangesFromLineRange(selectedDiffRowRange)
      expect(config?.showSuggestChangesButton).toBe(true)
      expect(config?.sourceContentFromDiffLines).toBe('my addition\nmy second line addition\nmy third line addition')
      expect(config?.shouldInsertSuggestedChange).toBeUndefined()
    })

    test('does not show suggested change button if line range does contain a DELETION', () => {
      const suggestedChangesEnabled = true

      const leftLines = [buildDiffLine({type: 'DELETION', left: 21, right: 20, text: '-my deleted line'})]
      const rightLines = [
        buildDiffLine({
          left: 21,
          right: 21,
          type: 'ADDITION',
          html: '+my addition',
          text: '+my addition',
        }),
        buildDiffLine({
          left: 21,
          right: 22,
          type: 'ADDITION',
          html: '+my second line addition',
          text: '+my second line addition',
        }),
        buildDiffLine({
          left: 21,
          right: 23,
          type: 'ADDITION',
          html: '+my third line addition',
          text: '+my third line addition',
        }),
      ]

      mockedSelectedDiffRowRangeContext.mockReturnValue({
        ...defaultSelectedDiffRowRangeContextMockdata,
        selectedDiffRowRange: {
          diffAnchor: mockedDiffAnchor,
          startOrientation: 'left',
          startLineNumber: 21,
          endOrientation: 'right',
          endLineNumber: 23,
          firstSelectedLineNumber: 21,
          firstSelectedOrientation: 'left',
        },
        selectedDiffLines: {
          leftLines,
          rightLines,
        },
      })

      const line = buildDiffLine({
        type: 'ADDITION',
        left: 21,
        right: 23,
      })

      getDiffLinesFromRangeMock.mockReturnValue({selectedLeftLines: leftLines, selectedRightLines: rightLines})

      const {result} = renderHook(() => useSuggestedChanges(suggestedChangesEnabled, line, false), {wrapper})

      const {configureSuggestedChangesFromLineRange, selectedDiffRowRange} = result.current
      const config = configureSuggestedChangesFromLineRange(selectedDiffRowRange)
      expect(config?.showSuggestChangesButton).toBe(false)
      expect(config?.sourceContentFromDiffLines).toBeUndefined()
    })
  })
})
