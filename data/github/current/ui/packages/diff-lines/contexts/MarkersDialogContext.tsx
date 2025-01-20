import type {DiffAnnotation, ThreadSummary} from '@github-ui/conversations'
import type {PropsWithChildren} from 'react'
import {createContext, useCallback, useContext, useMemo, useState} from 'react'
import {ensurePreviousActiveDialogIsClosed} from '@github-ui/conversations/ensure-previous-active-dialog-is-closed'

import {threadSummary} from '../helpers/conversation-helpers'
import {useDiffLineContext} from './DiffLineContext'
import {useDiffContext} from './DiffContext'
import type {DiffSide, DiffLine, CommentAuthor} from '../types'
import {notEmpty} from '../helpers/not-empty'

type MarkersDialogContextData = {
  annotations: DiffAnnotation[]
  isActionBarVisible: boolean
  showActionBar: () => void
  hideActionBar: () => void
  openDialog: (dialog: DialogType, cellId?: string | undefined, opts?: {withSuggestedChange?: boolean}) => void
  closeDialog: (dialog: DialogType) => void
  selectedThreadId?: string
  selectThreadId: (threadId?: string) => void
  selectedAnnotationId?: string
  selectAnnotationId: (annotationId?: string) => void
  threads: ThreadSummary[]
  threadConnectionId?: string
  updateVisibleThreads: (diffSide?: DiffSide) => ThreadSummary[] | undefined
  anyMenuOpen: boolean
  openContextMenuCell?: string
  openMarkersListCell?: string
  openMarkerDetailsCell?: string
  openNewConversationCell?: {cellId: string | undefined; withSuggestedChange?: boolean}
}

const THREAD = 'thread'
const ANNOTATION = 'annotation'
type SelectedMarker = {
  id: string
  kind: typeof THREAD | typeof ANNOTATION
}

const MarkersDialogContext = createContext<MarkersDialogContextData | null>(null)
type DialogType = 'new-conversation' | 'marker-details' | 'marker-list' | 'context-menu'
type ThreadInfo = {
  threads: ThreadSummary[]
  threadConnectionId?: string
}

/**
 * Manages the state of thread, comment, and annotation dialogs for a line in a diff
 */
export function MarkersDialogContextProvider({children, line}: PropsWithChildren<{line: DiffLine}>) {
  // Tracks the state of the action bar visibility for this row
  const [isActionBarVisible, setIsActionBarVisible] = useState(false)
  // Tracks which dialogs are open
  const [openContextMenuCell, setOpenContextMenuCell] = useState<string | undefined>()
  const [openMarkersListCell, setOpenMarkersListCell] = useState<string | undefined>()
  const [openMarkerDetailsCell, seOpenMarkerDetailsCell] = useState<string | undefined>()
  const [openNewConversationCell, setOpenNewConversationCell] = useState<
    {cellId: string | undefined; withSuggestedChange?: boolean} | undefined
  >()

  // The selected "marker" that represents what entity is open in a dialog on a line
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>()

  const {ghostUser} = useDiffContext()
  // Information about what other threads exist on that line
  const {originalLineThreads, modifiedLineThreads, originalLineThreadsConnectionId, modifiedLineThreadsConnectionId} =
    useDiffLineContext()
  const [sideWithOpenThreads, setSideWithOpenThreads] = useState<DiffSide>()
  const {threads, threadConnectionId} = getThreadsForSide({
    line,
    side: sideWithOpenThreads,
    originalLineThreads,
    modifiedLineThreads,
    originalLineThreadsConnectionId,
    modifiedLineThreadsConnectionId,
    ghostUser,
  })

  const anyMenuOpen = useMemo(
    () => !!openContextMenuCell || !!openMarkersListCell || !!openMarkerDetailsCell || !!openNewConversationCell,
    [openContextMenuCell, openMarkerDetailsCell, openMarkersListCell, openNewConversationCell],
  )

  const showActionBar = useCallback(() => {
    setIsActionBarVisible(true)
  }, [])

  const hideActionBar = useCallback(() => {
    setIsActionBarVisible(false)
  }, [])

  const selectThreadId = useCallback((threadId?: string) => {
    if (threadId) {
      setSelectedMarker({id: threadId, kind: THREAD})
    } else {
      setSelectedMarker(undefined)
    }
  }, [])

  const selectedThreadId = selectedMarker?.kind === THREAD ? selectedMarker.id : undefined

  const selectedAnnotationId = selectedMarker?.kind === ANNOTATION ? selectedMarker.id : undefined
  const selectAnnotationId = useCallback((annotationId?: string) => {
    if (annotationId) {
      setSelectedMarker({id: annotationId, kind: ANNOTATION})
    } else {
      setSelectedMarker(undefined)
    }
  }, [])

  const openDialog = useCallback((dialog: DialogType, cellId?: string, opts?: {withSuggestedChange?: boolean}) => {
    // We currently allow for Dialogs to be open while a user moves and clicks around the diff now.
    // This ensures we close active dialogs before opening up a new dialog
    ensurePreviousActiveDialogIsClosed()
    switch (dialog) {
      case 'context-menu':
        setOpenContextMenuCell(cellId)
        setOpenNewConversationCell(undefined)
        seOpenMarkerDetailsCell(undefined)
        setOpenMarkersListCell(undefined)
        break
      case 'new-conversation':
        setOpenNewConversationCell({cellId, withSuggestedChange: opts?.withSuggestedChange})
        setOpenContextMenuCell(undefined)
        seOpenMarkerDetailsCell(undefined)
        setOpenMarkersListCell(undefined)
        break
      case 'marker-details':
        seOpenMarkerDetailsCell(cellId)
        setOpenContextMenuCell(undefined)
        setOpenMarkersListCell(undefined)
        setOpenNewConversationCell(undefined)
        break
      case 'marker-list':
        setOpenMarkersListCell(cellId)
        setOpenContextMenuCell(undefined)
        setOpenNewConversationCell(undefined)
        seOpenMarkerDetailsCell(undefined)
        break
      default:
        break
    }
  }, [])

  const closeDialog = useCallback((dialog: DialogType) => {
    switch (dialog) {
      case 'context-menu':
        setOpenContextMenuCell(undefined)
        break
      case 'new-conversation':
        setOpenNewConversationCell(undefined)
        break
      case 'marker-details':
        seOpenMarkerDetailsCell(undefined)
        break
      case 'marker-list':
        setOpenMarkersListCell(undefined)
        break
      default:
        break
    }
  }, [])

  const updateVisibleThreads = useCallback(
    (diffSide?: DiffSide) => {
      setSideWithOpenThreads(diffSide)
      return getThreadsForSide({
        line,
        side: diffSide,
        modifiedLineThreads,
        modifiedLineThreadsConnectionId,
        originalLineThreads,
        originalLineThreadsConnectionId,
        ghostUser,
      }).threads
    },
    [
      line,
      modifiedLineThreads,
      modifiedLineThreadsConnectionId,
      originalLineThreads,
      originalLineThreadsConnectionId,
      ghostUser,
    ],
  )

  const annotations = useMemo(
    () => line.annotationsData?.annotations?.filter(notEmpty) ?? [],
    [line.annotationsData?.annotations],
  )

  const contextData = useMemo(
    () => ({
      annotations,
      isActionBarVisible,
      showActionBar,
      hideActionBar,
      selectThreadId,
      selectAnnotationId,
      closeDialog,
      openDialog,
      anyMenuOpen,
      selectedThreadId,
      selectedAnnotationId,
      openContextMenuCell,
      openMarkersListCell,
      openMarkerDetailsCell,
      openNewConversationCell,
      threads,
      updateVisibleThreads,
      threadConnectionId,
    }),
    [
      annotations,
      isActionBarVisible,
      showActionBar,
      hideActionBar,
      selectThreadId,
      selectAnnotationId,
      closeDialog,
      openDialog,
      anyMenuOpen,
      selectedThreadId,
      selectedAnnotationId,
      openContextMenuCell,
      openMarkersListCell,
      openMarkerDetailsCell,
      openNewConversationCell,
      threads,
      threadConnectionId,
      updateVisibleThreads,
    ],
  )

  return <MarkersDialogContext.Provider value={contextData}>{children}</MarkersDialogContext.Provider>
}

/**
 * Get data related to managing the dialog states for a line in a diff
 */
export function useMarkersDialogContext(): MarkersDialogContextData {
  const contextData = useContext(MarkersDialogContext)
  if (!contextData) {
    throw new Error('useMarkersDialogContext must be used within a MarkersDialogContextProvider')
  }

  return contextData
}

function getThreadsForSide({
  line,
  side,
  originalLineThreads,
  modifiedLineThreads,
  originalLineThreadsConnectionId,
  modifiedLineThreadsConnectionId,
  ghostUser,
}: {
  line: DiffLine
  side?: DiffSide
  originalLineThreads?: ThreadSummary[]
  modifiedLineThreads?: ThreadSummary[]
  originalLineThreadsConnectionId?: string
  modifiedLineThreadsConnectionId?: string
  ghostUser?: CommentAuthor
}): ThreadInfo {
  switch (side) {
    case 'LEFT': {
      return {
        threads: originalLineThreads || [],
        threadConnectionId: originalLineThreadsConnectionId,
      }
    }
    case 'RIGHT': {
      return {
        threads: modifiedLineThreads || [],
        threadConnectionId: modifiedLineThreadsConnectionId,
      }
    }
    case undefined: {
      return {
        threads: threadSummary(line.threadsData, ghostUser),
        threadConnectionId: line.threadsData?.__id,
      }
    }
    default: {
      return {threads: [], threadConnectionId: undefined}
    }
  }
}
