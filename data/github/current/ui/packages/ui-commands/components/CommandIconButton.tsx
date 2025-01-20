import type {IconButtonProps} from '@primer/react'
import {IconButton} from '@primer/react'
import {forwardRef} from 'react'

import {type CommandId, getCommandMetadata} from '../commands'
import {useCommandsContext} from '../commands-context'

export interface CommandIconButtonProps extends Omit<IconButtonProps, 'onClick' | 'aria-label' | 'aria-labelledby'> {
  commandId: CommandId
  /** If `aria-label` is not provided, the button will render the command name as its label by default. */
  ['aria-label']?: IconButtonProps['aria-label']
}

/**
 * `CommandButton` is a wrapper around `@primer/react` `Button`, but instead of an `onClick` handler it takes a
 * command ID and handles clicks by emitting command trigger events.
 *
 * If the command is gated by a disabled feature flag, nothing will render.
 */
export const CommandIconButton = forwardRef<HTMLButtonElement, CommandIconButtonProps>(
  ({commandId, ['aria-label']: ariaLabel, ...forwardProps}, ref) => {
    const metadata = getCommandMetadata(commandId)
    const {triggerCommand} = useCommandsContext()

    if (!metadata) return null

    return (
      <IconButton
        {...forwardProps}
        aria-label={ariaLabel ?? metadata.name}
        onClick={event => triggerCommand(commandId, event.nativeEvent)}
        ref={ref}
      />
    )
  },
)
CommandIconButton.displayName = 'CommandIconButton'
