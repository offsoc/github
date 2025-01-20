import type {LineRange} from '@github-ui/diff-lines'
import {noop} from '@github-ui/noop'
import {renderHook} from '@testing-library/react'
import {useRelayEnvironment} from 'react-relay'

import {usePendingSuggestedChangesBatchContext} from '../../contexts/PendingSuggestedChangesBatchContext'
import {usePullRequestContext} from '../../contexts/PullRequestContext'
import addPullRequestReviewThreadMutation from '../../mutations/add-pull-request-review-thread-mutation'
import {buildDiffLine} from '../../test-utils/query-data'
import {usePullRequestCommenting} from '../use-pull-request-commenting'

jest.mock('react-relay')
jest.mock('../../contexts/PullRequestContext')
jest.mock('../../contexts/PendingSuggestedChangesBatchContext')
jest.mock('../../mutations/add-pull-request-review-thread-mutation')
jest.mocked(useRelayEnvironment)
const mockUsePullRequestContext = jest.mocked(usePullRequestContext)
const mockUsePendingSuggestedChangesBatchContext = jest.mocked(usePendingSuggestedChangesBatchContext)
const mockAddPullRequestReviewThreadMutation = jest.mocked(addPullRequestReviewThreadMutation)

const pullRequestId = 'PR_2312a2'
const diffFileName = 'README.md'
const diffAnchor = 'diff-readme'
const diffFileInfo = {
  path: diffFileName,
  pullRequestId,
}

beforeEach(() => {
  jest.resetAllMocks()
  mockUsePullRequestContext.mockReturnValue({
    headRefOid: 'mock-head-ref-oid',
    pullRequestId,
    repositoryId: 'mock-repository-id',
    state: 'OPEN',
    isInMergeQueue: false,
  })
  mockUsePendingSuggestedChangesBatchContext.mockReturnValue({
    addSuggestedChangeToBatch: noop,
    clearSuggestedChangesBatch: noop,
    pendingSuggestedChangesBatch: [],
    removeSuggestedChangeFromBatch: noop,
  })
})

describe('addComment fn', () => {
  describe('when isLeftSide is true', () => {
    test('it submits left side diffline conversation thread for single lines', () => {
      const diffLine = buildDiffLine({threads: [], blobLineNumber: 4, left: 4, right: 3, type: 'DELETION'})
      const {result} = renderHook(usePullRequestCommenting)
      result.current.addThread({
        filePath: diffFileName,
        onError: () => {},
        text: 'test comment for line L5',
        diffLine,
        isLeftSide: true,
        submitBatch: true,
      })

      expect(mockAddPullRequestReviewThreadMutation.mock.calls).toHaveLength(1)
      const mutationMockCall = mockAddPullRequestReviewThreadMutation.mock.calls[0]?.[0]
      expect(mutationMockCall?.input).toEqual({
        ...diffFileInfo,
        body: 'test comment for line L5',
        line: 4,
        side: 'LEFT',
        startLine: undefined,
        startSide: undefined,
        subjectType: 'LINE',
        submitReview: true,
      })
    })

    test('it submits left side diffline conversation thread for multiple lines that start on left side', () => {
      const diffLine = buildDiffLine({threads: [], blobLineNumber: 5, left: 5, right: 3, type: 'DELETION'})
      const {result} = renderHook(usePullRequestCommenting)
      result.current.addThread({
        filePath: diffFileName,
        onError: () => {},
        text: 'test comment for lines L3 to L5',
        diffLine,
        isLeftSide: true,
        selectedDiffRowRange: {
          ...diffFileInfo,
          diffAnchor,
          endLineNumber: 5,
          endOrientation: 'left',
          startLineNumber: 3,
          startOrientation: 'left',
          firstSelectedLineNumber: 3,
          firstSelectedOrientation: 'left',
        } as LineRange,
        submitBatch: true,
      })

      expect(mockAddPullRequestReviewThreadMutation.mock.calls).toHaveLength(1)
      const mutationMockCall = mockAddPullRequestReviewThreadMutation.mock.calls[0]?.[0]
      expect(mutationMockCall?.input).toEqual({
        ...diffFileInfo,
        subjectType: 'LINE',
        body: 'test comment for lines L3 to L5',
        line: 5,
        side: 'LEFT',
        startLine: 3,
        startSide: 'LEFT',
        submitReview: true,
        pullRequestId: 'PR_2312a2',
      })
    })

    test('it submits left side diffline conversation thread for multiple lines that start on right side', () => {
      const diffLine = buildDiffLine({threads: [], blobLineNumber: 6, left: 6, right: 3, type: 'DELETION'})
      const {result} = renderHook(usePullRequestCommenting)
      result.current.addThread({
        filePath: diffFileName,
        onError: () => {},
        text: 'test comment for lines R2 to L6',
        diffLine,
        isLeftSide: true,
        selectedDiffRowRange: {
          ...diffFileInfo,
          diffAnchor,
          endLineNumber: 6,
          endOrientation: 'left',
          startLineNumber: 2,
          startOrientation: 'right',
          firstSelectedLineNumber: 2,
          firstSelectedOrientation: 'right',
        } as LineRange,
        submitBatch: true,
      })

      expect(mockAddPullRequestReviewThreadMutation.mock.calls).toHaveLength(1)
      const mutationMockCall = mockAddPullRequestReviewThreadMutation.mock.calls[0]?.[0]
      expect(mutationMockCall?.input).toEqual({
        ...diffFileInfo,
        subjectType: 'LINE',
        body: 'test comment for lines R2 to L6',
        line: 6,
        side: 'LEFT',
        startLine: 2,
        startSide: 'RIGHT',
        submitReview: true,
      })
    })
  })
})

describe('on right side of diff', () => {
  test('it submits right side diffline conversation thread for single lines', () => {
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 5, left: 4, right: 5, type: 'ADDITION'})
    const {result} = renderHook(usePullRequestCommenting)
    result.current.addThread({
      filePath: diffFileName,
      onError: () => {},
      text: 'test comment for line R5',
      diffLine,
      isLeftSide: false,
      submitBatch: true,
    })

    expect(mockAddPullRequestReviewThreadMutation.mock.calls).toHaveLength(1)
    const mutationMockCall = mockAddPullRequestReviewThreadMutation.mock.calls[0]?.[0]
    expect(mutationMockCall?.input).toEqual({
      ...diffFileInfo,
      subjectType: 'LINE',
      body: 'test comment for line R5',
      line: 5,
      side: 'RIGHT',
      startLine: undefined,
      startSide: undefined,
      submitReview: true,
    })
  })

  test('it submits right side diffline conversation thread for multiple lines that start on right side', () => {
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 10, left: 4, right: 10, type: 'ADDITION'})
    const selectedDiffRowRange = {
      diffAnchor,
      endLineNumber: 10,
      endOrientation: 'right',
      startLineNumber: 2,
      startOrientation: 'right',
      firstSelectedLineNumber: 2,
      firstSelectedOrientation: 'right',
    } as LineRange
    const {result} = renderHook(usePullRequestCommenting)
    result.current.addThread({
      filePath: diffFileName,
      onError: () => {},
      text: 'test comment for lines R2 to R10',
      diffLine,
      isLeftSide: false,
      submitBatch: true,
      selectedDiffRowRange,
    })

    expect(mockAddPullRequestReviewThreadMutation.mock.calls).toHaveLength(1)
    const mutationMockCall = mockAddPullRequestReviewThreadMutation.mock.calls[0]?.[0]
    expect(mutationMockCall?.input).toEqual({
      ...diffFileInfo,
      subjectType: 'LINE',
      body: 'test comment for lines R2 to R10',
      line: 10,
      side: 'RIGHT',
      startLine: 2,
      startSide: 'RIGHT',
      submitReview: true,
    })
  })

  test('it submits left side diffline conversation thread for multiple lines that start on left side', () => {
    const diffLine = buildDiffLine({threads: [], blobLineNumber: 20, left: 19, right: 20, type: 'ADDITION'})
    const selectedDiffRowRange = {
      diffAnchor,
      endLineNumber: 20,
      endOrientation: 'right',
      startLineNumber: 18,
      startOrientation: 'left',
      firstSelectedLineNumber: 18,
      firstSelectedOrientation: 'left',
    } as LineRange
    const {result} = renderHook(usePullRequestCommenting)
    result.current.addThread({
      filePath: diffFileName,
      onError: () => {},
      text: 'test comment for lines L18 to R20',
      diffLine,
      isLeftSide: false,
      submitBatch: true,
      selectedDiffRowRange,
    })

    expect(mockAddPullRequestReviewThreadMutation.mock.calls).toHaveLength(1)
    const mutationMockCall = mockAddPullRequestReviewThreadMutation.mock.calls[0]?.[0]
    expect(mutationMockCall?.input).toEqual({
      ...diffFileInfo,
      subjectType: 'LINE',
      body: 'test comment for lines L18 to R20',
      line: 20,
      side: 'RIGHT',
      startLine: 18,
      startSide: 'LEFT',
      submitReview: true,
    })
  })
})
