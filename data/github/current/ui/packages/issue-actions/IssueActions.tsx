// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {IssueClosedIcon, IssueReopenedIcon, SkipIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, ButtonGroup, IconButton, Text, Tooltip} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useState} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import type {IssueActions$key} from './__generated__/IssueActions.graphql'
import type {IssueActionsState$key, IssueState, IssueStateReason} from './__generated__/IssueActionsState.graphql'
import {BUTTON_LABELS} from './constants/button-labels'
import {ERRORS} from './constants/errors'
import {LABELS} from './constants/labels'
import type {IssueClosedStateReason} from './mutations/__generated__/updateIssueStateMutationCloseMutation.graphql'
import {commitCloseIssueMutation, commitReopenIssueMutation} from './mutations/update-issue-state-mutation'

export type CloseButtonState = 'CLOSED' | 'OPEN' | 'NOT_PLANNED'

type IssueActionsBaseProps = {
  onAction: () => void
  hasComment: boolean
  buttonSize?: 'small' | 'medium'
  closeButtonState: CloseButtonState
  setCloseButtonState: (state: CloseButtonState) => void
  viewerCanReopen?: boolean
  viewerCanClose?: boolean
}

type InternalIssueActionsProps = IssueActionsBaseProps & {
  actionStateRef: IssueActionsState$key
  buttonSize?: 'small' | 'medium'
}

type IssueActionsProps = IssueActionsBaseProps & {
  actionRef: IssueActions$key
}

export function IssueActions({actionRef, ...rest}: IssueActionsProps) {
  const action = useFragment(
    graphql`
      fragment IssueActions on Issue {
        ...IssueActionsState
      }
    `,
    actionRef,
  )

  return <IssueActionsInternal actionStateRef={action} {...rest} />
}

function IssueActionsInternal({
  actionStateRef,
  onAction,
  hasComment,
  viewerCanClose,
  viewerCanReopen,
  buttonSize,
  closeButtonState,
  setCloseButtonState,
}: InternalIssueActionsProps) {
  const {addToast} = useToastContext()
  const data = useFragment(
    graphql`
      fragment IssueActionsState on Issue {
        state
        stateReason
        id
      }
    `,
    actionStateRef,
  )

  const environment = useRelayEnvironment()

  const closeIssue = useCallback(
    (newStateReason: IssueClosedStateReason) => {
      if (data && data.id) {
        return commitCloseIssueMutation({
          environment,
          input: {
            issueId: data.id,
            newStateReason,
          },
          onError: () =>
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: ERRORS.couldNotCloseIssue,
            }),
        })
      }
    },
    [data, environment, addToast],
  )

  const reopenIssue = useCallback(() => {
    if (data.id) {
      commitReopenIssueMutation({
        environment,
        input: {
          issueId: data.id,
        },
        onError: () =>
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotReOpenIssue,
          }),
      })
    }
  }, [data, environment, addToast])

  useEffect(
    () => setCloseButtonState(getInitialButtonState(data.state)),
    [data.state, data.stateReason, data.id, setCloseButtonState],
  )
  const [open, setOpen] = useState(false)

  const viewerCanChange = data.state === 'OPEN' ? viewerCanClose : viewerCanReopen

  return (
    <>
      <ButtonGroup sx={{display: 'flex', justifyContent: 'flex-end'}}>
        <UpdateStateButton
          issueState={data.state}
          buttonState={closeButtonState}
          onClose={closeIssue}
          onReopen={reopenIssue}
          onAction={onAction}
          hasComment={hasComment}
          size={buttonSize}
          viewerCanReopen={viewerCanReopen}
          viewerCanClose={viewerCanClose}
        />
        <ActionMenu open={open} onOpenChange={setOpen}>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={TriangleDownIcon}
              aria-label={LABELS.moreOptions}
              size={buttonSize}
              disabled={!viewerCanChange}
            />
          </ActionMenu.Anchor>

          <ActionMenu.Overlay width="medium">
            <UpdateStateButtonOptions
              buttonState={closeButtonState}
              setButtonState={setCloseButtonState}
              canClose={closeIssue !== undefined}
              canReopen={reopenIssue !== undefined}
              viewerCanClose={viewerCanClose}
              viewerCanReopen={viewerCanReopen}
              issueState={data.state}
              issueStateReason={data.stateReason}
            />
          </ActionMenu.Overlay>
        </ActionMenu>
      </ButtonGroup>
    </>
  )
}

type UpdateStatusButtonProps = {
  issueState: IssueState
  buttonState: CloseButtonState
  onClose?: (reason: IssueClosedStateReason) => void
  onReopen?: () => void
  onAction?: () => void
  hasComment: boolean
  size?: 'small' | 'medium'
  viewerCanReopen?: boolean
  viewerCanClose?: boolean
}

const UpdateStateButton: React.FC<UpdateStatusButtonProps> = ({
  issueState,
  buttonState,
  onClose,
  onReopen,
  onAction,
  hasComment = false,
  size = 'medium',
  viewerCanReopen,
  viewerCanClose,
}: UpdateStatusButtonProps) => {
  if (issueState !== 'OPEN' && issueState !== 'CLOSED') {
    // This shouldn't happen.  Should this throw?
    return null
  }

  const reason = getReason(issueState, buttonState)
  const viewerCanPerformAction = getViewerCanPerformAction(issueState, buttonState, viewerCanReopen, viewerCanClose)
  const onStateChange = getOnStateChange(issueState, buttonState, reason, onClose, onReopen)

  return createUpdateStatusButton(hasComment, issueState, reason, onAction, onStateChange, viewerCanPerformAction, size)
}

type UpdateStateButtonOptionsProps = {
  buttonState: CloseButtonState
  setButtonState: (state: CloseButtonState) => void
  issueState: IssueState
  issueStateReason: IssueStateReason | null | undefined
  canClose: boolean
  canReopen: boolean
  viewerCanClose?: boolean
  viewerCanReopen?: boolean
}

const UpdateStateButtonOptions: React.FC<UpdateStateButtonOptionsProps> = ({
  buttonState,
  setButtonState,
  issueState,
  issueStateReason,
  canClose,
  canReopen,
  viewerCanClose,
  viewerCanReopen,
}: UpdateStateButtonOptionsProps) => (
  <ActionList
    showDividers
    selectionVariant="single"
    aria-roledescription={LABELS.updateIssueRoleDescription}
    sx={{
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {issueState === 'CLOSED' && (viewerCanReopen || viewerCanReopen === undefined) && (
      <ActionList.Item
        key={'reopen-issue-option'}
        onSelect={() => setButtonState('OPEN')}
        selected={buttonState === 'OPEN'}
        disabled={!canReopen || !viewerCanReopen}
      >
        <ActionList.LeadingVisual sx={{color: 'open.fg'}}>
          <IssueReopenedIcon />
        </ActionList.LeadingVisual>
        {LABELS.reOpenIssue}
      </ActionList.Item>
    )}
    {(issueState === 'OPEN' || issueStateReason === 'NOT_PLANNED') &&
      (viewerCanClose || viewerCanClose === undefined) && (
        <ActionList.Item
          key={'close-issue-option'}
          onSelect={() => setButtonState('CLOSED')}
          selected={buttonState === 'CLOSED'}
          disabled={!canClose || !viewerCanClose}
        >
          <ActionList.LeadingVisual sx={{color: 'done.fg'}}>
            <IssueClosedIcon />
          </ActionList.LeadingVisual>
          {LABELS.closeAsCompleted}
          <ActionList.Description variant="block">{LABELS.actionListCompletedDescription}</ActionList.Description>
        </ActionList.Item>
      )}
    {(issueState === 'OPEN' || (issueState === 'CLOSED' && issueStateReason !== 'NOT_PLANNED')) && viewerCanClose && (
      <ActionList.Item
        key={'skip-issue-option'}
        onSelect={() => setButtonState('NOT_PLANNED')}
        selected={buttonState === 'NOT_PLANNED'}
        disabled={!canClose}
      >
        <ActionList.LeadingVisual>
          <SkipIcon />
        </ActionList.LeadingVisual>
        {LABELS.closeAsNotPlanned}
        <ActionList.Description variant="block">{LABELS.actionListNotPlannedDescription}</ActionList.Description>
      </ActionList.Item>
    )}
  </ActionList>
)

const getInitialButtonState = (state: IssueState) => {
  return state === 'CLOSED' ? 'OPEN' : 'CLOSED'
}

function createUpdateStatusButton(
  hasComment: boolean,
  issueState: IssueState,
  reason?: IssueClosedStateReason,
  onAction?: () => void,
  onStateChange?: () => void,
  viewerCanPerformAction?: boolean,
  size?: 'small' | 'medium',
) {
  const color = getColorForReason(reason)
  const icon = getIconForReason(reason)
  const label = getLabelForReason(issueState, hasComment, reason)
  const tooltipText = getTooltipTextForReason(reason)
  const tooltipId = getTooltipIdForReason(reason)

  const button = (
    <Button
      onClick={() => {
        onAction?.()
        onStateChange?.()
      }}
      leadingVisual={icon}
      sx={{color}}
      disabled={!onStateChange || !viewerCanPerformAction}
      size={size}
    >
      <Text sx={{color: 'fg.default'}}>{label}</Text>
    </Button>
  )

  return viewerCanPerformAction ? (
    button
  ) : (
    <Tooltip text={tooltipText} direction="w" data-testid={tooltipId}>
      {button}
    </Tooltip>
  )
}

function getTooltipIdForReason(reason?: IssueClosedStateReason) {
  if (reason) {
    return 'close-button-tooltip'
  }
  return 'reopen-button-tooltip'
}

function getTooltipTextForReason(reason?: IssueClosedStateReason) {
  if (reason) {
    return ERRORS.missingClosePermission
  }
  return ERRORS.missingReopenPermission
}

function getColorForReason(reason?: IssueClosedStateReason) {
  switch (reason) {
    case 'COMPLETED':
      return 'done.fg'
    case 'NOT_PLANNED':
      return 'fg.muted'
    case undefined:
      return 'open.fg'
    default:
      return 'fg.default'
  }
}

function getIconForReason(reason?: IssueClosedStateReason) {
  switch (reason) {
    case 'COMPLETED':
      return IssueClosedIcon
    case 'NOT_PLANNED':
      return SkipIcon
    case undefined:
      return IssueReopenedIcon
    default:
      return IssueClosedIcon
  }
}

function getLabelForReason(issueState: IssueState, hasComment: boolean, reason?: IssueClosedStateReason) {
  if (issueState === 'OPEN') {
    return hasComment ? BUTTON_LABELS.closeIssueWithComment : BUTTON_LABELS.closeIssue
  }
  if (reason === 'NOT_PLANNED') {
    return BUTTON_LABELS.closeIssueNotPlanned
  }
  if (reason === undefined) {
    return LABELS.reOpenIssue
  }
  return BUTTON_LABELS.closeIssueCompleted
}

function getReason(issueState: IssueState, buttonState: CloseButtonState) {
  if (buttonState === 'NOT_PLANNED') {
    return 'NOT_PLANNED'
  }
  if (issueState === 'OPEN') {
    return 'COMPLETED'
  }
  if (buttonState === 'CLOSED') {
    return 'COMPLETED'
  }

  return undefined
}

function getViewerCanPerformAction(
  issueState: IssueState,
  buttonState: CloseButtonState,
  viewerCanReopen: boolean | undefined,
  viewerCanClose: boolean | undefined,
) {
  return issueState === 'CLOSED' && buttonState === 'OPEN' ? viewerCanReopen : viewerCanClose
}

function getOnStateChange(
  issueState: IssueState,
  buttonState: CloseButtonState,
  reason?: IssueClosedStateReason,
  onClose?: (reason: IssueClosedStateReason) => void,
  onReopen?: () => void,
) {
  return issueState === 'CLOSED' && buttonState === 'OPEN' ? () => onReopen?.() : () => reason && onClose?.(reason)
}
