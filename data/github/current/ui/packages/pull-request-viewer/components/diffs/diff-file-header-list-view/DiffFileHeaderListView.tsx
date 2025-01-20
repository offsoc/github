import {DiffFileHeader} from '@github-ui/diff-file-header'
import {Box} from '@primer/react'
import type {MouseEvent} from 'react'
import {memo, useCallback} from 'react'
import {graphql, useFragment} from 'react-relay'

import {updateURLHash} from '../../../helpers/document-hash-helpers'
import {fileStickyHeaderMargin} from '../../../helpers/sticky-headers'
import {usePullRequestAnalytics} from '../../../hooks/use-pull-request-analytics'
import ViewedCheckbox from '../ViewedCheckbox'
import type {
  DiffFileHeaderListView_diffEntry$data,
  DiffFileHeaderListView_diffEntry$key,
} from './__generated__/DiffFileHeaderListView_diffEntry.graphql'
import type {DiffFileHeaderListView_pullRequest$key} from './__generated__/DiffFileHeaderListView_pullRequest.graphql'
import type {DiffFileHeaderListView_viewer$key} from './__generated__/DiffFileHeaderListView_viewer.graphql'
import BlobActionsMenu from './BlobActionsMenu'
import CodeownersBadge from './CodeownersBadge'
import FileConversationsButton from './FileConversationsButton'

type PathInfo = {oldPath?: string; newPath?: string}

export interface DiffFileHeaderListViewProps {
  canExpandOrCollapseLines: boolean
  headerStickyOffset?: number
  isCollapsed: boolean
  diffEntry: DiffFileHeaderListView_diffEntry$key
  diffLinesManuallyExpanded: boolean
  pullRequest: DiffFileHeaderListView_pullRequest$key
  pullRequestId: string
  viewer: DiffFileHeaderListView_viewer$key
  fileLinkRef?: React.RefObject<HTMLAnchorElement>
  commitRangeFilterApplied: boolean
  onToggleExpandAllLines: () => void
  onToggleFileCollapsed: () => void
  activeGlobalMarkerID: string | undefined
  onActivateGlobalMarkerNavigation: () => void
}

const DiffFileHeaderListView = memo(function DiffFileHeaderListView({
  canExpandOrCollapseLines,
  headerStickyOffset = 0,
  isCollapsed,
  diffEntry,
  diffLinesManuallyExpanded,
  pullRequest,
  pullRequestId,
  viewer,
  fileLinkRef,
  onToggleExpandAllLines,
  onToggleFileCollapsed,
  commitRangeFilterApplied,
  activeGlobalMarkerID,
  onActivateGlobalMarkerNavigation,
}: DiffFileHeaderListViewProps) {
  const pullRequestData = useFragment(
    graphql`
      fragment DiffFileHeaderListView_pullRequest on PullRequest {
        ...BlobActionsMenu_pullRequest
      }
    `,
    pullRequest,
  )

  const diffEntryData: DiffFileHeaderListView_diffEntry$data = useFragment(
    graphql`
      fragment DiffFileHeaderListView_diffEntry on PullRequestDiffEntry {
        pathDigest
        path
        pathOwnership {
          ...CodeownersBadge_pathOwnership
        }
        oldTreeEntry {
          mode
          path
        }
        newTreeEntry {
          mode
          path
        }
        status
        linesAdded
        linesDeleted
        ...BlobActionsMenu_diffEntry
        ...FileConversationsButton_diffEntry
        ...ViewedCheckbox_diffEntry
      }
    `,
    diffEntry,
  )

  const viewerData = useFragment(
    graphql`
      fragment DiffFileHeaderListView_viewer on User {
        ...CodeownersBadge_viewer
        ...FileConversationsButton_viewer
      }
    `,
    viewer,
  )

  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()

  const pathInfo: PathInfo = {}
  if (diffEntryData.oldTreeEntry?.path) pathInfo.oldPath = diffEntryData.oldTreeEntry.path
  if (diffEntryData.newTreeEntry?.path) pathInfo.newPath = diffEntryData.newTreeEntry.path

  function handleHeaderClick(e: MouseEvent<HTMLElement>) {
    if (isCollapsed) onToggleFileCollapsed()

    e.preventDefault()
    updateURLHash(`diff-${diffEntryData.pathDigest}`)
  }

  const handleViewedStateChange = useCallback(
    (newViewedValue: boolean) => {
      // collapse the file if it's marked as viewed, uncollapse if it's marked as unviewed
      if (newViewedValue !== isCollapsed) onToggleFileCollapsed()
    },
    [isCollapsed, onToggleFileCollapsed],
  )

  return (
    <Box
      sx={{
        position: 'sticky',
        top: fileStickyHeaderMargin(headerStickyOffset),
        zIndex: 11,
        // backgroundColor, pl, pr, ml, mr values are being used here to hide the actionbar element behind right side of the DiffFileHeaderListView
        // when it intersects with the DiffFileHeaderListView on the right side of the DiffEntry
        backgroundColor: 'canvas.default',
        // :before is used to cover up scrolling content behind the sticky header rounded corners
        // it also needs to go beyond the parent border to cover box shadow from the parent
        '&::before': {
          bg: 'canvas.default',
          content: '""',
          position: 'absolute',
          display: 'block',
          height: '100%',
          width: 'calc(100% + 30px)', // Would be set to 32px but we need to offset the left border to address resizable sidebar
          ml: '-14px', // Need to use a magic variable to make sure negative margin does not overlap with resizable sidebar from the navigation
          mr: -3,
        },
      }}
    >
      <DiffFileHeader
        additionalLeftSideContent={<CodeownersBadge pathOwnership={diffEntryData.pathOwnership} viewer={viewerData} />}
        areLinesExpanded={diffLinesManuallyExpanded}
        canExpandOrCollapseLines={canExpandOrCollapseLines}
        canToggleRichDiff={false}
        fileLinkHref={`#diff-${diffEntryData.pathDigest}`}
        fileLinkRef={fileLinkRef}
        isCollapsed={isCollapsed}
        linesAdded={diffEntryData.linesAdded}
        linesDeleted={diffEntryData.linesDeleted}
        newMode={diffEntryData.newTreeEntry?.mode}
        newPath={diffEntryData.newTreeEntry?.path}
        oldMode={diffEntryData.oldTreeEntry?.mode}
        oldPath={diffEntryData.oldTreeEntry?.path}
        patchStatus={diffEntryData.status}
        path={diffEntryData.path}
        rightSideContent={
          <>
            {!commitRangeFilterApplied && (
              <>
                <FileConversationsButton
                  activeGlobalMarkerID={activeGlobalMarkerID}
                  diffEntry={diffEntryData}
                  viewer={viewerData}
                  onActivateGlobalMarkerNavigation={onActivateGlobalMarkerNavigation}
                />
                <ViewedCheckbox
                  diffEntry={diffEntryData}
                  pullRequestId={pullRequestId}
                  onChange={handleViewedStateChange}
                />
              </>
            )}
            <Box sx={{ml: 1}}>
              <BlobActionsMenu diffEntry={diffEntryData} pullRequest={pullRequestData} />
            </Box>
          </>
        }
        onCopyPath={() => sendPullRequestAnalyticsEvent('file_entry.copy_path', 'COPY_TO_CLIPBOARD_BUTTON')}
        onHeaderClick={handleHeaderClick}
        onToggleExpandAllLines={onToggleExpandAllLines}
        onToggleFileCollapsed={onToggleFileCollapsed}
      />
    </Box>
  )
})

export default DiffFileHeaderListView
