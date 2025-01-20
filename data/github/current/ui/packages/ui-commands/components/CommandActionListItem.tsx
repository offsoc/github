import type {ActionListItemProps} from '@primer/react'
import {ActionList} from '@primer/react'
import {forwardRef} from 'react'

import {type CommandId, getCommandMetadata} from '../commands'
import {useCommandsContext} from '../commands-context'
import {CommandKeybindingHint} from './CommandKeybindingHint'

export interface CommandActionListItemProps extends Omit<ActionListItemProps, 'onClick'> {
  commandId: CommandId
  /** If `children` is not provided, the item will render the command name by default. */
  children?: ActionListItemProps['children']
  /**
   * Set the item description (components that wrap Primer components can't use the composable APIs, so this is
   * required instead of `ActionList.Description`).
   */
  description?: React.ReactNode
  /**
   * Set the leading visual (components that wrap Primer components can't use the composable APIs, so this is
   * required instead of `ActionList.LeadingVisual`).
   */
  leadingVisual?: React.ReactNode
  /**
   * Override the trailing visual (components that wrap Primer components can't use the composable APIs, so this is
   * required instead of `ActionList.TrailingVisual`).
   *
   * By default, if a keybinding is configured for the command, this will be a visual keybinding hint. To disable this
   * without providing an alternative, set `trailingVisual` to `null`.
   */
  trailingVisual?: React.ReactNode
}

/**
 * `CommandActionListItem` is a wrapper around `@primer/react` `ActionList.Item`, but instead of an `onClick` handler
 * it takes a command ID and handles clicks by emitting command trigger events.
 *
 * If the command is gated by a disabled feature flag, nothing will render.
 */
export const CommandActionListItem = forwardRef<HTMLLIElement, CommandActionListItemProps>(
  ({commandId, children, description, leadingVisual, trailingVisual, ...forwardProps}, ref) => {
    const metadata = getCommandMetadata(commandId)
    const {triggerCommand} = useCommandsContext()

    if (!metadata) return null

    return (
      <ActionList.Item {...forwardProps} onSelect={event => triggerCommand(commandId, event.nativeEvent)} ref={ref}>
        {children ?? metadata.name}

        {description && <ActionList.Description>{description}</ActionList.Description>}

        {leadingVisual && <ActionList.LeadingVisual>{leadingVisual}</ActionList.LeadingVisual>}

        {
          // Allow disabling the keybinding hint by explicitly setting `trailingVisual` to `null`
          trailingVisual !== null && (
            <ActionList.TrailingVisual>
              {trailingVisual ?? <CommandKeybindingHint commandId={commandId} format="condensed" />}
            </ActionList.TrailingVisual>
          )
        }
      </ActionList.Item>
    )
  },
)
CommandActionListItem.displayName = 'ActionList.CommandItem'
