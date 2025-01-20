import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {eventToHotkeyString, SequenceTracker} from '@github-ui/hotkey'
import {isShortcutAllowed} from '@github-ui/hotkey/keyboard-shortcuts-helper'
import {useCallback, useMemo, useRef} from 'react'

import type {CommandId} from './commands'
import {getKeybinding} from './commands'

export function useOnKeyDown(commandsIds: CommandId[], triggerCommand: (id: CommandId, event: KeyboardEvent) => void) {
  const sequenceTracker = useMemo(() => new SequenceTracker(), [])

  /** Map of keybinding string to command ID for fast lookup. */
  const keybindingMap = useMemo(() => {
    const map = new Map<NormalizedSequenceString, CommandId>()

    for (const id of commandsIds) {
      const keybinding = getKeybinding(id)
      if (keybinding) map.set(keybinding, id)
    }

    return map
  }, [commandsIds])

  const lastEventRef = useRef<KeyboardEvent | null>(null)

  return useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event

      // This handler may be registered at both the DOM and React levels; in that case we want to avoid registering /
      // handling the same event twice.
      if (lastEventRef.current === nativeEvent) return
      lastEventRef.current = nativeEvent

      if (!isShortcutAllowed(nativeEvent)) {
        sequenceTracker.reset()
        return
      }

      sequenceTracker.registerKeypress(nativeEvent)

      // First look for matching sequences, then for a matching hotkey for just this press
      const commandId =
        keybindingMap.get(sequenceTracker.sequence) ?? keybindingMap.get(eventToHotkeyString(nativeEvent))
      if (!commandId) return

      sequenceTracker.reset()
      event.preventDefault()
      event.stopPropagation()
      // avoids double triggering an event if an element is rendered twice
      // for example when a mobile version is hidden by CSS
      nativeEvent.stopImmediatePropagation()

      triggerCommand(commandId, nativeEvent)
    },
    [keybindingMap, sequenceTracker, triggerCommand],
  )
}
