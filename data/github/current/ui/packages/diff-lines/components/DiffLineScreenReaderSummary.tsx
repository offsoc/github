import type {DiffLine} from '../types'

export function buildDiffLineScreenReaderSummary(
  leftLine: DiffLine,
  rightLine: DiffLine,
  currentSide: 'LEFT' | 'RIGHT',
) {
  const leftLineThreadCount = leftLine.threadsData?.totalCount || 0
  const rightLineThreadCount = rightLine.threadsData?.totalCount || 0

  if (leftLineThreadCount === 0 && rightLineThreadCount === 0) {
    return undefined
  }

  const firstLeftCommentAuthor = leftLine.threadsData?.threads?.[0]?.commentsData.comments?.[0]?.author?.login || ''
  const firstRightCommentAuthor = rightLine.threadsData?.threads?.[0]?.commentsData.comments?.[0]?.author?.login || ''

  let leftLineSummary = ''
  if (leftLineThreadCount === 1) {
    leftLineSummary = `has conversation started by @${firstLeftCommentAuthor}.`
  } else if (leftLineThreadCount > 1) {
    leftLineSummary = `has conversations.`
  }

  let rightLineSummary = ''
  if (rightLineThreadCount === 1) {
    rightLineSummary = `has conversation started by @${firstRightCommentAuthor}.`
  } else if (rightLineThreadCount > 1) {
    rightLineSummary = `has conversations.`
  }

  let summary = ''
  if (currentSide === 'LEFT') {
    const capitalizedLeftSummary = `${leftLineSummary.charAt(0).toUpperCase()}${leftLineSummary.slice(1)}`
    const rightLineSummaryWithModified = `${rightLineSummary.length > 1 ? 'Modified line' : ''} ${rightLineSummary}`
    summary = `${capitalizedLeftSummary} ${rightLineSummaryWithModified}`
  } else {
    const capitalizedRightSummary = `${rightLineSummary.charAt(0).toUpperCase()}${rightLineSummary.slice(1)}`
    const leftLineSummaryWithOriginal = `${leftLineSummary.length > 1 ? 'Original line' : ''} ${leftLineSummary}`
    summary = `${capitalizedRightSummary} ${leftLineSummaryWithOriginal}`
  }

  return summary
}
/**
 * Provides a screen-reader only summary of the diff line
 * For each diff line, indicates whether there are conversations on both the original and modified lines.
 * @param summary the summary for the conversations on a given diff line
 */
export default function DiffLineScreenReaderSummary({summary}: {summary: string}) {
  if (summary === '') {
    return null
  }
  return (
    <div className="sr-only" data-testid="pr-diffline-summary">
      {summary.trimStart().trimEnd()}
    </div>
  )
}
