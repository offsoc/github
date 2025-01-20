import type {RefObject} from 'react'
import {useCallback, useMemo, useState} from 'react'

import {useMarkersDialogContext} from '../contexts/MarkersDialogContext'
import type {DiffSide} from '../types'
import type {DiffAnnotation, ThreadSummary} from '@github-ui/conversations'
import {useSelectedDiffRowRangeContext} from '../contexts/SelectedDiffRowRangeContext'
import {useDiffLineContext} from '../contexts/DiffLineContext'
import {useStableCallback} from './use-stable-callback'
import {useAnalytics} from '@github-ui/use-analytics'

type ActionBarDialogs = {
  // New conversation
  isNewConversationDialogOpen: boolean
  startNewConversation: () => void
  startNewConversationWithSuggestedChange: () => void
  startNewConversationFromActionBarWithSuggestedChange: () => void
  startNewConversationFromActionBar: () => void
  closeNewConversationDialog: () => void
  shouldStartNewConversationWithSuggestedChange: boolean | undefined

  // Context menus
  isContextMenuOpen: boolean
  openContextMenu: () => void
  openContextMenuFromActionBar: () => void
  closeContextMenu: () => void
  toggleContextMenu: () => void
  toggleContextMenuFromActionBar: () => void

  // view conversation details
  optimizedSelectedThreadId: string | undefined
  optimizedSelectedAnnotationId: string | undefined
  selectThread: (threadId: string, opts?: {skipLineSelection?: boolean}) => void
  selectAnnotation: (annotationId: string, opts?: {skipLineSelection?: boolean}) => void
  openMarkerDetailsDialog: () => void
  closeConversationDetailsDialog: () => void

  // view conversation list
  isMarkerListDialogOpen: boolean
  openMarkerListDialog: () => void
  closeMarkerListDialog: () => void

  // interaction between list and details
  openMarkerOrListDialogFromActionBar: () => void
  openMarkerOrListDialog: (side?: DiffSide) => void

  // Misc
  annotations: DiffAnnotation[]
  returnFocusRef: RefObject<HTMLElement>
  threads: ThreadSummary[]
  threadConnectionId?: string
  anyMenuOpen: boolean
}

export function useActionBarDialogs({
  cellId,
  actionBarRef,
}: {
  cellId?: string
  actionBarRef: RefObject<HTMLElement>
}): ActionBarDialogs {
  const {replaceSelectedDiffRowRange} = useSelectedDiffRowRangeContext()
  const {fileAnchor} = useDiffLineContext()

  const [returnFocusRef, setReturnFocusRef] = useState<RefObject<HTMLElement>>(actionBarRef)
  const {
    annotations,
    openDialog,
    closeDialog,
    selectedAnnotationId,
    selectAnnotationId,
    selectedThreadId,
    selectThreadId,
    openContextMenuCell,
    openNewConversationCell,
    openMarkerDetailsCell,
    openMarkersListCell,
    updateVisibleThreads,
    threads,
    threadConnectionId,
    anyMenuOpen,
  } = useMarkersDialogContext()

  const {sendAnalyticsEvent} = useAnalytics()

  const isNewConversationDialogOpen = useMemo(
    () => openNewConversationCell?.cellId === cellId,
    [cellId, openNewConversationCell],
  )

  const shouldStartNewConversationWithSuggestedChange = useMemo(
    () => openNewConversationCell?.withSuggestedChange,
    [openNewConversationCell],
  )

  // Internal
  const openNewConversationDialog = useCallback(
    (opts?: {withSuggestedChange?: boolean}) => {
      openDialog('new-conversation', cellId, opts)
    },
    [cellId, openDialog],
  )

  const startNewConversation = useCallback(() => {
    openNewConversationDialog()
  }, [openNewConversationDialog])

  const startNewConversationFromActionBar = useCallback(() => {
    setReturnFocusRef(actionBarRef)
    openNewConversationDialog()
    sendAnalyticsEvent('diff.start_new_conversation', 'PLUS_ICON')
  }, [actionBarRef, openNewConversationDialog, sendAnalyticsEvent])

  const startNewConversationWithSuggestedChange = useCallback(() => {
    openNewConversationDialog({withSuggestedChange: true})
    sendAnalyticsEvent('diff.start_new_conversation_with_suggested_change', 'CELL_CONTEXT_MENU')
  }, [openNewConversationDialog, sendAnalyticsEvent])

  const startNewConversationFromActionBarWithSuggestedChange = useCallback(() => {
    setReturnFocusRef(actionBarRef)
    openNewConversationDialog({withSuggestedChange: true})
    sendAnalyticsEvent('diff.start_new_conversation_with_suggested_change', 'ACTION_BAR_CONTEXT_MENU')
  }, [actionBarRef, openNewConversationDialog, sendAnalyticsEvent])

  const closeNewConversationDialog = useCallback(() => {
    closeDialog('new-conversation')
  }, [closeDialog])

  // Context menus
  const isContextMenuOpen = useMemo(() => openContextMenuCell === cellId, [cellId, openContextMenuCell])

  const openContextMenu = useCallback(() => {
    openDialog('context-menu', cellId)
  }, [cellId, openDialog])

  const openContextMenuFromActionBar = useCallback(() => {
    setReturnFocusRef(actionBarRef)
    openContextMenu()
  }, [actionBarRef, openContextMenu])

  const closeContextMenu = useCallback(() => {
    closeDialog('context-menu')
  }, [closeDialog])

  const toggleContextMenu = useCallback(() => {
    isContextMenuOpen ? closeContextMenu() : openContextMenu()
  }, [closeContextMenu, isContextMenuOpen, openContextMenu])

  const toggleContextMenuFromActionBar = useCallback(() => {
    setReturnFocusRef(actionBarRef)
    toggleContextMenu()
  }, [actionBarRef, toggleContextMenu])

  // Viewing conversation details

  // Only pass the selected thread if the cell is open to prevent unnecessary re-renders
  const optimizedSelectedThreadId = useMemo(
    () => (openMarkerDetailsCell === cellId ? selectedThreadId : undefined),
    [cellId, openMarkerDetailsCell, selectedThreadId],
  )

  // Only pass the selected annotation if the cell is open to prevent unnecessary re-renders
  const optimizedSelectedAnnotationId = useMemo(
    () => (openMarkerDetailsCell === cellId ? selectedAnnotationId : undefined),
    [cellId, openMarkerDetailsCell, selectedAnnotationId],
  )

  const openMarkerDetailsDialog = useCallback(() => {
    openDialog('marker-details', cellId)
  }, [cellId, openDialog])

  const closeConversationDetailsDialog = useCallback(() => {
    closeDialog('marker-details')
  }, [closeDialog])

  const selectThread = useStableCallback(
    (threadId: string, opts: {skipLineSelection?: boolean} = {skipLineSelection: false}) => {
      selectThreadId(threadId)
      openMarkerDetailsDialog()

      if (opts.skipLineSelection) return

      // select the line(s) the comment was made on
      const thread = threads.find(t => t.id === threadId)
      if (thread && thread.diffSide && thread.line) {
        const startLine = thread.startLine ?? thread.line
        const startDiffSide = thread.startDiffSide ?? thread.diffSide
        replaceSelectedDiffRowRange({
          diffAnchor: fileAnchor,
          endLineNumber: thread.line,
          endOrientation: thread.diffSide === 'LEFT' ? 'left' : 'right',
          startLineNumber: startLine,
          startOrientation: startDiffSide === 'LEFT' ? 'left' : 'right',
          firstSelectedLineNumber: startLine,
          firstSelectedOrientation: startDiffSide === 'LEFT' ? 'left' : 'right',
        })
      }
    },
  )

  const selectAnnotation = useStableCallback(
    (annotationId: string, opts: {skipLineSelection?: boolean} = {skipLineSelection: false}) => {
      selectAnnotationId(annotationId)
      openMarkerDetailsDialog()

      if (opts.skipLineSelection) return

      // select the line(s) the annotation was made on
      const annotation = annotations.find(a => a.id === annotationId)
      if (annotation) {
        replaceSelectedDiffRowRange({
          diffAnchor: fileAnchor,
          endLineNumber: annotation.location.end.line,
          endOrientation: 'right',
          startLineNumber: annotation.location.start.line,
          startOrientation: 'right',
          firstSelectedLineNumber: annotation.location.start.line,
          firstSelectedOrientation: 'right',
        })
      }
    },
  )

  // Viewing the conversation list
  const openMarkerListDialog = useCallback(() => {
    openDialog('marker-list', cellId)
  }, [cellId, openDialog])

  const closeMarkerListDialog = useCallback(() => {
    closeDialog('marker-list')
  }, [closeDialog])

  // Interaction between conversation list and conversation details
  const openConversationOrList = useCallback(
    (diffSide?: DiffSide) => {
      const newThreads = updateVisibleThreads(diffSide)
      if (!newThreads?.length && !annotations.length) return

      const firstThread = newThreads && newThreads[0]
      const isOnlyThread = newThreads && newThreads.length === 1 && firstThread && !annotations.length
      const firstAnnotation = annotations[0]
      const isOnlyAnnotation = annotations.length === 1 && firstAnnotation && !newThreads?.length

      if (isOnlyThread) {
        selectThread(firstThread.id)
      } else if (isOnlyAnnotation) {
        selectAnnotation(firstAnnotation.id)
      } else {
        openMarkerListDialog()
      }
    },
    [annotations, openMarkerListDialog, selectAnnotation, selectThread, updateVisibleThreads],
  )

  const openMarkerOrListDialogFromActionBar = useCallback(
    (diffSide?: DiffSide) => {
      openConversationOrList(diffSide)
      setReturnFocusRef(actionBarRef)
    },
    [actionBarRef, openConversationOrList],
  )

  const openMarkerOrListDialog = useCallback(
    (diffSide?: DiffSide) => {
      openConversationOrList(diffSide)
    },
    [openConversationOrList],
  )

  return {
    // New conversation
    isNewConversationDialogOpen,
    startNewConversation,
    startNewConversationFromActionBar,
    closeNewConversationDialog,
    startNewConversationWithSuggestedChange,
    startNewConversationFromActionBarWithSuggestedChange,
    shouldStartNewConversationWithSuggestedChange,

    // Context menus
    isContextMenuOpen,
    openContextMenu,
    openContextMenuFromActionBar,
    closeContextMenu,
    toggleContextMenu,
    toggleContextMenuFromActionBar,

    // view conversation details
    optimizedSelectedThreadId,
    optimizedSelectedAnnotationId,
    selectThread,
    selectAnnotation,
    openMarkerDetailsDialog,
    closeConversationDetailsDialog,

    // view conversation list
    isMarkerListDialogOpen: openMarkersListCell === cellId,
    openMarkerListDialog,
    closeMarkerListDialog,

    // interaction between list and details
    openMarkerOrListDialogFromActionBar,
    openMarkerOrListDialog,

    annotations,
    returnFocusRef,
    threadConnectionId,
    threads,
    anyMenuOpen,
  }
}
