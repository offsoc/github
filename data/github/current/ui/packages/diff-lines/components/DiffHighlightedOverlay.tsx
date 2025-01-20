import type {DiffMatchContent} from '../diff-lines'
import styles from './DiffHighlightedOverlay.module.css'
import {clsx} from 'clsx'

export function DiffHighlightedOverlay({
  searchResults,
  focusedSearchResult,
  className,
  styleObject,
}: {
  searchResults: DiffMatchContent[]
  focusedSearchResult?: number
  className: string
  styleObject?: React.CSSProperties | undefined
}) {
  let startIndex = 0
  const text = searchResults[0]?.text ?? ''
  const lineNumber = searchResults[0]?.diffLineNumIndex ?? -1
  const key = `overlay-${lineNumber}-${text}`

  return (
    <span
      key={key}
      className={clsx(
        className,
        'position-absolute',
        styles.userSelectNone,
        //taking into account the 30px of padding on the table cell for word wrapping purposes
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        !searchResults[0]!.isHunk && styles.nonHunkStyles,
      )}
      style={{
        ...styleObject,
      }}
    >
      {searchResults.map(result => {
        const isFocusedResult = result.indexWithinPathDigest === focusedSearchResult
        const line = (
          <span key={`find-match-${result.diffLineNumIndex}-${result.column}`}>
            <span className={clsx(styles.visibilityHidden, styles.userSelectNone)}>
              {text.substring(startIndex, result.column)}
            </span>
            <span
              className={clsx(
                styles.userSelectNone,
                isFocusedResult && styles.focusedResultStyles,
                !isFocusedResult && styles.nonFocusedResultStyles,
              )}
            >
              <span
                className={clsx(!isFocusedResult && styles.visibilityHidden)}
                id={matchElementId(result.indexWithinPathDigest, result.pathDigest)}
              >
                {text.substring(result.column, result.columnEnd)}
              </span>
            </span>
          </span>
        )

        startIndex = result.columnEnd

        return line
      })}
      {/** Return the rest of the line to wrap properly */}
      <span className={clsx(styles.visibilityHidden, styles.userSelectNone)}>{text.substring(startIndex)}</span>
    </span>
  )
}

export function matchElementId(line: number, digest: string) {
  return `match-${digest}-${line}`
}
