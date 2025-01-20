import type {LineRange} from '@github-ui/diff-lines'
import {noop} from '@github-ui/noop'
import {AnchoredOverlay, Box, Spinner} from '@primer/react'
import {type RefObject, useCallback, useEffect, useMemo, useState} from 'react'

import {DialogStateProvider, useDialogStateContext} from '../contexts/DialogStateContext'
import type {
  CommentAuthor,
  CommentingImplementation,
  ConfigureSuggestedChangesImplementation,
  DiffAnnotation,
  MarkerNavigationImplementation,
  Thread,
  ThreadSummary,
} from '../types'
import {AnnotationDialog} from './AnnotationDialog'
import {MarkersListActionMenu} from './MarkersListActionMenu'
import type {ReviewThreadDialogProps} from './ReviewThreadDialog'
import {ReviewThreadDialog} from './ReviewThreadDialog'

export interface MarkersProps
  extends Pick<
    ReviewThreadDialogProps,
    'batchingEnabled' | 'batchPending' | 'repositoryId' | 'subjectId' | 'subject' | 'viewerData'
  > {
  annotations: DiffAnnotation[]
  commentingImplementation: CommentingImplementation
  conversationAnchorRef: RefObject<HTMLElement>
  conversationListAnchorRef: RefObject<HTMLElement>
  conversationListThreads: ThreadSummary[]
  fileAnchor?: string
  filePath: string
  isMarkerListOpen: boolean
  markerNavigationImplementation: MarkerNavigationImplementation
  onCloseConversationDialog: () => void
  onCloseConversationList: () => void
  onThreadSelected: (threadId: string) => void
  onAnnotationSelected: (annotationId: string) => void
  returnFocusRef: RefObject<HTMLElement>
  selectedThreadId?: string | null
  selectedAnnotationId?: string | null
  threadsConnectionId?: string
  suggestedChangesConfig?: ConfigureSuggestedChangesImplementation
  ghostUser?: CommentAuthor
}

export function Markers(props: MarkersProps) {
  return (
    <DialogStateProvider>
      <MarkersInternal {...props} />
    </DialogStateProvider>
  )
}

function MarkersInternal({
  annotations,
  commentingImplementation,
  conversationAnchorRef,
  conversationListAnchorRef,
  conversationListThreads,
  isMarkerListOpen,
  fileAnchor,
  filePath,
  onAnnotationSelected,
  onCloseConversationDialog,
  onCloseConversationList,
  onThreadSelected,
  returnFocusRef,
  selectedAnnotationId,
  selectedThreadId,
  threadsConnectionId,
  markerNavigationImplementation,
  suggestedChangesConfig,
  ghostUser,
  ...rest
}: MarkersProps) {
  const {isDialogOpen} = useDialogStateContext()
  const [selectedThread, setSelectedThread] = useState<Thread | undefined>()
  const {fetchThread} = commentingImplementation

  // Only close the review thread dialog if no descendant dialog is currently open.
  // AnchoredOverlay uses a click handler that closes the overlay when a click occurs outside of the overlay.
  // Descendant dialogs are rendered via a portal, so to the handler they appear outside of the overlay.
  // This means that if a descendant dialog is open, the overlay and the dialog will close when the user clicks on it.
  const handleCloseConversationDialog = useCallback(
    () => !isDialogOpen && onCloseConversationDialog(),
    [isDialogOpen, onCloseConversationDialog],
  )

  const updateSelectedThread = async (threadId: string) => {
    setSelectedThread(undefined)
    const isOutdated = conversationListThreads.find(current => current.id === threadId)?.isOutdated
    const thread = await fetchThread(threadId, isOutdated)
    setSelectedThread(thread)
  }

  const config = useMemo(() => {
    if (
      fileAnchor &&
      selectedThread &&
      selectedThread.subject?.startDiffSide &&
      selectedThread.subject?.endDiffSide &&
      selectedThread.subject?.startLine &&
      selectedThread.subject?.endLine &&
      suggestedChangesConfig?.configureSuggestedChangesFromLineRange
    ) {
      const startLine = selectedThread.subject?.startLine ?? selectedThread?.subject?.endLine
      const startDiffSide = selectedThread.subject?.startDiffSide ?? selectedThread?.subject?.endDiffSide

      const threadRowRange: LineRange = {
        diffAnchor: fileAnchor,
        endLineNumber: selectedThread?.subject?.endLine,
        endOrientation: selectedThread.subject?.endDiffSide === 'LEFT' ? 'left' : 'right',
        startLineNumber: startLine,
        firstSelectedLineNumber: startLine,
        firstSelectedOrientation: startDiffSide === 'LEFT' ? 'left' : 'right',
        startOrientation: startDiffSide === 'LEFT' ? 'left' : 'right',
      }
      return suggestedChangesConfig?.configureSuggestedChangesFromLineRange(threadRowRange)
    }

    return undefined
  }, [fileAnchor, selectedThread, suggestedChangesConfig])

  useEffect(() => {
    if (!selectedThreadId && !!selectedThread) {
      setSelectedThread(undefined)
    } else if (selectedThreadId && selectedThreadId !== selectedThread?.id) {
      updateSelectedThread(selectedThreadId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchThread, selectedThreadId])

  const hasSelectedMarker = selectedThreadId || selectedAnnotationId
  const selectedAnnotation = selectedAnnotationId
    ? annotations.find(annotation => annotation.id === selectedAnnotationId)
    : undefined

  return (
    <>
      {hasSelectedMarker ? (
        <AnchoredOverlay
          align="end"
          anchorRef={conversationAnchorRef}
          focusZoneSettings={{disabled: true}}
          open={true}
          focusTrapSettings={{disabled: true}}
          renderAnchor={null}
          overlayProps={{
            anchorSide: 'outside-right',
            'aria-label': `${selectedThreadId ? 'Pull Request Review Thread' : 'Pull Request Check Annotation'}`,
            id: 'conversation-dialog',
            returnFocusRef,
            role: 'dialog',
            sx: {width: 'clamp(240px, 100vw, 540px)', borderRadius: 2},
            // Prevents default behavior of clicking outside of the overlay auto-closing overlay
            onClickOutside: noop,
            onKeyDown: (event: React.KeyboardEvent) => {
              // Prevent keyboard events from propagating up to the parent elements because their defined `ScopedCommands` component will override comment text area keyboard commands. Only allow "Escape" because this key is bound to closing overlays in Primer.
              // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
              if (event.key !== 'Escape') event.stopPropagation()
            },
          }}
          onClose={handleCloseConversationDialog}
        >
          {selectedThread ? (
            <ReviewThreadDialog
              commentingImplementation={commentingImplementation}
              filePath={filePath}
              thread={selectedThread}
              threads={conversationListThreads}
              threadsConnectionId={threadsConnectionId}
              onClose={handleCloseConversationDialog}
              onThreadSelected={onThreadSelected}
              onRefreshThread={updateSelectedThread}
              markerNavigationImplementation={markerNavigationImplementation}
              suggestedChangesConfig={config}
              ghostUser={ghostUser}
              {...rest}
            />
          ) : selectedAnnotation ? (
            <AnnotationDialog
              annotation={selectedAnnotation}
              markerNavigationImplementation={markerNavigationImplementation}
              onClose={handleCloseConversationDialog}
              ghostUser={ghostUser}
            />
          ) : (
            <Box
              sx={{
                height: '90px',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'fg.muted',
                fontSize: 0,
              }}
            >
              <Spinner />
              <p>Loading comments</p>
            </Box>
          )}
        </AnchoredOverlay>
      ) : (
        isMarkerListOpen && (
          <MarkersListActionMenu
            anchorRef={conversationListAnchorRef}
            annotations={annotations}
            handleOpenChange={onCloseConversationList}
            threads={conversationListThreads}
            onShowCommentThread={onThreadSelected}
            onShowAnnotation={onAnnotationSelected}
            ghostUser={ghostUser}
          />
        )
      )}
    </>
  )
}
