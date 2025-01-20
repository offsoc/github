import {PlusIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, ButtonGroup, IconButton, useRefObjectAsForwardedRef} from '@primer/react'
import type {RefObject} from 'react'
import {forwardRef, useCallback, useRef} from 'react'

import {useDiffContext} from '../contexts/DiffContext'
import {useDiffLineContext} from '../contexts/DiffLineContext'
import {useActionBarDialogs} from '../hooks/use-action-bar-dialogs'
import {useActionBarFocus} from '../hooks/use-action-bar-focus'
import type {DiffLine, CopilotChatFileDiffReferenceData} from '../types'
import CommentIndicator from './CommentIndicator'
import {CellContextMenu} from './DiffLineTableCellContextMenus'
import {InProgressCommentIndicator} from './InProgressCommentIndicator'

const actionBarPosition: React.CSSProperties = {position: 'absolute', right: '-16px', top: '0px', zIndex: 2}
/**
 * The ActionBar is a set of buttons that appears on hover or focus of a cell in the diff grid.
 * The buttons will be absolutely positioned to the right side of the diff cell.
 */
type ActionBarProps = {
  authorLogin: string
  authorAvatarUrl: string
  cellRef: RefObject<HTMLTableCellElement>
  showStartConversation: boolean
  cellId?: string
  hasDraftComment?: boolean
  copilotChatReferenceData?: CopilotChatFileDiffReferenceData
}

const actionBarButtonSize = '24px'
const startConversationButtonWidth = '30px'

export const ActionBar = forwardRef(function ActionBar(
  {
    authorAvatarUrl,
    authorLogin,
    cellId,
    cellRef,
    showStartConversation,
    hasDraftComment,
    copilotChatReferenceData,
  }: ActionBarProps,
  dialogReturnFocusRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const viewConversationButtonRef = useRef<HTMLButtonElement>(null)
  const startConversationButtonRef = useRef<HTMLButtonElement>(null)
  const {commentingEnabled} = useDiffContext()
  const {diffLine, isRowSelected} = useDiffLineContext()
  const line = diffLine as DiffLine

  const contextMenuRef = useRef<HTMLButtonElement>(null)

  // When there are no markers, return focus back to start conversation button
  const returnFocusToRef = viewConversationButtonRef.current ? viewConversationButtonRef : startConversationButtonRef

  useRefObjectAsForwardedRef(dialogReturnFocusRef, returnFocusToRef)

  const totalCommentsCount = line.threadsData?.totalCommentsCount || 0
  const totalAnnotationsCount = line.annotationsData?.totalCount || 0
  const totalCommentsAndAnnotationsCount = totalCommentsCount + totalAnnotationsCount

  const hasThreads = totalCommentsAndAnnotationsCount > 0

  const {isActionBarFocused, handleActionBarBlur, handleActionBarFocusCapture, handleActionBarKeydownCapture} =
    useActionBarFocus({cellRef})

  const {
    annotations,
    isContextMenuOpen,
    openMarkerOrListDialogFromActionBar,
    startNewConversationFromActionBar,
    startNewConversationFromActionBarWithSuggestedChange,
    anyMenuOpen,
    threads,
    toggleContextMenu,
    toggleContextMenuFromActionBar,
  } = useActionBarDialogs({
    cellId,
    actionBarRef: contextMenuRef,
  })

  const handleActionBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isRowSelected) e.preventDefault()
    },
    [isRowSelected],
  )

  return (
    <div aria-hidden={!isActionBarFocused} style={{...actionBarPosition}} className="d-flex flex-row">
      <ButtonGroup
        onBlur={handleActionBarBlur}
        onClick={handleActionBarClick}
        onFocusCapture={handleActionBarFocusCapture}
        onKeyDownCapture={handleActionBarKeydownCapture}
      >
        {commentingEnabled && (
          <>
            {hasThreads && (
              <Button
                ref={viewConversationButtonRef}
                aria-expanded={anyMenuOpen}
                aria-label="View conversations"
                size="small"
                sx={{pt: 0, pb: 0, px: 1, height: actionBarButtonSize}}
                onClick={event => {
                  // if there's a single thread or annotation, prevent default so we don't select the cell.
                  // we'll let the conversation selection logic handle selecting the cell(s) associated to the comment.
                  if (threads.length === 1 || annotations.length === 1) {
                    event.preventDefault()
                  }

                  openMarkerOrListDialogFromActionBar()
                }}
              >
                <CommentIndicator />
              </Button>
            )}
            {showStartConversation && (
              <>
                {hasDraftComment ? (
                  <Button
                    aria-label="Start conversation (comment in progress)"
                    size="small"
                    sx={{pt: 0, pb: 0, px: 1, width: startConversationButtonWidth, height: actionBarButtonSize}}
                    onClick={startNewConversationFromActionBar}
                  >
                    <InProgressCommentIndicator authorAvatarUrl={authorAvatarUrl} authorLogin={authorLogin} />
                  </Button>
                ) : (
                  // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
                  <IconButton
                    unsafeDisableTooltip={true}
                    aria-label="Start conversation"
                    ref={startConversationButtonRef}
                    icon={PlusIcon}
                    size="small"
                    sx={{width: startConversationButtonWidth, height: actionBarButtonSize, color: 'fg.muted'}}
                    onClick={startNewConversationFromActionBar}
                  />
                )}
              </>
            )}
          </>
        )}
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          ref={contextMenuRef}
          aria-haspopup="true"
          aria-label="More actions"
          icon={TriangleDownIcon}
          size="small"
          sx={{width: actionBarButtonSize, height: actionBarButtonSize, color: 'fg.muted'}}
          onClick={toggleContextMenuFromActionBar}
        />
        <ActionMenu anchorRef={contextMenuRef} open={isContextMenuOpen} onOpenChange={toggleContextMenu}>
          <ActionMenu.Overlay width="medium">
            <ActionList>
              <CellContextMenu
                copilotChatReferenceData={copilotChatReferenceData}
                showStartConversation={showStartConversation}
                handleViewMarkersSelection={openMarkerOrListDialogFromActionBar}
                startConversationCurrentLine={startNewConversationFromActionBar}
                startConversationWithSuggestedChange={startNewConversationFromActionBarWithSuggestedChange}
              />
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </ButtonGroup>
    </div>
  )
})

ActionBar.displayName = 'ActionBar'
