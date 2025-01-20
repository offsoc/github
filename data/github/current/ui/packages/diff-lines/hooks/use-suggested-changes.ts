import {useMemo} from 'react'
import {useSelectedDiffRowRangeContext} from '../contexts/SelectedDiffRowRangeContext'
import {trimContentLine, getContentFromLines} from '../helpers/line-helpers'
import type {SuggestedChangesConfiguration, Thread} from '@github-ui/conversations'
import type {DiffLine, LineRange} from '../types'
import {useAnalytics} from '@github-ui/use-analytics'
import {useStableCallback} from './use-stable-callback'
import {generateSuggestedChangeLineRangeFromDiffThread} from '@github-ui/conversations/suggested-changes'

/**
 * Returns the configuration for applying suggested changes when the full diff is not loaded (e.g. the timeline)
 */
export function configureSuggestedChangesFromThreadWithDiffLines(thread: Thread): SuggestedChangesConfiguration {
  const lineRange = generateSuggestedChangeLineRangeFromDiffThread(thread)
  // DiffLines from a thread can include additional context lines, so exclude those
  const suggestedChangeDiffLines = (thread.subject?.diffLines ?? []).filter(diffLine => {
    if (!lineRange) return []
    return (
      (diffLine.left && diffLine.left >= lineRange.startLineNumber && diffLine.left <= lineRange.endLineNumber) ||
      (diffLine.right && diffLine.right >= lineRange.startLineNumber && diffLine.right <= lineRange.endLineNumber)
    )
  })

  const suggestionNotOnDeletedLine = suggestedChangeDiffLines.every(diffLine => diffLine.type !== 'DELETION')

  const originalLinesContentFromDiffLines = suggestedChangeDiffLines
    ?.map(diffLine => trimContentLine(diffLine.text, diffLine.type)[0])
    .join('\n')

  return {
    isValidSuggestionRange: suggestedChangeDiffLines.length > 0 && !!suggestionNotOnDeletedLine,
    showSuggestChangesButton: false,
    sourceContentFromDiffLines: originalLinesContentFromDiffLines,
    onInsertSuggestedChange: () => {},
    shouldInsertSuggestedChange: false,
  }
}

/**
 * Returns the configuration for the Suggest Changes button within the markdown toolbar
 */
export function useSuggestedChanges(
  suggestedChangesEnabled: boolean | undefined,
  line: DiffLine,
  shouldStartNewConversationWithSuggestedChange: boolean | undefined,
) {
  const {sendAnalyticsEvent} = useAnalytics()
  const {getDiffLinesFromLineRange, selectedDiffRowRange} = useSelectedDiffRowRangeContext()

  function shouldShowSuggestChangesButtonFromRowRange(rowRange?: LineRange) {
    // Context menu triggers from single line don't have a row range, so fall back to the line
    if (!rowRange) return line.type !== 'DELETION'

    const rightSideOnly = rowRange.startOrientation === 'right' && rowRange.endOrientation === 'right'
    if (rightSideOnly) {
      return true
    }

    const singleLine =
      rowRange.startLineNumber === rowRange.endLineNumber && rowRange.startOrientation === rowRange.endOrientation
    if (singleLine) {
      return line.type !== 'DELETION'
    }

    const diffLinesFromRange = getDiffLinesFromLineRange(rowRange)?.selectedLeftLines
    return !!diffLinesFromRange?.every(diffLine => diffLine !== 'empty-diff-line' && diffLine.type !== 'DELETION')
  }

  /**
   *
   * Returns the lines that should be suggested for a comment
   *
   * @param diffLines - the right lines belonging to the range for the thread or the new conversation
   * @param line - the current line the cell from which this is called belongs to
   *
   */
  function getSourceContentDiffLinesFromRowRange(rowRange: LineRange | undefined): string | undefined {
    const diffLines = getDiffLinesFromLineRange(rowRange)?.selectedRightLines
    if (rowRange && diffLines && diffLines.length > 1) {
      return getContentFromLines(diffLines)
    }

    if (!line) return ''
    // Single line
    const [lineContent] = trimContentLine(line.text, line.type)
    return lineContent
  }

  /**
   * Returns the configuration for the Suggest Changes button within the markdown toolbar
   *
   * @param rowRange - the range of lines for the thread or the new conversation
   * @param shouldInsertSuggestedChange - boolean indicating whether to auto insert the suggested change on render
   */
  const configureSuggestedChangesFromLineRange = useStableCallback(function configureSuggestedChangesFromLineRange(
    rowRange?: LineRange,
    shouldInsertSuggestedChange?: boolean,
  ) {
    if (!suggestedChangesEnabled) return undefined

    const showSuggestChangesButton = shouldShowSuggestChangesButtonFromRowRange(rowRange)

    return {
      isValidSuggestionRange: showSuggestChangesButton,
      showSuggestChangesButton,
      sourceContentFromDiffLines: showSuggestChangesButton
        ? getSourceContentDiffLinesFromRowRange(rowRange)
        : undefined,
      onInsertSuggestedChange: () => {
        sendAnalyticsEvent('diff.add_suggested_change', 'ADD_SUGGESTED_CHANGE_BUTTON')
      },
      shouldInsertSuggestedChange,
    }
  })

  return useMemo(() => {
    return {
      selectedDiffRowRange,
      configureSuggestedChangesFromLineRange,
      shouldStartNewConversationWithSuggestedChange,
    }
  }, [selectedDiffRowRange, configureSuggestedChangesFromLineRange, shouldStartNewConversationWithSuggestedChange])
}
