import {sortDiffEntries} from '@github-ui/diff-file-tree'
import {parseDiffHash} from '@github-ui/diff-lines/document-hash-helpers'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {ObservableBox} from '@github-ui/use-sticky-header/ObservableBox'
import {useIntersectionObserver} from '@github-ui/use-sticky-header/useIntersectionObserver'
import {useVirtualDynamic, useVirtualWindow} from '@github-ui/use-virtual'
import {Box, Spinner, Text} from '@primer/react'
import {memo, useCallback, useMemo, useRef} from 'react'
import {graphql, useFragment, usePaginationFragment} from 'react-relay'
import {defaultRangeExtractor} from 'react-virtual'

import {useFilteredFilesContext} from '../../contexts/FilteredFilesContext'
import {useFocusedFileContext} from '../../contexts/FocusedFileContext'
import type {GlobalMarkerNavigationState} from '../../contexts/PullRequestMarkersContext'
import {usePullRequestMarkersContext} from '../../contexts/PullRequestMarkersContext'
import {useHasCommitRange} from '../../contexts/SelectedRefContext'
import {totalStickyHeaderHeight} from '../../helpers/sticky-headers'
import useScrollToAnchoredDiff from '../../hooks/use-scroll-to-anchored-diff'
import type {Diffs_pullRequest$key} from './__generated__/Diffs_pullRequest.graphql'
import type {
  Diffs_pullRequestComparison$data,
  Diffs_pullRequestComparison$key,
} from './__generated__/Diffs_pullRequestComparison.graphql'
import type {Diffs_viewer$key} from './__generated__/Diffs_viewer.graphql'
import Diff from './Diff'

// includes header, padding, and margin
const baseDiffHeight = 75
// This is just the empty line minimum line height + a magical 3
const estimatedLineHeight = 28

// includes the base height along with a placeholder saying we can't show the diff.
const tooLargeDiffHeight = 213

type NonNullableDiff = NonNullable<
  NonNullable<NonNullable<NonNullable<Diffs_pullRequestComparison$data['comparison']>['diffEntries']>['edges']>[number]
>

/**
 * Calculates the height of a diff based on the number of lines and threads.
 *
 * This is an estimate, and we use it to pre-calculate the height of virtual diff placeholders so we get a fairly
 * accurate scroll height before every diff has been rendered.
 *
 * TODO: Remove this on completion of react-virtual upgrade: https://github.com/github/pull-requests/issues/6395
 */
function calculateDiffHeight(diff?: NonNullableDiff['node']) {
  let height = baseDiffHeight
  if (diff?.isCollapsed || diff?.viewerViewedState === 'VIEWED') {
    return height
  }

  if (diff?.isTooBig) {
    return tooLargeDiffHeight
  }

  if (diff?.diffLines) {
    height += diff.diffLines.length * estimatedLineHeight
  }

  return height
}

export interface DiffsProps {
  globalMarkerNavigationState: GlobalMarkerNavigationState
  pullRequest: Diffs_pullRequest$key
  pullRequestComparison: Diffs_pullRequestComparison$key
  pullRequestId: string
  viewer: Diffs_viewer$key
}

const Diffs = memo(function Diffs({
  globalMarkerNavigationState,
  pullRequest,
  pullRequestComparison,
  pullRequestId,
  viewer,
}: DiffsProps) {
  const data = useFragment(
    graphql`
      fragment Diffs_pullRequest on PullRequest {
        ...Diff_pullRequest
      }
    `,
    pullRequest,
  )

  const {
    data: pullRequestComparisonData,
    loadNext: loadNextDiffs,
    isLoadingNext: isLoadingNextDiffs,
    hasNext: hasNextDiffs,
  } = usePaginationFragment(
    graphql`
      fragment Diffs_pullRequestComparison on PullRequest @refetchable(queryName: "DiffsPaginationQuery") {
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          diffEntries(first: $diffEntryCount, after: $diffEntryCursor)
            @connection(key: "Diffs_pullRequest_diffEntries") {
            edges {
              node {
                pathDigest
                # eslint-disable-next-line relay/unused-fields
                path
                isCollapsed
                isTooBig
                pathDigest
                viewerViewedState
                diffLines(injectedContextLines: $injectedContextLines) {
                  __typename
                }
                ...Diff_diffEntry
              }
            }
          }
        }
      }
    `,
    pullRequestComparison,
  )

  const viewerData = useFragment(
    graphql`
      fragment Diffs_viewer on User {
        ...Diff_viewer
      }
    `,
    viewer,
  )

  const diffsParentRef = useRef<HTMLDivElement>(null)

  const handleEndOfDiffsScroll = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadNextDiffs(5)
      }
    },
    [loadNextDiffs],
  )
  const [observeDiffEnd, unobserveDiffEnd] = useIntersectionObserver(handleEndOfDiffsScroll)

  const threadPathDigest = globalMarkerNavigationState.activePathDigest

  const {filteredFileAnchors} = useFilteredFilesContext()
  const commitRangeFilterApplied = useHasCommitRange()

  const diffEntries = useMemo(() => {
    const diffEdges = pullRequestComparisonData.comparison?.diffEntries.edges ?? []
    let entries = sortDiffEntries(diffEdges.map(entry => entry?.node))
    if (filteredFileAnchors) {
      entries = entries.filter(entry => filteredFileAnchors.has(entry.pathDigest))
    }

    return entries
  }, [filteredFileAnchors, pullRequestComparisonData.comparison?.diffEntries.edges])

  const virtualizer = useVirtualWindow<HTMLElement>({
    additionalScrollOffset: -totalStickyHeaderHeight,
    parentRef: diffsParentRef,
    size: diffEntries.length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    estimateSize: useCallback((index: number) => calculateDiffHeight(diffEntries[index]), [diffEntries.length]),
    useVirtualImpl: useVirtualDynamic,
    // inspect the range of materialized items, and ensure that any patch with focus within is materialized
    rangeExtractor(range) {
      const hash = ssrSafeLocation.hash.substring(1)
      const fileDigest = parseDiffHash(hash)
      const focusedPathDigest = document
        .querySelector('[data-path-digest]:focus-within')
        ?.getAttribute('data-path-digest')

      const focusedDiffIndex = diffEntries.findIndex(patch => patch.pathDigest === focusedPathDigest)
      const anchoredThreadIndex = diffEntries.findIndex(patch => patch.pathDigest === threadPathDigest)
      const anchoredDiffIndex = diffEntries.findIndex(patch => fileDigest?.endsWith(patch.pathDigest))

      if (focusedDiffIndex < 0 && anchoredThreadIndex < 0 && anchoredDiffIndex < 0) {
        return defaultRangeExtractor(range)
      }

      const nextRange = new Set([
        ...defaultRangeExtractor(range),
        ...[focusedDiffIndex, anchoredThreadIndex, anchoredDiffIndex].filter(index => index > -1),
      ])
      return Array.from(nextRange).sort((a, b) => a - b)
    },
  })
  const {focusedFileDigest, setFocusedFileDigest} = useFocusedFileContext()

  useScrollToAnchoredDiff(
    loadNextDiffs,
    hasNextDiffs,
    threadPathDigest ?? focusedFileDigest?.digest,
    (anchor: string) => diffEntries.findIndex(entry => anchor.endsWith(entry.pathDigest)),
    (index: number) => virtualizer.scrollToIndex(index, {align: 'start'}),
    () => setFocusedFileDigest({digest: '', isNavigationRequest: false}),
  )

  const canPaginateDiffEntries = hasNextDiffs && !isLoadingNextDiffs

  const paginationTriggerElement = canPaginateDiffEntries ? (
    <ObservableBox role="presentation" onObserve={observeDiffEnd} onUnobserve={unobserveDiffEnd} />
  ) : null

  const {annotationMap} = usePullRequestMarkersContext()

  // Empty state
  // Include the pagination trigger element so we can preemptively paginate in case the filtered files were not yet loaded
  if (diffEntries.length === 0)
    return (
      <Box sx={{p: 3, display: 'flex', justifyContent: 'center'}}>
        <Text sx={{fontWeight: 'bold'}}>There are no files selected for viewing</Text>
        {paginationTriggerElement}
      </Box>
    )

  return (
    <div data-hpc id="hpc-diffs-content">
      <div ref={diffsParentRef}>
        <Box sx={{height: virtualizer.totalSize, width: '100%', position: 'relative'}}>
          {virtualizer.virtualItems.map(virtualRow => {
            const diffEntry = diffEntries[virtualRow.index]
            if (!diffEntry) return null

            return (
              <Box
                key={virtualRow.key}
                ref={virtualRow.measureRef}
                data-key={virtualRow.key}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 3,
                  right: 3,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {/* include a pagination trigger above the 2nd to last diff so we can pre-emptively paginate */}
                {virtualRow.index === diffEntries.length - 2 && paginationTriggerElement}
                <Diff
                  annotations={annotationMap[diffEntry.path]}
                  commitRangeFilterApplied={commitRangeFilterApplied}
                  diffEntry={diffEntry}
                  headerStickyOffset={-virtualRow.start}
                  pullRequest={data}
                  pullRequestId={pullRequestId}
                  viewer={viewerData}
                  activeGlobalMarkerID={
                    globalMarkerNavigationState.activePathDigest === diffEntry.pathDigest
                      ? globalMarkerNavigationState.activeGlobalMarkerID
                      : undefined
                  }
                  shouldFocusHeader={Boolean(
                    focusedFileDigest?.isNavigationRequest && focusedFileDigest?.digest === diffEntry.pathDigest,
                  )}
                />
              </Box>
            )
          })}
        </Box>
      </div>
      {isLoadingNextDiffs ? (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2}}>
          <Spinner size="large" />
        </Box>
      ) : (
        paginationTriggerElement
      )}
    </div>
  )
})

export default Diffs
