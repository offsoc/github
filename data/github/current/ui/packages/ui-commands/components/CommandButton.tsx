import type {KeyboardKeyProps} from '@github-ui/keyboard-key'
import type {ButtonProps} from '@primer/react'
import {Button} from '@primer/react'
import {forwardRef} from 'react'

import {type CommandId, getCommandMetadata} from '../commands'
import {useCommandsContext} from '../commands-context'
import {CommandKeybindingHint} from './CommandKeybindingHint'

export interface CommandButtonProps extends Omit<ButtonProps, 'onClick'> {
  commandId: CommandId
  /** If `children` is not provided, the button will render the command name as its label by default. */
  children?: ButtonProps['children']
  /** If `true` and no `trailingVisual` is set, will render a keybinding hint as the trailing visual. */
  showKeybindingHint?: boolean

  keybindingHintVariant?: KeyboardKeyProps['variant']
}

/**
 * `CommandButton` is a wrapper around `@primer/react` `Button`, but instead of an `onClick` handler it takes a
 * command ID and handles clicks by emitting command trigger events.
 *
 * If the command is gated by a disabled feature flag, nothing will render.
 */
export const CommandButton = forwardRef<HTMLButtonElement, CommandButtonProps>(
  ({commandId, children, trailingVisual, showKeybindingHint = false, keybindingHintVariant, ...forwardProps}, ref) => {
    const metadata = getCommandMetadata(commandId)
    const {triggerCommand} = useCommandsContext()

    if (!metadata) return null

    const variant = keybindingHintVariant ?? (forwardProps.variant === 'primary' ? 'onEmphasis' : 'normal')

    // trailingVisual only accepts components, not JSX, so we have to jump through hoops to render anything more complex
    // than an icon (https://github.com/primer/react/issues/3948)
    // This becomes part of the label which gets noisy (but we don't want to hide this info from screen reader users),
    // so we wrap in hidden parentheses to offset it a little and make it read better
    const HintVisual = () => (
      <>
        <span className="sr-only">(</span>
        <CommandKeybindingHint commandId={commandId} format="condensed" variant={variant} />
        <span className="sr-only">)</span>
      </>
    )

    return (
      <Button
        {...forwardProps}
        onClick={event => triggerCommand(commandId, event.nativeEvent)}
        trailingVisual={trailingVisual ?? showKeybindingHint ? HintVisual : undefined}
        ref={ref}
      >
        {children ?? metadata.name}
      </Button>
    )
  },
)
CommandButton.displayName = 'CommandButton'
