import {useEffect, useId} from 'react'

import {CommandEventHandlersMap} from './command-event'
import {CommandId, getCommandMetadata, getServiceMetadata, type ServiceId} from './commands'

/**
 * Registered command IDs. The key is a globally unique ID for each source that will be used to unregister or update
 * the commands; this allows commands to be registered multiple times on a page (ie, in different scopes).
 */
const registeredCommands = new Map<string, CommandId[]>()

export type UIService = {
  id: string
  name: string
}

export type UICommand = {
  id: CommandId
  name: string
  description: string
  keybinding?: string | string[]
}

export type UICommandGroup = {
  service: UIService
  commands: UICommand[]
}

/**
 * Get the set of IDs of all commands currently registered on the page, regardless of scope. From these IDs the
 * command metadata can be obtained with `getCommandMetadata(commandId)`, and the service metadata can be obtained with
 * `getServiceMetadata(CommandId.getServiceId(commandId))`.
 */
export function getAllRegisteredCommands(): UICommandGroup[] {
  const uiCommandGroupMap = new Map<ServiceId, UICommandGroup>()
  for (const commandId of new Set(Array.from(registeredCommands.values()).flat())) {
    const serviceId = CommandId.getServiceId(commandId)
    if (!uiCommandGroupMap.has(serviceId)) {
      const service = getServiceMetadata(serviceId)
      uiCommandGroupMap.set(serviceId, {
        service: {id: service.id, name: service.name},
        commands: [],
      })
    }
    const command = getCommandMetadata(commandId)
    if (command && command.defaultBinding) {
      uiCommandGroupMap.get(serviceId)?.commands.push({
        id: commandId,
        name: command.name,
        description: command.description,
        keybinding: command.defaultBinding,
      })
    }
  }

  return Array.from(uiCommandGroupMap.values())
}

/** Register commands into the global command registry for display in help dialog. */
export const useRegisterCommands = (commands: CommandEventHandlersMap) => {
  const sourceId = useId()

  useEffect(() => {
    registeredCommands.set(sourceId, CommandEventHandlersMap.keys(commands))

    return () => {
      registeredCommands.delete(sourceId)
    }
  }, [commands, sourceId])
}
