import {IconButtonWithTooltip} from '@github-ui/icon-button-with-tooltip'
import {DiffIgnoredIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Octicon} from '@primer/react'

import {getSlashCommands, SLASH_COMMAND_PREFIX} from '../utils/copilot-slash-commands'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {ActionMenuOverlay} from './PortalContainerUtils'

interface ThreadActionMenuProps {
  isLoading?: boolean
  returnFocusRef: React.RefObject<HTMLElement>
}

export function ThreadActionMenu(props: ThreadActionMenuProps) {
  const state = useChatState()
  const manager = useChatManager()
  const slashCommands = getSlashCommands({manager})

  return (
    <>
      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButtonWithTooltip
            icon={DiffIgnoredIcon}
            size="small"
            variant="invisible"
            aria-label="Thread actions"
            disabled={props.isLoading}
            aria-disabled={props.isLoading}
            label="Thread actions"
          />
        </ActionMenu.Anchor>
        <ActionMenuOverlay width="medium" anchorSide="outside-top">
          <ActionList>
            {slashCommands
              .filter(slashCommand => !slashCommand.requiresParams)
              .map(slashCommand => (
                <ActionList.Item key={slashCommand.command} onSelect={() => slashCommand.action('', state)}>
                  <ActionList.LeadingVisual>
                    <Octicon icon={slashCommand.icon} />
                  </ActionList.LeadingVisual>
                  <span className="text-normal">{slashCommand.label}</span>
                  <ActionList.Description variant="inline">
                    {SLASH_COMMAND_PREFIX}
                    {slashCommand.command}
                  </ActionList.Description>
                </ActionList.Item>
              ))}
          </ActionList>
        </ActionMenuOverlay>
      </ActionMenu>
    </>
  )
}
