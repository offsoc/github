import type {
  ApplySuggestedChangesValidationData,
  SuggestedChange,
  SuggestedChangeLineRange,
  SuggestedChangesConfiguration,
  Thread,
} from './types'

/**
 * Returns functions related to suggested changes
 */

/**
 * Determines if two line ranges intersect
 * Based on https://stackoverflow.com/a/35754308
 */
export function lineRangesIntersect(range1: SuggestedChangeLineRange, range2: SuggestedChangeLineRange): boolean {
  return range1.endLineNumber >= range2.startLineNumber && range1.startLineNumber <= range2.endLineNumber
}

/** Checks to see if a suggested change is in a pending batch of suggested changes */
export function isSuggestedChangeInPendingBatch(
  suggestedChange: SuggestedChange,
  pendingBatch: SuggestedChange[],
): boolean {
  return pendingBatch.some((batchedChange: SuggestedChange) => {
    return isSuggestedChangeEqual(batchedChange, suggestedChange)
  })
}

/** Determines whether a change is equivalent to another */
export function isSuggestedChangeEqual(a: SuggestedChange, b: SuggestedChange) {
  return (
    a.commentId === b.commentId &&
    a.path === b.path &&
    a.suggestion.length === b.suggestion.length &&
    suggestionsAreEqual(a.suggestion, b.suggestion)
  )
}

/** Checks to see if 2 suggestions are equal to each other */
const suggestionsAreEqual = (batchedSuggestion: string[], newSuggestion: string[]) => {
  if (batchedSuggestion.length !== newSuggestion.length) return false
  return !batchedSuggestion.some((sug, idx) => sug !== newSuggestion[idx])
}

// Arbitrary number we've chosen, can be tweaked based on performance
export const MAX_SUGGESTED_CHANGES_BATCH_SIZE = 50

/**
 * Checks whether the suggested change lines intersect with any of the pending suggested changes in the batch
 * @param suggestedChange - the suggested change to check
 * @returns boolean
 */
function suggestedChangeLineRangesIntersect(
  suggestedChange: SuggestedChange,
  pendingSuggestedChangesBatch: SuggestedChange[],
): boolean {
  for (const pendingChange of pendingSuggestedChangesBatch) {
    if (suggestedChange.path !== pendingChange.path) continue
    return lineRangesIntersect(suggestedChange.lineRange, pendingChange.lineRange)
  }
  return false
}

export const SUGGESTED_CHANGES_ERRORS = {
  USER_CANNOT_APPLY_SUGGESTION: 'You do not have permission to apply this suggestion.',
  PULL_REQUEST_IS_CLOSED: 'This suggestion cannot be applied because the pull request is closed.',
  PULL_REQUEST_IS_IN_MERGE_QUEUE: 'This suggestion cannot be applied because the pull request is queued to merge.',
  IS_OUTDATED: 'This suggestion is outdated and cannot be applied.',
  IS_PENDING: 'This suggestion is part of a pending comment and cannot be applied.',
  IS_RESOLVED: 'This suggestion is part of a resolved comment and cannot be applied.',
  UNCHANGED_CODE: 'This suggestion is invalid because no changes were made to the code.',
  INVALID_RANGE: 'Unable to commit due to other pending changes affecting this line.',
  BATCH_TOO_BIG: 'Unable to commit due to too many changes in the batch.',
  DELETED_LINES: 'Unable to apply suggestions on deleted lines.',
  RANGE_NOT_PROVIDED: 'This suggestion does not have a valid line range.',
  UNABLE_TO_DETERMINE_VALIDITY: 'Unable to determine the validity of this suggestion.',
}

/**
 * Validates a suggested change can be applied, independent of batch
 */
export function validateSuggestedChangeCanBeApplied({
  suggestedChange,
  isOutdated,
  isPending,
  isResolved,
  pullRequestIsClosed,
  pullRequestIsInMergeQueue,
  userCanApplySuggestion,
  applySuggestedChangesValidationData,
  suggestedChangesConfig,
}: {
  suggestedChange: SuggestedChange
  isOutdated: boolean | undefined
  isPending: boolean
  isResolved: boolean
  pullRequestIsClosed: boolean
  pullRequestIsInMergeQueue: boolean
  userCanApplySuggestion: boolean
  applySuggestedChangesValidationData: ApplySuggestedChangesValidationData
  suggestedChangesConfig: SuggestedChangesConfiguration | undefined
}): {
  isValid: boolean
  reason?: string
} {
  const {lineRange} = applySuggestedChangesValidationData
  if (isOutdated) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.IS_OUTDATED}
  if (isPending) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.IS_PENDING}
  if (isResolved) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.IS_RESOLVED}
  if (pullRequestIsClosed) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_CLOSED}
  if (pullRequestIsInMergeQueue)
    return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_IN_MERGE_QUEUE}
  if (!userCanApplySuggestion) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.USER_CANNOT_APPLY_SUGGESTION}
  if (!lineRange) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.RANGE_NOT_PROVIDED}
  if (!suggestedChangesConfig) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.UNABLE_TO_DETERMINE_VALIDITY}

  const isValidSuggestionRange = suggestedChangesConfig?.isValidSuggestionRange
  if (!isValidSuggestionRange) return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.DELETED_LINES}

  const originalLinesContentFromSuggestedChangeConfig = suggestedChangesConfig?.sourceContentFromDiffLines
  const suggestedChangeText = suggestedChange.suggestion.join('\n')
  const isEmptyLineDeletion = suggestedChange.suggestion.length === 0

  if (!isEmptyLineDeletion && suggestedChangeText === originalLinesContentFromSuggestedChangeConfig)
    return {isValid: false, reason: SUGGESTED_CHANGES_ERRORS.UNCHANGED_CODE}

  return {isValid: true}
}

/**
 * Validates whether a suggested change can be added to a batch
 */
export function validateSuggestedChangeCanBeAddedToBatch(
  suggestedChange: SuggestedChange,
  pendingSuggestedChangesBatch: SuggestedChange[],
): {isValid: boolean; reason?: string} {
  const invalidRangeResult = {
    isValid: false,
    reason: SUGGESTED_CHANGES_ERRORS.INVALID_RANGE,
  }
  const invalidBatchSizeResult = {
    isValid: false,
    reason: SUGGESTED_CHANGES_ERRORS.BATCH_TOO_BIG,
  }
  const validSuggestedChangeResult = {isValid: true}

  if (pendingSuggestedChangesBatch.length >= MAX_SUGGESTED_CHANGES_BATCH_SIZE) return invalidBatchSizeResult

  if (pendingSuggestedChangesBatch.find(pendingChange => pendingChange.threadId === suggestedChange.threadId))
    return invalidRangeResult
  if (suggestedChangeLineRangesIntersect(suggestedChange, pendingSuggestedChangesBatch)) return invalidRangeResult

  return validSuggestedChangeResult
}

/**
 * Returns the line range the suggested change applies to
 */
export function generateSuggestedChangeLineRangeFromDiffThread(
  thread: Thread | undefined,
): SuggestedChangeLineRange | undefined {
  if (!thread || thread.subjectType !== 'LINE' || !thread.subject) return undefined

  const startDiffSide = thread.subject.startDiffSide ?? thread.subject.endDiffSide

  if (!startDiffSide) {
    return undefined
  }

  if (thread.isOutdated && thread.subject.originalStartLine && thread.subject.originalEndLine) {
    return {
      endLineNumber: thread.subject.originalEndLine,
      endOrientation: thread.subject.endDiffSide || 'RIGHT',
      startLineNumber: thread.subject.originalStartLine,
      startOrientation: startDiffSide,
    }
  }

  if (!thread.subject.endLine || !thread.subject.endDiffSide) {
    return undefined
  }

  const startLine = thread.subject.startLine ?? thread?.subject.endLine
  return {
    endLineNumber: thread.subject.endLine,
    endOrientation: thread.subject.endDiffSide,
    startLineNumber: startLine,
    startOrientation: startDiffSide || 'RIGHT',
  }
}
