import {parseLineRangeHash} from '@github-ui/diff-lines/document-hash-helpers'
import {lineAnchorFrom} from '@github-ui/diffs/diff-line-helpers'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {usePreviousValue} from '@github-ui/use-previous-value'
import {useEffect, useRef} from 'react'

const DIFF_PAGE_SIZE = 25

/**
 * Hook used to scroll to a linked diff
 * Loads additional pages until we find the linked diff
 * Used on initial load and for loading patches from file tree
 */
export default function useScrollToAnchoredDiff(
  loadNext: (count: number) => void,
  hasNext: boolean,
  pathDigest: string | undefined,
  getDiffIndex: (anchor: string) => number,
  scrollIntoView: (index: number) => void,
  onDiffAnchored: () => void,
) {
  const hash = ssrSafeLocation.hash.substring(1)
  const lineRangeSelectionData = parseLineRangeHash(hash)

  // Track pagination loading state for lifecycle of component.
  // Set the initial value to true only if there is a file anchor referenced by the URL hash that needs to be scrolled to.
  const loading = useRef(false)
  const prevPathDigest = usePreviousValue(pathDigest)

  useEffect(() => {
    // Activate loading state when the thread file anchor changes so we can request more pages of diffs
    if (pathDigest && pathDigest !== prevPathDigest) {
      loading.current = true
    }

    // Return early if
    // - we have exhausted the pages of diffs for the given file anchor
    // - we successfully focused the diff
    // - we were never in a loading state to begin with
    if (!loading.current) return

    const fileAnchor = pathDigest

    // The file anchor may not initially be present, so we try to load diffs until we find it
    if (fileAnchor) {
      const diffIndex = getDiffIndex(fileAnchor)
      if (diffIndex > -1) {
        scrollIntoView(diffIndex)

        // if a specific line is selected, scroll to it and focus the first content cell in the selection
        if (lineRangeSelectionData) {
          const {startLineNumber, startOrientation} = lineRangeSelectionData
          const firstLineAnchor = lineAnchorFrom(fileAnchor, startOrientation, startLineNumber)
          requestAnimationFrame(() => {
            const firstSelectedCell = document.querySelector<HTMLElement>(
              `td.diff-text-cell[data-line-anchor="${firstLineAnchor}"]`,
            )
            if (!firstSelectedCell) return

            firstSelectedCell.scrollIntoView({block: 'center', inline: 'center'})
            firstSelectedCell.focus({preventScroll: true})
          })
        } else {
          // Due to the unpredictable size of diffs we have to call this a second time to ensure we scroll to the proper position
          requestAnimationFrame(() => scrollIntoView(diffIndex))
        }

        onDiffAnchored()
        loading.current = false
      } else if (hasNext) {
        loadNext(DIFF_PAGE_SIZE)
      } else {
        onDiffAnchored()
        loading.current = false
      }
    }
  })
}
