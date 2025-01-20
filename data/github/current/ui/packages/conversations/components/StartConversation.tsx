import {noop} from '@github-ui/noop'
import {useAnalytics} from '@github-ui/use-analytics'
import {AnchoredOverlay} from '@primer/react'
import {type RefObject, useMemo} from 'react'

import type {ConfigureSuggestedChangesImplementation} from '../types'
import type {StartThreadCommentProps} from './StartThreadComment'
import {StartThreadComment} from './StartThreadComment'

export interface StartConversationProps
  extends Pick<
    StartThreadCommentProps,
    | 'addCommentDialogTitle'
    | 'batchPending'
    | 'batchingEnabled'
    | 'commentBoxConfig'
    | 'fileLevelComment'
    | 'filePath'
    | 'isLeftSide'
    | 'lineNumber'
    | 'onAddComment'
    | 'repositoryId'
    | 'subjectId'
    | 'viewerData'
    | 'threadsConnectionId'
  > {
  align?: 'start' | 'end'
  anchorRef: RefObject<HTMLElement>
  isOpen: boolean
  onCloseCommentDialog: () => void
  returnFocusRef: RefObject<HTMLElement>
  suggestedChangesConfig?: ConfigureSuggestedChangesImplementation
}

/**
 * Renders a modal AnchoredOverlay for starting a new conversation thread
 */
export function StartConversation({
  align = 'end',
  anchorRef,
  isOpen,
  returnFocusRef,
  onCloseCommentDialog,
  suggestedChangesConfig,
  ...rest
}: StartConversationProps) {
  const {sendAnalyticsEvent} = useAnalytics()

  const config = useMemo(() => {
    if (isOpen && suggestedChangesConfig?.configureSuggestedChangesFromLineRange) {
      return suggestedChangesConfig.configureSuggestedChangesFromLineRange(
        suggestedChangesConfig?.selectedDiffRowRange,
        suggestedChangesConfig?.shouldStartNewConversationWithSuggestedChange,
      )
    }
    return undefined
  }, [isOpen, suggestedChangesConfig])

  if (!isOpen) return null

  return (
    <AnchoredOverlay
      align={align}
      anchorRef={anchorRef}
      focusZoneSettings={{disabled: true}}
      open={isOpen}
      renderAnchor={null}
      focusTrapSettings={{disabled: true}}
      overlayProps={{
        id: 'conversation-dialog',
        role: 'dialog',
        width: 'xlarge',
        returnFocusRef,
        sx: {
          borderRadius: 2,
        },
        'aria-label': 'Add a comment',
        // Prevents default behavior of clicking outside of the overlay auto-closing overlay
        onClickOutside: noop,
        onKeyDown: (event: React.KeyboardEvent) => {
          // Prevent keyboard events from propagating up to the parent elements because their defined `ScopedCommands` component will override comment text area keyboard commands. Only allow "Escape" because this key is bound to closing overlays in Primer.
          // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
          if (event.key !== 'Escape') event.stopPropagation()
        },
      }}
      onClose={onCloseCommentDialog}
    >
      <StartThreadComment
        onClose={() => {
          onCloseCommentDialog()
          sendAnalyticsEvent('comments.cancel_thread_reply', 'CANCEL_REVIEW_THREAD_BUTTON')
        }}
        suggestedChangesConfig={config}
        {...rest}
      />
    </AnchoredOverlay>
  )
}
