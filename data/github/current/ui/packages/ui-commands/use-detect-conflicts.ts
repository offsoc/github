import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {useEffect, useMemo} from 'react'

import {CommandEventHandlersMap} from './command-event'
import type {CommandId} from './commands'
import {getKeybindings} from './commands'
import {filterOnce} from './utils'

/**
 * Mutable map of registered commands. Keys are the resolved keybindings, while the values are arrays of all
 * existing registered command IDs with that keybinding. Since the same command could potentially be accidentally
 * registered twice, the value is an array rather than a set.
 */
type CommandRegistry = Map<NormalizedSequenceString, readonly CommandId[]>

const registeredGlobalCommands: CommandRegistry = new Map()

export function useDetectConflicts(scope: 'global' | 'scoped', commands: CommandEventHandlersMap) {
  const registeredScopedCommands = useMemo<CommandRegistry>(() => new Map(), [])

  const registeredCommands = scope === 'global' ? registeredGlobalCommands : registeredScopedCommands

  /** Add commands to the global registry and log a warning if there is a conflict. */
  useEffect(() => {
    for (const [commandId, keybinding] of getKeybindings(CommandEventHandlersMap.keys(commands))) {
      const alreadyRegisteredIds = registeredCommands.get(keybinding)?.filter(id => id !== commandId) ?? []

      if (alreadyRegisteredIds.length)
        // eslint-disable-next-line no-console
        console.warn(
          `The keybinding (${keybinding}) for the "${commandId}" command conflicts with the keybinding for the already-registered command(s) "${alreadyRegisteredIds.join(
            ', ',
          )}". This may result in unpredictable behavior.`,
        )

      registeredCommands.set(keybinding, alreadyRegisteredIds.concat(commandId))
    }

    return () => {
      for (const [commandId, keybinding] of getKeybindings(CommandEventHandlersMap.keys(commands))) {
        // If it was registered multiple times, be careful only to remove one so we can accurately keep warning
        const remainingCommandIds = filterOnce(registeredCommands.get(keybinding) ?? [], commandId)

        if (remainingCommandIds?.length) registeredCommands.set(keybinding, remainingCommandIds)
        else registeredCommands.delete(keybinding)
      }
    }
  }, [commands, registeredCommands])
}
