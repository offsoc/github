import {useCallback, useEffect} from 'react'

import {CommandEvent, CommandEventHandlersMap} from '../command-event'
import {CommandId} from '../commands'
import {useRegisterCommands} from '../commands-registry'
import {recordCommandTriggerEvent} from '../metrics'
import {useDetectConflicts} from '../use-detect-conflicts'
import {useOnKeyDown} from '../use-on-key-down'

export interface GlobalCommandsProps {
  /** Map of command IDs to the corresponding event handler. */
  commands: CommandEventHandlersMap
}

/**
 * There's no context for global commands because they can be defined in any react app on the page. So to be able to
 * trigger them without keyboard events, we emit and listen for custom DOM events instead.
 */
const customDomEventName = 'ui-command-trigger'

/** Trigger a global command without a keyboard event. */
export function dispatchGlobalCommand(commandId: CommandId, domEvent: KeyboardEvent | MouseEvent) {
  document.dispatchEvent(
    new CustomEvent(customDomEventName, {
      detail: {
        commandId,
        domEvent,
      },
    }),
  )
}

/**
 * Provide command handlers that are activatable when focus is anywhere on the current page, including outside this
 * React app.
 *
 * @example
 * <GlobalCommands commands={{'issues:navigateToCode': navigateToCode}} />
 */
export const GlobalCommands = ({commands}: GlobalCommandsProps) => {
  const triggerCommand = useCallback(
    <T extends CommandId>(commandId: T, domEvent: KeyboardEvent | MouseEvent) => {
      const handler = commands[commandId]

      if (handler) {
        const event = new CommandEvent(commandId)
        try {
          handler(event)
        } finally {
          recordCommandTriggerEvent(event, domEvent)
        }
      }
    },
    [commands],
  )

  const onKeyDown = useOnKeyDown(CommandEventHandlersMap.keys(commands), triggerCommand)

  useDetectConflicts('global', commands)

  useRegisterCommands(commands)

  useEffect(() => {
    // Types for this are a massive pain because _anything_ can emit an event with this name
    const onCustomEvent = (event: Event) => {
      const detail = 'detail' in event && typeof event.detail === 'object' ? event.detail : undefined
      if (!detail) return

      const commandId =
        'commandId' in detail && typeof detail.commandId === 'string' && CommandId.is(detail.commandId)
          ? detail.commandId
          : undefined
      const domEvent =
        'domEvent' in detail && (detail.domEvent instanceof KeyboardEvent || detail.domEvent instanceof MouseEvent)
          ? detail.domEvent
          : undefined
      if (!commandId || !domEvent) return

      triggerCommand(commandId, domEvent)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener(customDomEventName, onCustomEvent)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener(customDomEventName, onCustomEvent)
    }
  }, [onKeyDown, triggerCommand])

  return null
}
