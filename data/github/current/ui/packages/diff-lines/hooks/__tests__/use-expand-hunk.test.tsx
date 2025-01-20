import type {DiffAnchor} from '@github-ui/diffs/types'
import {renderHook} from '@testing-library/react'
import type React from 'react'
import {MemoryRouter} from 'react-router-dom'

import {useDiffLineContext} from '../../contexts/DiffLineContext'
import useExpandHunk from '../use-expand-hunk'
import {useDiffContext} from '../../contexts/DiffContext'
import type {DiffLine} from '../../types'

jest.mock('../../contexts/DiffLineContext')
jest.mock('../../contexts/DiffContext')
const mockedDiffLineContext = jest.mocked(useDiffLineContext)
const mockedDiffContext = jest.mocked(useDiffContext)

const defaultDiffLineContextMockdata = {
  diffEntryId: 'mockedId',
  diffLine: {left: 1, right: 1, blobLineNumber: 1, type: 'ADDITION', html: '{', text: '{'} as DiffLine,
  fileAnchor: 'diff-mockedFileAnchor' as DiffAnchor,
  fileLineCount: 100,
  filePath: 'mockedFileAnchor',
  isSplit: false,
  rowId: 'mockedRowId',
}

const mockedDiffContextReturnValue = {
  addInjectedContextLines: jest.fn(),
  commentingEnabled: false,
  commentBatchPending: false,
  repositoryId: '',
  subjectId: '',
  subject: {},
  viewerCanComment: false,
  viewerData: {
    avatarUrl: '',
    diffViewPreference: '',
    isSiteAdmin: false,
    login: '',
    tabSizePreference: 0,
    viewerCanComment: false,
    viewerCanApplySuggestion: false,
  },
}

function wrapper({children}: {children: React.ReactNode}) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useExpandHunk', () => {
  describe('start of hunk cannot be expanded when', () => {
    test('current hunk is undefined', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: undefined,
      })
      mockedDiffContext.mockReturnValue(mockedDiffContextReturnValue)

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      const {canExpandStartOfHunk} = result.current
      expect(canExpandStartOfHunk).toBe(false)
    })

    test('current hunk is first hunk, but it starts on blobLineNumber 0 (e.g. first diffline of a DiffEntry)', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 0, endBlobLineNumber: 10},
      })
      mockedDiffContext.mockReturnValue(mockedDiffContextReturnValue)

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      const {canExpandStartOfHunk} = result.current
      expect(canExpandStartOfHunk).toBe(false)
    })
  })

  describe('start of hunk can be expanded when', () => {
    test('current hunk is first hunk, but it does not start on blobLineNumber 0 (e.g. first diffline of a DiffEntry)', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 10, endBlobLineNumber: 20},
      })
      mockedDiffContext.mockReturnValue(mockedDiffContextReturnValue)

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      const {canExpandStartOfHunk} = result.current
      expect(canExpandStartOfHunk).toBe(true)
    })

    test('current hunk is not the first hunk', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 40, endBlobLineNumber: 50},
        previousHunk: {startBlobLineNumber: 0, endBlobLineNumber: 8},
      })
      mockedDiffContext.mockReturnValue(mockedDiffContextReturnValue)

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      const {canExpandStartOfHunk} = result.current
      expect(canExpandStartOfHunk).toBe(true)
    })
  })

  describe('end of hunk cannot be expanded when', () => {
    test('current hunk is undefined', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: undefined,
      })
      mockedDiffContext.mockReturnValue(mockedDiffContextReturnValue)

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      const {canExpandEndOfHunk} = result.current
      expect(canExpandEndOfHunk).toBe(false)
    })

    test('current hunk is last hunk', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 0, endBlobLineNumber: 10},
        nextHunk: undefined,
      })
      mockedDiffContext.mockReturnValue(mockedDiffContextReturnValue)

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      const {canExpandEndOfHunk} = result.current
      expect(canExpandEndOfHunk).toBe(false)
    })
  })

  describe('end of hunk can be expanded when', () => {
    test('current hunk is not last hunk', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 10, endBlobLineNumber: 20},
        nextHunk: {startBlobLineNumber: 50, endBlobLineNumber: 70},
      })
      mockedDiffContext.mockReturnValue(mockedDiffContextReturnValue)

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      const {canExpandEndOfHunk} = result.current
      expect(canExpandEndOfHunk).toBe(true)
    })
  })

  describe('expandStartOfHunk', () => {
    test('expands the start of the hunk with an injected context range', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 20, endBlobLineNumber: 40},
      })
      const addInjectedContextLinesMock = jest.fn()
      mockedDiffContext.mockReturnValue({
        ...mockedDiffContextReturnValue,
        addInjectedContextLines: addInjectedContextLinesMock,
      })

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      result.current.expandStartOfHunk()

      expect(addInjectedContextLinesMock).toHaveBeenCalledWith({
        start: 0,
        end: 20,
      })
    })
  })

  describe('expandEndOfHunk', () => {
    test('expands the end of the hunk with an injected context range', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 20, endBlobLineNumber: 40},
      })
      const addInjectedContextLinesMock = jest.fn()
      mockedDiffContext.mockReturnValue({
        ...mockedDiffContextReturnValue,
        addInjectedContextLines: addInjectedContextLinesMock,
      })

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      result.current.expandStartOfHunk()

      expect(addInjectedContextLinesMock).toHaveBeenCalledWith({
        start: 0,
        end: 20,
      })
    })
  })

  describe('expandEndOfPreviousHunk', () => {
    test('expands the end of the previous hunk with an injected context range', () => {
      mockedDiffLineContext.mockReturnValue({
        ...defaultDiffLineContextMockdata,
        currentHunk: {startBlobLineNumber: 90, endBlobLineNumber: 110},
        previousHunk: {startBlobLineNumber: 20, endBlobLineNumber: 40},
      })
      const addInjectedContextLinesMock = jest.fn()
      mockedDiffContext.mockReturnValue({
        ...mockedDiffContextReturnValue,
        addInjectedContextLines: addInjectedContextLinesMock,
      })

      const {result} = renderHook(() => useExpandHunk(), {wrapper})
      result.current.expandEndOfPreviousHunk()

      expect(addInjectedContextLinesMock).toHaveBeenCalledWith({
        start: 41,
        end: 61,
      })
    })
  })
})
