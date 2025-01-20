import type {KeyboardKeyProps} from '@github-ui/keyboard-key'
import {KeyboardKey} from '@github-ui/keyboard-key'

import type {CommandId} from '../commands'
import {getKeybinding} from '../commands'

interface CommandKeybindingHintProps extends Omit<KeyboardKeyProps, 'keys'> {
  commandId: CommandId
}

/** Renders a visual representing the keybinding for a command. If no keybinding is present, renders nothing. */
export const CommandKeybindingHint = ({commandId, ...props}: CommandKeybindingHintProps) => {
  const keys = getKeybinding(commandId)
  return keys ? <KeyboardKey keys={keys} {...props} /> : null
}
