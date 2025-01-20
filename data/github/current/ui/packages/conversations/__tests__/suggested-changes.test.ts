import {
  lineRangesIntersect,
  MAX_SUGGESTED_CHANGES_BATCH_SIZE,
  SUGGESTED_CHANGES_ERRORS,
  validateSuggestedChangeCanBeAddedToBatch,
  validateSuggestedChangeCanBeApplied,
} from '../suggested-changes'
import type {SuggestedChange, SuggestedChangeLineRange, SuggestedChangesConfiguration} from '../types'

const lineRange: SuggestedChangeLineRange = {
  startLineNumber: 1,
  endLineNumber: 1,
  endOrientation: 'LEFT',
  startOrientation: 'LEFT',
}

const suggestedChange = {
  authorLogin: 'monalisa',
  commentId: 'commentId',
  path: 'path',
  suggestion: ['suggestion'],
  threadId: 'threadId',
  lineRange,
}

const suggestedChangesConfig: SuggestedChangesConfiguration = {
  isValidSuggestionRange: true,
  showSuggestChangesButton: false,
  sourceContentFromDiffLines: 'originalLinesContent',
  onInsertSuggestedChange: () => {},
  shouldInsertSuggestedChange: false,
}

describe('lineRangesIntersect', () => {
  test('returns true when range 1 start overlaps range 2 start', () => {
    const lineRange1 = {...lineRange, startLineNumber: 1, endLineNumber: 3}
    const lineRange2 = {...lineRange, startLineNumber: 2, endLineNumber: 4}

    expect(lineRangesIntersect(lineRange1, lineRange2)).toBe(true)
  })

  test('returns true when range 1 encompasses range 2', () => {
    const lineRange1 = {...lineRange, startLineNumber: 1, endLineNumber: 5}
    const lineRange2 = {...lineRange, startLineNumber: 2, endLineNumber: 4}

    expect(lineRangesIntersect(lineRange1, lineRange2)).toBe(true)
  })

  test('returns true when range 1 end overlaps range 2 end', () => {
    const lineRange1 = {...lineRange, startLineNumber: 3, endLineNumber: 5}
    const lineRange2 = {...lineRange, startLineNumber: 2, endLineNumber: 4}

    expect(lineRangesIntersect(lineRange1, lineRange2)).toBe(true)
  })

  test('returns true when range 1 equals range 2', () => {
    const lineRange1 = {...lineRange, startLineNumber: 3, endLineNumber: 3}
    const lineRange2 = {...lineRange, startLineNumber: 3, endLineNumber: 3}

    expect(lineRangesIntersect(lineRange1, lineRange2)).toBe(true)
  })

  test('returns true when range 1 end equals range 2 start', () => {
    const lineRange1 = {...lineRange, startLineNumber: 1, endLineNumber: 3}
    const lineRange2 = {...lineRange, startLineNumber: 3, endLineNumber: 4}

    expect(lineRangesIntersect(lineRange1, lineRange2)).toBe(true)
  })

  test('returns false when range 1 does not overlap with range 2', () => {
    const lineRange1 = {...lineRange, startLineNumber: 1, endLineNumber: 3}
    const lineRange2 = {...lineRange, startLineNumber: 4, endLineNumber: 5}

    expect(lineRangesIntersect(lineRange1, lineRange2)).toBe(false)
  })
})

describe('validateSuggestedChangeCanBeAddedToBatch', () => {
  test('returns true when no pending suggested changes', () => {
    const pendingSuggestedChangesBatch: SuggestedChange[] = []

    expect(validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)).toEqual({
      isValid: true,
    })
  })

  describe('max changes in one batch', () => {
    test('returns false when the number of suggested changes exceeds the limit', () => {
      const pendingSuggestedChangesBatch: SuggestedChange[] = []

      for (let i = 0; i < MAX_SUGGESTED_CHANGES_BATCH_SIZE; i++) {
        pendingSuggestedChangesBatch.push({
          ...suggestedChange,
          lineRange: {...lineRange, startLineNumber: i, endLineNumber: i},
        })
      }

      expect(validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.BATCH_TOO_BIG,
      })
    })

    test('returns true when the number of suggested changes does not exceed the limit', () => {
      const pendingSuggestedChangesBatch: SuggestedChange[] = []

      for (let i = 0; i < MAX_SUGGESTED_CHANGES_BATCH_SIZE - 1; i++) {
        pendingSuggestedChangesBatch.push({
          ...suggestedChange,
          commentId: i.toString(),
          threadId: i.toString(),
          lineRange: {...lineRange, startLineNumber: i, endLineNumber: i},
        })
      }

      expect(validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)).toEqual({
        isValid: true,
      })
    })
  })

  describe('suggested change lines intersect due to same threadId', () => {
    test('returns false when a pending suggested change from the same thread exists', () => {
      const pendingSuggestedChange = {
        ...suggestedChange,
        commentId: 'commentId2',
        lineRange: {...lineRange, startLineNumber: 2, endLineNumber: 2},
      }
      const pendingSuggestedChangesBatch: SuggestedChange[] = [pendingSuggestedChange]

      expect(validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.INVALID_RANGE,
      })
    })

    test('returns true when a pending suggested change from the same thread does not exist', () => {
      const pendingSuggestedChange = {
        ...suggestedChange,
        commentId: 'commentId2',
        threadId: 'threadId2',
        lineRange: {...lineRange, startLineNumber: 2, endLineNumber: 2},
      }
      const pendingSuggestedChangesBatch: SuggestedChange[] = [pendingSuggestedChange]

      expect(validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)).toEqual({
        isValid: true,
      })
    })
  })

  describe('suggested change lines intersect due to overlapping line ranges', () => {
    test('returns false when a pending suggested change for the line range exists', () => {
      const pendingSuggestedChange = {
        ...suggestedChange,
        commentId: 'commentId2',
        threadId: 'threadId2',
        lineRange: {...lineRange, startLineNumber: 1, endLineNumber: 3},
      }
      const pendingSuggestedChangesBatch: SuggestedChange[] = [pendingSuggestedChange]

      expect(validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.INVALID_RANGE,
      })
    })

    test('returns true when a pending suggested change for the line range does not exist', () => {
      const pendingSuggestedChange = {
        ...suggestedChange,
        commentId: 'commentId2',
        threadId: 'threadId2',
        lineRange: {...lineRange, startLineNumber: 2, endLineNumber: 3},
      }
      const pendingSuggestedChangesBatch: SuggestedChange[] = [pendingSuggestedChange]

      expect(validateSuggestedChangeCanBeAddedToBatch(suggestedChange, pendingSuggestedChangesBatch)).toEqual({
        isValid: true,
      })
    })
  })
})

describe('validateSuggestedChangeCanBeApplied', () => {
  describe('suggestedChangeConfig is not passed', () => {
    test('returns false', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig: undefined,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.UNABLE_TO_DETERMINE_VALIDITY,
      })
    })
  })

  describe('suggested change is the same as the original line(s)', () => {
    test('returns true when the suggestion is to delete a newline', () => {
      const suggestedChangeToValidate = {
        ...suggestedChange,
        suggestion: [],
      }

      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange: suggestedChangeToValidate,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig: {...suggestedChangesConfig, sourceContentFromDiffLines: ''},
        }),
      ).toEqual({
        isValid: true,
      })
    })

    test('returns false when the suggested change on a single line is the same as the original line', () => {
      const suggestedChangeToValidate = {
        ...suggestedChange,
        suggestion: ['originalLinesContent'],
      }

      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange: suggestedChangeToValidate,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig: {...suggestedChangesConfig, sourceContentFromDiffLines: 'originalLinesContent'},
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.UNCHANGED_CODE,
      })
    })

    test('returns false when the suggested changes on multiple lines are the same as the original lines', () => {
      const suggestedChangeToValidate = {
        ...suggestedChange,
        suggestion: ['originalLinesContent1', 'originalLinesContent2'],
      }

      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange: suggestedChangeToValidate,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig: {
            ...suggestedChangesConfig,
            sourceContentFromDiffLines: 'originalLinesContent1\noriginalLinesContent2',
          },
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.UNCHANGED_CODE,
      })
    })

    test('returns true for deleting a line', () => {
      const suggestedChangeToValidate = {
        ...suggestedChange,
        suggestion: [],
      }

      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange: suggestedChangeToValidate,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })

    test('returns true for deleting multiple lines', () => {
      const suggestedChangeToValidate = {
        ...suggestedChange,
        suggestion: [],
      }

      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange: suggestedChangeToValidate,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })

  describe('comment is outdated', () => {
    test('returns false when the comment is outdated', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: true,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.IS_OUTDATED,
      })
    })

    test('returns true when the comment is not outdated', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })

  describe('comment is pending', () => {
    test('returns false when the comment is pending', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: true,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.IS_PENDING,
      })
    })

    test('returns true when the comment is not pending', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })

  describe('comment is resolved', () => {
    test('returns false when the comment is resolved', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: true,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.IS_RESOLVED,
      })
    })

    test('returns true when the comment is not resolved', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })

  describe('pull request is closed', () => {
    test('returns false when the pull request is closed', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: true,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_CLOSED,
      })
    })

    test('returns true when the pull request is not closed', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })

  describe('pull request is in the merge queue', () => {
    test('returns false when the pull request is in the merge queue', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: true,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_IN_MERGE_QUEUE,
      })
    })

    test('returns true when the pull request is not in the merge queue', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })

  describe('user lacks ability to apply change', () => {
    test('returns false when the user does not have permission to apply change', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: false,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.USER_CANNOT_APPLY_SUGGESTION,
      })
    })

    test('returns true when user has permissions to apply change', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })

  describe('when there are multiple invalid conditions, show the thread-specific ones first', () => {
    test('shows thread outdated error before pull request is closed / user cannot apply suggestion error', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: true,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: true,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: false,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.IS_OUTDATED,
      })
    })

    test('shows pull request is closed error before user cannot apply suggestion error', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: true,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: false,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig,
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_CLOSED,
      })
    })
  })

  describe('applying a change on a deleted line (a range for which we do not show the suggest change markdown button)', () => {
    test('returns false when the suggested line range is not valid', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig: {...suggestedChangesConfig, isValidSuggestionRange: false},
        }),
      ).toEqual({
        isValid: false,
        reason: SUGGESTED_CHANGES_ERRORS.DELETED_LINES,
      })
    })

    test('returns true when we do show the button', () => {
      expect(
        validateSuggestedChangeCanBeApplied({
          suggestedChange,
          isOutdated: false,
          isPending: false,
          isResolved: false,
          pullRequestIsClosed: false,
          pullRequestIsInMergeQueue: false,
          userCanApplySuggestion: true,
          applySuggestedChangesValidationData: {lineRange},
          suggestedChangesConfig: {...suggestedChangesConfig, isValidSuggestionRange: true},
        }),
      ).toEqual({
        isValid: true,
      })
    })
  })
})
