import {DiffPlaceholder} from '@github-ui/diffs/DiffParts'
import {Box} from '@primer/react'
import {memo, useCallback, useEffect, useMemo, useRef} from 'react'
import {graphql, useFragment} from 'react-relay'

import {usePullRequestMarkersContext} from '../../contexts/PullRequestMarkersContext'
import {useHasCommitRange} from '../../contexts/SelectedRefContext'
import type {DiffAnnotationsByEndLineMap} from '../../helpers/annotation-helpers'
import {totalStickyHeaderHeight} from '../../helpers/sticky-headers'
import useInjectedContextLines from '../../hooks/use-injected-context-range'
import {usePullRequestAnalytics} from '../../hooks/use-pull-request-analytics'
import useRelayState from '../../hooks/use-relay-state'
import type {Diff_diffEntry$key} from './__generated__/Diff_diffEntry.graphql'
import type {Diff_pullRequest$key} from './__generated__/Diff_pullRequest.graphql'
import type {Diff_viewer$key} from './__generated__/Diff_viewer.graphql'
import DiffFileHeaderListView from './diff-file-header-list-view/DiffFileHeaderListView'
import DiffLines from './DiffLines'

/**
 * Adjusts the scroll position when the diff is collapsed to ensure it stays in view
 */
function adjustScrollPositionOnCollapse(diff: HTMLDivElement) {
  const {top: diffTop} = diff.getBoundingClientRect()

  // move the vertical scroll bar up by the amount of the diff that wasn't visible
  // this makes it appear to the user as if their position in the files changed list hasn't changed.
  const offset = diffTop - totalStickyHeaderHeight

  // if the header is NOT sticky, don't scroll
  if (offset > 0) return
  window.scrollTo(0, window.scrollY + offset)
}

interface DiffProps {
  annotations?: DiffAnnotationsByEndLineMap
  headerStickyOffset?: number
  diffEntry: Diff_diffEntry$key
  pullRequest: Diff_pullRequest$key
  pullRequestId: string
  viewer: Diff_viewer$key
  commitRangeFilterApplied: boolean
  activeGlobalMarkerID: string | undefined
  shouldFocusHeader: boolean
}

const listDiffView = 'ListDiffView'

const Diff = memo(function Diff({
  annotations,
  headerStickyOffset,
  diffEntry,
  pullRequest,
  pullRequestId,
  viewer,
  commitRangeFilterApplied,
  activeGlobalMarkerID,
  shouldFocusHeader,
}: DiffProps) {
  const diffEntryData = useFragment(
    graphql`
      fragment Diff_diffEntry on PullRequestDiffEntry {
        diffEntryId: id
        isCollapsed
        isBinary
        isTooBig
        linesChanged
        pathDigest
        viewerViewedState
        path
        pathDigest
        status
        truncatedReason
        # eslint-disable-next-line relay/unused-fields
        oldTreeEntry {
          mode
          lineCount
        }
        # eslint-disable-next-line relay/unused-fields
        newTreeEntry {
          mode
          lineCount
          isGenerated
        }
        diffLines(injectedContextLines: $injectedContextLines) {
          blobLineNumber
        }
        diffLinesManuallyExpandedListDiffView
        diffLinesManuallyUnhidden
        hasInjectedContextLinesListDiffView
        # eslint-disable-next-line relay/unused-fields
        injectedContextLinesListDiffView {
          start
          end
        }
        newTreeEntry {
          lineCount
        }
        ...DiffFileHeaderListView_diffEntry
        ...DiffLines_diffEntry
      }
    `,
    diffEntry,
  )

  const pullRequestData = useFragment(
    graphql`
      fragment Diff_pullRequest on PullRequest {
        ...DiffFileHeaderListView_pullRequest
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          oldCommit {
            oid
          }
          newCommit {
            oid
          }
        }
      }
    `,
    pullRequest,
  )

  const viewerData = useFragment(
    graphql`
      fragment Diff_viewer on User {
        ...DiffFileHeaderListView_viewer
        ...DiffLines_viewer
      }
    `,
    viewer,
  )

  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()
  const {addInjectedContextLines, clearInjectedContextLines} = useInjectedContextLines()
  const hasCommitRange = useHasCommitRange()

  const diffRef = useRef<HTMLDivElement>(null)
  const fileLinkRef = useRef<HTMLAnchorElement>(null)

  const injectedRanges = diffEntryData.injectedContextLinesListDiffView

  // Required to ensure we update the relay store when in Single File View (SFV).
  // If file is 'viewed' in SFV, it should be collapsed in Files Changed view.
  const [isCollapsed, setIsCollapsed] = useRelayState({
    objectId: diffEntryData.diffEntryId,
    fieldName: 'isCollapsed',
    currentValue: diffEntryData.isCollapsed,
    defaultValue: !hasCommitRange ? diffEntryData.viewerViewedState === 'VIEWED' : false,
  })

  // Required to ensure we update the relay store with explicit Files Changed View (FCV) changes.
  const [diffLinesManuallyExpanded, setExpanded] = useRelayState({
    objectId: diffEntryData.diffEntryId,
    fieldName: 'diffLinesManuallyExpandedListDiffView',
    currentValue: !!diffEntryData.diffLinesManuallyExpandedListDiffView,
    defaultValue: false,
  })

  const canExpandOrCollapseLines = useMemo(() => {
    const hasInjectedContextDiffLines = diffEntryData.hasInjectedContextLinesListDiffView

    if (hasInjectedContextDiffLines) return true

    const firstDiffLineNumber = diffEntryData.diffLines?.[0]?.blobLineNumber || 0

    if (firstDiffLineNumber > 1) return true

    const initialDiffLineCount = diffEntryData.diffLines?.length || 0
    const lastDiffLineNumber = diffEntryData.diffLines?.[initialDiffLineCount - 1]?.blobLineNumber || 0
    const fileLineCount = diffEntryData.newTreeEntry?.lineCount || 0

    if (lastDiffLineNumber < fileLineCount) return true

    return false
  }, [
    diffEntryData.hasInjectedContextLinesListDiffView,
    diffEntryData.diffLines,
    diffEntryData.newTreeEntry?.lineCount,
  ])

  const diffMetadata = useMemo(
    () => ({
      isBinary: diffEntryData.isBinary,
      isTooBig: diffEntryData.isTooBig,
      linesChanged: diffEntryData.linesChanged,
      path: diffEntryData.path,
      pathDigest: diffEntryData.pathDigest,
      newTreeEntry: diffEntryData.newTreeEntry,
      newCommitOid: pullRequestData.comparison?.newCommit.oid as string,
      objectId: diffEntryData.diffEntryId,
      oldTreeEntry: diffEntryData.oldTreeEntry,
      oldCommitOid: pullRequestData.comparison?.oldCommit.oid as string,
      status: diffEntryData.status,
      truncatedReason: diffEntryData.truncatedReason,
    }),
    [
      diffEntryData.diffEntryId,
      diffEntryData.isBinary,
      diffEntryData.isTooBig,
      diffEntryData.linesChanged,
      diffEntryData.newTreeEntry,
      diffEntryData.oldTreeEntry,
      diffEntryData.path,
      diffEntryData.pathDigest,
      diffEntryData.status,
      diffEntryData.truncatedReason,
      pullRequestData.comparison,
    ],
  )

  function expandAllDifflines() {
    addInjectedContextLines(
      diffEntryData.diffEntryId,
      {start: 0, end: diffEntryData.newTreeEntry?.lineCount || 0},
      listDiffView,
    )
    setExpanded(true)
    sendPullRequestAnalyticsEvent('file_entry.expand_all', 'FILE_EXPANDER_BUTTON')
  }

  function collapseAllDifflines() {
    clearInjectedContextLines(diffEntryData.diffEntryId, listDiffView)
    setExpanded(false)
    sendPullRequestAnalyticsEvent('file_entry.collapse_all', 'FILE_COLLAPSE_BUTTON')
  }

  function handleToggleExpandAllLines() {
    if (diffLinesManuallyExpanded) {
      collapseAllDifflines()
    } else {
      expandAllDifflines()
    }
  }

  function handleToggleFileCollapsedClick() {
    const newCollapsedValue = !isCollapsed
    if (newCollapsedValue && diffRef.current) adjustScrollPositionOnCollapse(diffRef.current)
    setIsCollapsed(newCollapsedValue)
    sendPullRequestAnalyticsEvent('file_entry.collapse_file', 'FILE_CHEVRON')
  }

  const {onActivateGlobalMarkerNavigation} = usePullRequestMarkersContext()

  const [diffLinesManuallyUnhidden, setDiffLinesManuallyUnhidden] = useRelayState({
    objectId: diffEntryData.diffEntryId,
    fieldName: 'diffLinesManuallyUnhidden',
    currentValue: !!diffEntryData.diffLinesManuallyUnhidden,
    defaultValue: false,
  })
  const handleLoadDiff = useCallback(() => setDiffLinesManuallyUnhidden(true), [setDiffLinesManuallyUnhidden])

  useEffect(() => {
    if (shouldFocusHeader) {
      fileLinkRef.current?.focus()
    }
  }, [shouldFocusHeader, diffRef, diffEntryData])

  return (
    <Box
      key={diffEntryData.diffEntryId}
      ref={diffRef}
      data-ignore-sticky-scroll
      data-path-digest={diffEntryData.pathDigest}
      data-testid="diff-file"
      id={`diff-${diffEntryData.pathDigest}`}
      sx={{
        mb: 4,
        position: 'relative',
      }}
    >
      <DiffFileHeaderListView
        activeGlobalMarkerID={activeGlobalMarkerID}
        canExpandOrCollapseLines={canExpandOrCollapseLines}
        commitRangeFilterApplied={commitRangeFilterApplied}
        diffEntry={diffEntryData}
        diffLinesManuallyExpanded={diffLinesManuallyExpanded}
        fileLinkRef={fileLinkRef}
        headerStickyOffset={headerStickyOffset}
        isCollapsed={!!isCollapsed}
        pullRequest={pullRequestData}
        pullRequestId={pullRequestId}
        viewer={viewerData}
        onActivateGlobalMarkerNavigation={onActivateGlobalMarkerNavigation}
        onToggleExpandAllLines={handleToggleExpandAllLines}
        onToggleFileCollapsed={handleToggleFileCollapsedClick}
      />
      {!isCollapsed && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'border.default',
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
          }}
        >
          <DiffLines
            activeGlobalMarkerID={activeGlobalMarkerID}
            annotations={annotations}
            diffEntry={diffEntryData}
            diffLinesManuallyUnhidden={diffLinesManuallyUnhidden}
            diffMetadata={diffMetadata}
            injectedRanges={injectedRanges}
            viewer={viewerData}
            onHandleLoadDiff={handleLoadDiff}
          />
        </Box>
      )}
      <DiffPlaceholder />
    </Box>
  )
})

export default Diff
