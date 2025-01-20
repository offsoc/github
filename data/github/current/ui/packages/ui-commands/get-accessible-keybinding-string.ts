import {getAccessibleKeyboardKeyString} from '@github-ui/keyboard-key'

import {type CommandId, getKeybinding} from './commands'

/**
 * AVOID: `CommandKeybindingHint` is nearly always sufficient for providing both visible and accessible keyboard hints, and will
 * result in a good screen reader experience when used as the target for `aria-describedby` and `aria-labelledby`.
 * However, there may be cases where we need a plain string version, such as when building `aria-label` or
 * `aria-description`. In that case, this plain string builder can be used instead.
 *
 * NOTE that this string should _only_ be used when building `aria-label` or `aria-description` props (never rendered
 * to the visible DOM!) and should nearly always also be paired with a visible hint for sighted users. The only
 * exception is in cases where keyboard shortcuts exist solely to provide accessible alternatives to inaccessible
 * visible UI.
 */
export const getAccessibleKeybindingString = (commandId: CommandId) => {
  const keys = getKeybinding(commandId)
  return keys ? getAccessibleKeyboardKeyString(keys) : undefined
}
