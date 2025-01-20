import {CommentBox, type CommentBoxHandle, type CommentBoxProps} from '@github-ui/comment-box/CommentBox'
import {CommentBoxButton} from '@github-ui/comment-box/CommentBoxButton'
import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {IssueClosedIcon, IssueReopenedIcon, SkipIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, ButtonGroup, IconButton, Text} from '@primer/react'
import {forwardRef, useEffect, useMemo, useState} from 'react'
import {flushSync} from 'react-dom'

import {IssueState, IssueStateReason} from '../../api/common-contracts'
import {ItemKeyType} from '../../api/side-panel/contracts'
import {areCharacterKeyShortcutsDisabled} from '../../helpers/keyboard-shortcuts'
import {useApiRequest} from '../../hooks/use-api-request'
import {useSidePanelDirtyState} from '../../hooks/use-side-panel-dirty-state'
import {useIssueContext} from '../../state-providers/issues/use-issue-context'
import {Resources} from '../../strings'
import {useSidePanelMarkdownSubject} from './use-side-panel-markdown-subject'

type MarkdownViewMode = CommentBoxProps['viewMode']

export const SidePanelAddComment = forwardRef<CommentBoxHandle>((_, ref) => {
  const [hasContent, setDirty] = useSidePanelDirtyState()
  const [body, setBody] = useState<string>('')
  const [disabled, setDisabled] = useState(false)
  const [metaAndShiftKeysPressed, setMetaAndShiftKeysPressed] = useState(false)
  useEffect(() => setDirty(body.trim() !== ''), [body, setDirty])

  const [editorViewMode, setEditorViewMode] = useState<MarkdownViewMode>('edit')

  const clear = () => {
    setBody('')
    setEditorViewMode('edit')
    setDisabled(false)
  }

  // handle keyboard shortcuts (unless disabled!)
  // - start a comment with quoted text
  // - submit or reopen issue with or without comment
  useEffect(() => {
    if (areCharacterKeyShortcutsDisabled()) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      const isShortcut = e.key === 'r'
      const currentSelection = window.getSelection()?.toString()
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      const hasModifierKey = e.ctrlKey || e.altKey || e.metaKey || e.shiftKey
      const isInputActive =
        document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLInputElement

      if (isShortcut && currentSelection && !hasModifierKey && !isInputActive) {
        flushSync(() => {
          setBody(currentBody =>
            currentBody.length ? `${currentBody}\n\n> ${currentSelection}\n\n` : `> ${currentSelection}\n\n`,
          )
        })

        if (ref && 'current' in ref) {
          ref?.current?.scrollIntoView()
          ref?.current?.focus()
        }
      }

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      setMetaAndShiftKeysPressed((e.ctrlKey || e.metaKey) && e.shiftKey)
    }

    const handleKeyUp = () => setMetaAndShiftKeysPressed(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [ref])

  const {addIssueComment, sidePanelMetadata, updateSidePanelItemState} = useIssueContext()

  const capabilities = useMemo(() => new Set(sidePanelMetadata.capabilities), [sidePanelMetadata])

  const saveCommentRequest = useApiRequest({
    request: async () => {
      setDisabled(true)
      await addIssueComment(body)
      clear()
    },
    rollback: setBody,
    showErrorToast: true,
  })
  const saveComment = () => hasContent && !disabled && saveCommentRequest.perform(undefined, body)

  const updateStateRequest = useApiRequest({
    request: async ({state, stateReason}: {state: IssueState; stateReason?: IssueStateReason}) => {
      setDisabled(true)
      if (hasContent) {
        await addIssueComment(body, state, stateReason)
      } else {
        await updateSidePanelItemState(state, stateReason)
      }
      clear()
    },
    rollback: setBody,
    showErrorToast: true,
  })
  const updateState = (state: IssueState, stateReason?: IssueStateReason) =>
    !disabled && updateStateRequest.perform({state, stateReason}, body)

  const reopen = capabilities.has('reopen') ? () => updateState(IssueState.Open, IssueStateReason.Reopened) : undefined

  const close = capabilities.has('close')
    ? (stateReason?: IssueStateReason) => updateState(IssueState.Closed, stateReason)
    : undefined

  const subject = useSidePanelMarkdownSubject()

  if (sidePanelMetadata.itemKey.kind !== ItemKeyType.ISSUE) {
    return null
  }

  const onPrimaryActionSaveComment = () => {
    if (metaAndShiftKeysPressed) {
      const issueClosed = sidePanelMetadata.state.state === IssueState.Closed
      return issueClosed ? reopen?.() : close?.()
    }

    saveComment()
  }

  return (
    <CommentBox
      label="Add new comment"
      showLabel={false}
      disabled={disabled}
      value={body}
      onChange={setBody}
      placeholder="Leave a comment"
      subject={subject}
      onPrimaryAction={onPrimaryActionSaveComment}
      viewMode={editorViewMode}
      onChangeViewMode={setEditorViewMode}
      ref={ref}
      sx={{mb: 2, boxShadow: 'shadow.small'}}
      actions={
        <CommentButtons
          disabled={disabled}
          isCommentEmpty={!hasContent}
          currentIssueState={sidePanelMetadata.state.state}
          currentIssueStateReason={sidePanelMetadata.state.stateReason}
          onSaveComment={saveComment}
          onClose={close}
          onReopen={reopen}
        />
      }
      {...testIdProps('markdown-editor')}
    />
  )
})

SidePanelAddComment.displayName = 'SidePanelAddComment'

function getCloseLabel(issueState: IssueState, state: IssueStateReason, hasComment: boolean) {
  if (issueState === IssueState.Open) {
    return hasComment ? Resources.issueButtonLabel.closeWithComment : Resources.issueButtonLabel.closeIssue
  } else if (state === IssueStateReason.NotPlanned) {
    return Resources.issueButtonLabel.closeAsNotPlanned
  }
  return Resources.issueButtonLabel.closeAsCompleted
}

function getReopenLabel(hasComment: boolean) {
  return hasComment ? Resources.issueButtonLabel.reopenWithComment : Resources.issueButtonLabel.reopenIssue
}

const UpdateStateButton: React.FC<{
  selectedStateReason: IssueStateReason
  hasComment: boolean
  disabled?: boolean
  onClose?: (reason?: IssueStateReason) => void
  onReopen?: () => void
  issueState: IssueState
}> = ({selectedStateReason, issueState, onClose, onReopen, hasComment, disabled}) => {
  switch (selectedStateReason) {
    case IssueStateReason.Completed:
      return (
        <Button
          size="small"
          // Omit the state reason from the request when closing an issue as completed.
          onClick={() => onClose?.()}
          leadingVisual={IssueClosedIcon}
          sx={{color: 'done.fg', display: 'inline-block'}}
          disabled={!onClose || disabled}
          {...testIdProps('sidepanel-close-issue-as-completed-button')}
        >
          <Text sx={{color: 'fg.default'}}>{getCloseLabel(issueState, selectedStateReason, hasComment)}</Text>
        </Button>
      )
    case IssueStateReason.Reopened:
      return (
        <Button
          size="small"
          onClick={onReopen}
          leadingVisual={IssueReopenedIcon}
          sx={{color: 'open.fg'}}
          disabled={!onReopen || disabled}
          {...testIdProps('sidepanel-reopen-issue-button')}
        >
          <Text sx={{color: 'fg.default'}}>{getReopenLabel(hasComment)}</Text>
        </Button>
      )
    case IssueStateReason.NotPlanned:
      return (
        <Button
          size="small"
          onClick={() => onClose?.(IssueStateReason.NotPlanned)}
          leadingVisual={SkipIcon}
          sx={{color: 'fg.muted'}}
          disabled={!onClose || disabled}
          {...testIdProps('sidepanel-close-issue-as-not-planned-button')}
        >
          <Text sx={{color: 'fg.default'}}>{getCloseLabel(issueState, selectedStateReason, hasComment)}</Text>
        </Button>
      )
    default:
      return null
  }
}

const UpdateStateButtonOptions: React.FC<{
  selectedStateReason: IssueStateReason
  setSelectedStateReason: (state: IssueStateReason) => void
  issueState: IssueState
  issueStateReason?: IssueStateReason
  canClose: boolean
  canReopen: boolean
}> = ({selectedStateReason, setSelectedStateReason, issueState, issueStateReason, canClose, canReopen}) => {
  const CloseAsCompleted = (
    <ActionList.Item
      key={'close-issue-as-completed-option'}
      onSelect={() => setSelectedStateReason(IssueStateReason.Completed)}
      selected={selectedStateReason === IssueStateReason.Completed}
      disabled={!canClose}
    >
      <ActionList.LeadingVisual sx={{color: 'done.fg'}}>
        <IssueClosedIcon />
      </ActionList.LeadingVisual>
      {Resources.issueButtonLabel.closeAsCompleted}
      <ActionList.Description variant="block">
        {Resources.issueButtonLabel.closeAsCompletedDescription}
      </ActionList.Description>
    </ActionList.Item>
  )

  const CloseAsNotPlanned = (
    <ActionList.Item
      key={'close-issue-as-not-planned-option'}
      onSelect={() => setSelectedStateReason(IssueStateReason.NotPlanned)}
      selected={selectedStateReason === IssueStateReason.NotPlanned}
      disabled={!canClose}
    >
      <ActionList.LeadingVisual>
        <SkipIcon />
      </ActionList.LeadingVisual>
      {Resources.issueButtonLabel.closeAsNotPlanned}
      <ActionList.Description variant="block">
        {Resources.issueButtonLabel.closeAsNotPlannedDescription}
      </ActionList.Description>
    </ActionList.Item>
  )

  const Reopen = (
    <ActionList.Item
      key={'reopen-issue-option'}
      onSelect={() => setSelectedStateReason(IssueStateReason.Reopened)}
      selected={selectedStateReason === IssueStateReason.Reopened}
      disabled={!canReopen}
    >
      <ActionList.LeadingVisual sx={{color: 'open.fg'}}>
        <IssueReopenedIcon />
      </ActionList.LeadingVisual>
      {Resources.issueButtonLabel.reopenIssue}
    </ActionList.Item>
  )

  return (
    <ActionList
      selectionVariant="single"
      role="listbox"
      aria-roledescription="update issue state options menu"
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {issueState === IssueState.Open && (
        <>
          {CloseAsCompleted}
          {CloseAsNotPlanned}
        </>
      )}
      {issueState === IssueState.Closed && (issueStateReason === IssueStateReason.Completed || !issueStateReason) && (
        <>
          {Reopen}
          {CloseAsNotPlanned}
        </>
      )}
      {issueState === IssueState.Closed && issueStateReason === IssueStateReason.NotPlanned && (
        <>
          {Reopen}
          {CloseAsCompleted}
        </>
      )}
    </ActionList>
  )
}

function getDefaultStateReason(issueState: IssueState): IssueStateReason {
  return issueState === IssueState.Open ? IssueStateReason.Completed : IssueStateReason.Reopened
}

const CommentButtons: React.FC<{
  isCommentEmpty: boolean
  onSaveComment: () => void
  currentIssueState: IssueState
  currentIssueStateReason?: IssueStateReason
  disabled?: boolean
  onClose?: (reason?: IssueStateReason) => void
  onReopen?: () => void
}> = ({
  isCommentEmpty,
  onSaveComment: onAddComment,
  currentIssueState,
  currentIssueStateReason,
  disabled,
  onClose,
  onReopen,
}) => {
  const [selectedStateReason, setSelectedStateReason] = useState<IssueStateReason>(
    getDefaultStateReason(currentIssueState),
  )

  // When an issue state or state reason changes, the selected state reason should be updated
  // Use a layout effect to avoid a repaint (flicker) between initial render & state update
  useLayoutEffect(
    () => setSelectedStateReason(getDefaultStateReason(currentIssueState)),
    [currentIssueState, currentIssueStateReason],
  )

  const [closeMenuOpen, setCloseMenuOpen] = useState(false)

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2}}>
      {(onClose || onReopen) && (
        <ButtonGroup sx={{display: 'flex'}}>
          <UpdateStateButton
            disabled={disabled}
            issueState={currentIssueState}
            hasComment={!isCommentEmpty}
            selectedStateReason={selectedStateReason}
            onClose={onClose}
            onReopen={onReopen}
          />
          <ActionMenu open={closeMenuOpen} onOpenChange={setCloseMenuOpen}>
            <ActionMenu.Anchor>
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip
                size="small"
                icon={TriangleDownIcon}
                aria-label={Resources.issueSideButtonMoreOptionsLabel}
              />
            </ActionMenu.Anchor>

            <ActionMenu.Overlay>
              <UpdateStateButtonOptions
                selectedStateReason={selectedStateReason}
                setSelectedStateReason={setSelectedStateReason}
                canClose={onClose !== undefined}
                canReopen={onReopen !== undefined}
                issueState={currentIssueState}
                issueStateReason={currentIssueStateReason}
              />
            </ActionMenu.Overlay>
          </ActionMenu>
        </ButtonGroup>
      )}
      <CommentBoxButton
        variant="primary"
        className="prc-Button--primary"
        disabled={isCommentEmpty || disabled}
        onClick={onAddComment}
        {...testIdProps(`add-comment-button`)}
      >
        Comment
      </CommentBoxButton>
    </Box>
  )
}
