import {sendEvent} from '@github-ui/hydro-analytics'
import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {isStaff} from '@github-ui/stats'
import {useNavigate} from '@github-ui/use-navigate'
import {
  ArrowLeftIcon,
  BeakerIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CommentDiscussionIcon,
  HistoryIcon,
  KebabHorizontalIcon,
  PlusIcon,
  ScreenFullIcon,
  TrashIcon,
  XIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Heading, Label} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'

import {COPILOT_PATH, isDocset, isRepository} from '../utils/copilot-chat-helpers'
import type {CopilotChatThread} from '../utils/copilot-chat-types'
import {copilotFeatureFlags} from '../utils/copilot-feature-flags'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import AllTopicsButton from './AllTopicsButton'
import CopilotBadge from './CopilotBadge'
import {ExperimentsDialog} from './ExperimentsDialog'
import {ActionMenuOverlay} from './PortalContainerUtils'

export const HEADER_BUTTON_ID = 'copilot-chat-header-button'

export interface HeaderProps {
  view: 'thread' | 'list'
  experimentsDialogRef: React.MutableRefObject<HTMLDivElement | null>
  showExperimentsDialog: boolean
  setShowExperimentsDialog: (value: boolean) => void
  isImmersive?: boolean
  isCollapsed?: boolean
  isResponding?: boolean
  hasUnreadMessages?: boolean
  startResize?: (e: React.MouseEvent, horizontal: boolean, vertical: boolean) => void
}

export const Header = (props: HeaderProps) => {
  const state = useChatState()
  const manager = useChatManager()
  const thread = manager.getSelectedThread(state)
  const {showTopicPicker, messages} = state

  const handleThreadDelete = useCallback(async () => {
    return thread && manager.deleteThread(thread)
  }, [thread, manager])

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        pl: state.mode === 'immersive' ? 1 : 3,
        borderBottom: state.messages.length > 0 ? '1px solid' : 'none',
        borderColor: 'border.default',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{display: 'flex', flex: 1, minWidth: 0}}>
        {props.view === 'thread' ? (
          !showTopicPicker && !props.isImmersive && messages.length === 0 && !state.chatIsCollapsed ? (
            <AllTopicsButton />
          ) : (
            <Heading
              as="h2"
              sx={{
                fontSize: 1,
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                gap: 2,
                minWidth: 0,
                cursor: copilotFeatureFlags.copilotFloatingButton ? 'default' : 'pointer',
              }}
              // This is an affordance, there is a keyboard-accessible IconButtonWithTooltip that expands the chat below
              onClick={
                props.isCollapsed
                  ? () => manager.expandChat()
                  : copilotFeatureFlags.copilotFloatingButton
                    ? undefined
                    : () => manager.collapseChat()
              }
            >
              {props.view === 'thread' ? (
                <>
                  {(messages.length > 0 || state.chatIsCollapsed) && (
                    <CopilotBadge isLoading={props.isResponding} hasUnreadMessages={props.hasUnreadMessages} />
                  )}

                  {thread?.name ? (
                    <span className="Truncate">
                      {/* Primer tooltips are broken in portals, so we need to use a title here */}
                      {/* eslint-disable-next-line github/a11y-no-title-attribute */}
                      <span className="Truncate-text" title={thread.name}>
                        {thread.name}
                      </span>
                    </span>
                  ) : props.isResponding && state.chatIsCollapsed ? (
                    <span>Responding…</span>
                  ) : state.chatIsCollapsed ? (
                    <span>Ask Copilot</span>
                  ) : (
                    !showTopicPicker && <span>New conversation</span>
                  )}
                </>
              ) : (
                'Copilot'
              )}
            </Heading>
          )
        ) : (
          <ReturnToCurrentThreadButton />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {!props.isCollapsed && (
          <>
            {props.view === 'thread' ? (
              <>
                <IconButtonWithTooltip
                  hidden={messages.length === 0}
                  variant="invisible"
                  icon={PlusIcon}
                  label="New conversation"
                  tooltipDirection="w"
                  onClick={async () => {
                    await manager.createThread()
                  }}
                  sx={{color: 'fg.muted'}}
                />
                <ThreadOptionButton
                  handleDelete={handleThreadDelete}
                  thread={thread}
                  setShowExperimentsDialog={props.setShowExperimentsDialog}
                />
              </>
            ) : (
              <IconButtonWithTooltip
                variant="invisible"
                icon={PlusIcon}
                label="New conversation"
                tooltipDirection="w"
                onClick={async () => {
                  await manager.createThread()
                }}
                sx={{color: 'fg.muted'}}
              />
            )}
          </>
        )}

        {!props.isImmersive && (
          <>
            {!props.isCollapsed && (
              <Box
                sx={{
                  mx: 2,
                  height: '20px',
                  width: '1px',
                  bg: 'border.muted',
                }}
              />
            )}
            {!copilotFeatureFlags.copilotFloatingButton && (
              <IconButtonWithTooltip
                variant="invisible"
                icon={props.isCollapsed ? ChevronUpIcon : ChevronDownIcon}
                label={props.isCollapsed ? 'Expand' : 'Collapse'}
                tooltipDirection="w"
                onClick={() => {
                  setCopilotButtonAriaExpanded(props.isCollapsed)
                  props.isCollapsed ? manager.expandChat() : manager.collapseChat()
                }}
                sx={{color: 'fg.muted'}}
                data-hotkey="Shift+Z"
              />
            )}
            <IconButtonWithTooltip
              variant="invisible"
              icon={XIcon}
              aria-label="Close"
              label="Close Copilot chat"
              tooltipDirection="w"
              onClick={() => {
                setCopilotButtonAriaExpanded(false)
                manager.closeChat(state.chatVisibleSettingPath)
              }}
              sx={{color: 'fg.muted'}}
              data-hotkey="Shift+X"
            />
          </>
        )}
      </Box>
      {props.showExperimentsDialog && (
        <ExperimentsDialog
          experimentsDialogRef={props.experimentsDialogRef}
          onDismiss={() => props.setShowExperimentsDialog(false)}
        />
      )}
    </Box>
  )
}

const ReturnToCurrentThreadButton = () => {
  const {mode} = useChatState()
  const manager = useChatManager()

  return (
    <Button
      leadingVisual={ArrowLeftIcon}
      variant="invisible"
      onClick={() => manager.viewCurrentThread()}
      sx={{color: 'fg.muted', marginLeft: mode === 'assistive' ? '-8px' : undefined}}
    >
      Back
    </Button>
  )
}

interface ThreadOptionButtonProps {
  handleDelete: () => void
  thread?: CopilotChatThread | null
  setShowExperimentsDialog: (value: boolean) => void
}

export const ThreadOptionButton = (props: ThreadOptionButtonProps) => {
  const [open, setOpen] = useState(false)
  const {currentTopic, mode, streamingMessage} = useChatState()
  const {thread} = props
  const navigate = useNavigate()
  const manager = useChatManager()

  const handleClickViewAll = useCallback(() => {
    manager.viewAllThreads()
    sendEvent('copilot.view-conversations-clicked')
  }, [manager])

  const handleSelectDelete = () => {
    props.handleDelete()
    setOpen(false)
  }

  const userIsStaff = useMemo(() => {
    return isStaff()
  }, [])

  const deleteDisabled = !props.thread

  const immersiveURL: string = useMemo(() => {
    if (thread) {
      return `${COPILOT_PATH}/c/${thread.id}`
    } else if (currentTopic && isRepository(currentTopic)) {
      return `${COPILOT_PATH}/r/${currentTopic.ownerLogin}/${currentTopic.name}`
    } else if (currentTopic && isDocset(currentTopic)) {
      return `${COPILOT_PATH}/d/${currentTopic.id}`
    } else {
      return COPILOT_PATH
    }
  }, [thread, currentTopic])

  return (
    <>
      <ActionMenu open={open} onOpenChange={() => setOpen(prev => !prev)}>
        <ActionMenu.Anchor>
          <IconButtonWithTooltip
            icon={KebabHorizontalIcon}
            variant="invisible"
            label="Open conversation options"
            tooltipDirection="sw"
            hideTooltip={open}
            sx={{color: 'fg.muted'}}
          />
        </ActionMenu.Anchor>
        <ActionMenuOverlay>
          <ActionList>
            {mode !== 'immersive' && (
              <ActionList.Item onSelect={() => navigate(immersiveURL)} disabled={!!streamingMessage}>
                <ActionList.LeadingVisual>
                  <ScreenFullIcon />
                </ActionList.LeadingVisual>
                Take conversation to immersive
              </ActionList.Item>
            )}
            <ActionList.Item
              variant={deleteDisabled ? 'default' : 'danger'}
              onSelect={handleSelectDelete}
              disabled={deleteDisabled}
              aria-describedby="delete-conversation-description"
            >
              <ActionList.LeadingVisual>
                <TrashIcon />
              </ActionList.LeadingVisual>
              Delete conversation
              <p id="delete-conversation-description" className="sr-only">
                This is a destructive action that cannot be undone
              </p>
            </ActionList.Item>
            <ActionList.Divider />
            {mode === 'assistive' && (
              <ActionList.Item onSelect={handleClickViewAll}>
                <ActionList.LeadingVisual>
                  <HistoryIcon />
                </ActionList.LeadingVisual>
                View all conversations
              </ActionList.Item>
            )}
            <ActionList.LinkItem
              href="https://gh.io/copilot-enterprise-feedback"
              rel="noopener noreferrer"
              target="_blank"
            >
              <ActionList.LeadingVisual>
                <CommentDiscussionIcon />
              </ActionList.LeadingVisual>
              Give feedback
            </ActionList.LinkItem>
            {userIsStaff && (
              <ActionList.Item onSelect={() => props.setShowExperimentsDialog(true)}>
                <ActionList.LeadingVisual>
                  <BeakerIcon />
                </ActionList.LeadingVisual>
                Configure experiments
                <ActionList.TrailingVisual>
                  <Label variant="attention">Staff</Label>
                </ActionList.TrailingVisual>
              </ActionList.Item>
            )}
          </ActionList>
        </ActionMenuOverlay>
      </ActionMenu>
    </>
  )
}

export function setCopilotButtonAriaExpanded(ariaExpanded?: boolean) {
  const copilotButton = document.getElementById(HEADER_BUTTON_ID)
  // If it is currently collapsed, we are expanding the chat
  copilotButton?.setAttribute('aria-expanded', ariaExpanded ? 'true' : 'false')
}
