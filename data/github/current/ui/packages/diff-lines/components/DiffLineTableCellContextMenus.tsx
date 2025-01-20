import {CopilotDiffChatContextMenu} from '@github-ui/copilot-code-chat/CopilotDiffChatContextMenu'
import type {CopilotChatFileDiffReferenceData} from '@github-ui/copilot-code-chat/use-file-diff-reference'
import {KeyboardKey} from '@github-ui/keyboard-key'
import {CommandActionListItem} from '@github-ui/ui-commands'
import {
  CommentDiscussionIcon,
  CopyIcon,
  FoldDownIcon,
  FoldUpIcon,
  LinkIcon,
  MoveToBottomIcon,
  MoveToTopIcon,
  MultiSelectIcon,
} from '@primer/octicons-react'
import {ActionList} from '@primer/react'
import {useMemo, type MouseEvent} from 'react'

import {useDiffContext} from '../contexts/DiffContext'
import {useDiffLineContext} from '../contexts/DiffLineContext'
import {useMarkersDialogContext} from '../contexts/MarkersDialogContext'
import {useSelectedDiffRowRangeContext} from '../contexts/SelectedDiffRowRangeContext'
import {threadSummary} from '../helpers/conversation-helpers'
import useExpandHunk from '../hooks/use-expand-hunk'
import type {DiffLine, DiffSide} from '../types'
import {StartConversationContextMenuItems} from './StartConversationContextMenuItems'

type CellContextMenuProps = {
  showStartConversation: boolean
  copilotChatReferenceData?: CopilotChatFileDiffReferenceData
  handleViewMarkersSelection: (markerLoc?: DiffSide) => void
  startConversationCurrentLine: () => void
  startConversationWithSuggestedChange: () => void
}

export function CellContextMenu({
  showStartConversation,
  copilotChatReferenceData,
  handleViewMarkersSelection,
  startConversationCurrentLine,
  startConversationWithSuggestedChange,
}: CellContextMenuProps) {
  return (
    <>
      {showStartConversation && (
        <StartConversationContextMenuItems
          handleStartConversation={startConversationCurrentLine}
          handleStartConversationWithSuggestedChange={startConversationWithSuggestedChange}
        />
      )}
      <ViewMarkerListItems handleViewMarkersSelection={handleViewMarkersSelection} />
      <CopilotListItems copilotChatReferenceData={copilotChatReferenceData} />
      <CopyContentListItems />
      <SelectAllListItem />
      <CommandActionListItem commandId="pull-requests-diff-view:copy-anchor-link" leadingVisual={<LinkIcon />} />
      <ExpandHunksListItems />
      <JumpToHunkListItems />
    </>
  )
}

export function EmptyCellContextMenu() {
  return (
    <>
      <ExpandHunksListItems />
      <SelectAllListItem />
    </>
  )
}

const CopilotListItems: React.FC<{copilotChatReferenceData?: CopilotChatFileDiffReferenceData}> = ({
  copilotChatReferenceData,
}) => {
  const {diffEntryId} = useDiffLineContext()
  const {subjectId: pullRequestId, oldCommitOid, newCommitOid} = useDiffContext()
  const {selectedDiffRowRange} = useSelectedDiffRowRangeContext()

  const props = useMemo(() => {
    // semi-preloaded data
    if (copilotChatReferenceData && pullRequestId && oldCommitOid && newCommitOid) {
      return {
        referenceData: copilotChatReferenceData,
        queryVariables: {pullRequestId, startOid: oldCommitOid, endOid: newCommitOid},
      }
    }

    // query variables for client-side loading
    if (diffEntryId && pullRequestId && oldCommitOid && newCommitOid) {
      return {
        queryVariables: {diffEntryId, pullRequestId, startOid: oldCommitOid, endOid: newCommitOid},
      }
    }
  }, [diffEntryId, newCommitOid, oldCommitOid, pullRequestId, copilotChatReferenceData])

  if (!props) return null

  return <CopilotDiffChatContextMenu selectedRange={selectedDiffRowRange} {...props} />
}

function SelectAllListItem() {
  const {fileAnchor} = useDiffLineContext()

  const handleSelectAllSelection = () => {
    // We need to wait one click for the context menu to close before we allow for the event to occur inside of the table instead of context menu
    setTimeout(() => {
      document
        .querySelector(`table[data-diff-anchor="${fileAnchor}"]`)
        ?.dispatchEvent(new KeyboardEvent('keydown', {key: 'a', code: 'KeyA', ctrlKey: true}))
    })
  }

  return (
    <ActionList.Item onSelect={handleSelectAllSelection}>
      <ActionList.LeadingVisual>
        <MultiSelectIcon />
      </ActionList.LeadingVisual>
      Select all
      <ActionList.TrailingVisual>
        <KeyboardKey keys="Mod+a" />
      </ActionList.TrailingVisual>
    </ActionList.Item>
  )
}

function ViewMarkerListItems({
  handleViewMarkersSelection,
}: {
  handleViewMarkersSelection: (markerLoc?: DiffSide) => void
}) {
  const {commentingEnabled} = useDiffContext()
  const {isSplit} = useDiffLineContext()
  if (!commentingEnabled) return null

  if (!isSplit) {
    return <UnifiedDiffMarkerListItem onSelect={() => handleViewMarkersSelection()} />
  }

  return <SplitDiffMarkersListItems handleViewMarkersSelection={handleViewMarkersSelection} />
}

function SplitDiffMarkersListItems({
  handleViewMarkersSelection,
}: {
  handleViewMarkersSelection: (markerLoc: DiffSide) => void
}) {
  const {originalLineHasThreads, modifiedLineHasThreads, isLeftSide} = useDiffLineContext()
  const {annotations} = useMarkersDialogContext()
  const hasAnnotations = annotations.length > 0
  if (isLeftSide) {
    return (
      <>
        {originalLineHasThreads && (
          <MarkerListItem text="View markers" onSelect={() => handleViewMarkersSelection('LEFT')} />
        )}
        {(modifiedLineHasThreads || hasAnnotations) && (
          <MarkerListItem text="View markers, modified line" onSelect={() => handleViewMarkersSelection('RIGHT')} />
        )}
      </>
    )
  }

  return (
    <>
      {(modifiedLineHasThreads || hasAnnotations) && (
        <MarkerListItem text="View markers" onSelect={() => handleViewMarkersSelection('RIGHT')} />
      )}
      {originalLineHasThreads && (
        <MarkerListItem text="View markers, original line" onSelect={() => handleViewMarkersSelection('LEFT')} />
      )}
    </>
  )
}

function UnifiedDiffMarkerListItem({onSelect}: {onSelect: () => void}) {
  const {ghostUser} = useDiffContext()
  const {diffLine} = useDiffLineContext()
  const line = diffLine as DiffLine
  const {annotations} = useMarkersDialogContext()
  const hasMarkers = (line && threadSummary(line.threadsData, ghostUser).length > 0) || annotations.length > 0
  if (!hasMarkers) return null
  return <MarkerListItem text="View markers" onSelect={() => onSelect()} />
}

function MarkerListItem({onSelect, text}: {onSelect: () => void; text: string}) {
  return (
    <ActionList.Item onSelect={onSelect}>
      <ActionList.LeadingVisual>
        <CommentDiscussionIcon />
      </ActionList.LeadingVisual>
      {text}
    </ActionList.Item>
  )
}

function CopyContentListItems() {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onMouseDown={(event: MouseEvent) => {
        // We need to prevent the window's Selection object from being reset on mouse down if user has selected text.
        // This is to prevent the browser from resetting the selection before onSelect event callback is called.
        if (window.getSelection()?.toString() !== '') event.preventDefault()
      }}
    >
      <CommandActionListItem commandId="pull-requests-diff-view:copy-code" leadingVisual={<CopyIcon />} />
    </div>
  )
}

function ExpandHunksListItems() {
  const {canExpandStartOfHunk, canExpandEndOfHunk} = useExpandHunk()
  return (
    <>
      {canExpandStartOfHunk && (
        <CommandActionListItem commandId="pull-requests-diff-view:expand-hunk-up" leadingVisual={<FoldUpIcon />} />
      )}
      {canExpandEndOfHunk && (
        <CommandActionListItem commandId="pull-requests-diff-view:expand-hunk-down" leadingVisual={<FoldDownIcon />} />
      )}
    </>
  )
}

export function JumpToHunkListItems() {
  const {previousHunk, nextHunk} = useDiffLineContext()
  const {fileAnchor} = useDiffLineContext()

  // We need to ensure these values are not undefined values
  // simply doing a truthy call on these is not adequate as they can return 0, which is falsy in JS
  const hasPreviousHunk = !!previousHunk
  const hasNextHunk = !!nextHunk

  const handleNextHunkSelection = () => {
    // We need to wait one click for the context menu to close before we allow for the event to occur inside of the table instead of context menu
    setTimeout(() => {
      document
        .querySelector(`table[data-diff-anchor="${fileAnchor}"]`)
        ?.dispatchEvent(new KeyboardEvent('keydown', {key: 'PageDown'}))
    })
  }

  const handlePreviousHunkSelection = () => {
    // We need to wait one click for the context menu to close before we allow for the event to occur inside of the table instead of context menu
    setTimeout(() => {
      document
        .querySelector(`table[data-diff-anchor="${fileAnchor}"]`)
        ?.dispatchEvent(new KeyboardEvent('keydown', {key: 'PageUp'}))
    })
  }

  return (
    <>
      {hasNextHunk ? (
        <ActionList.Item aria-keyshortcuts="PageDown" onSelect={handleNextHunkSelection}>
          <ActionList.LeadingVisual>
            <MoveToBottomIcon />
          </ActionList.LeadingVisual>
          Go to next hunk
          <ActionList.TrailingVisual>Page Down</ActionList.TrailingVisual>
        </ActionList.Item>
      ) : null}
      {hasPreviousHunk ? (
        <ActionList.Item aria-keyshortcuts="PageUp" onSelect={handlePreviousHunkSelection}>
          <ActionList.LeadingVisual>
            <MoveToTopIcon />
          </ActionList.LeadingVisual>
          Go to previous hunk
          <ActionList.TrailingVisual>Page Up</ActionList.TrailingVisual>
        </ActionList.Item>
      ) : null}
    </>
  )
}
