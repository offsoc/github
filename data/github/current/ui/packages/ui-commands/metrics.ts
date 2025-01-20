import {AnalyticsClient} from '@github/hydro-analytics-client'
import type {NormalizedSequenceString} from '@github-ui/hotkey'

import type {CommandEvent} from './command-event'
import {type CommandId, getKeybinding} from './commands'

/** https://hydro.githubapp.com/hydro_analytics/apps/ui-commands */
const HYDRO_APP_ID = 'ui-commands'

const client = new AnalyticsClient({
  collectorUrl: `https://collector.githubapp.com/${HYDRO_APP_ID}/collect`,
})

type CommandTriggerEvent = {
  /** Full command ID in `service:command` form. */
  command_id: CommandId
  /**
   * How the event was triggered. More event methods may be added in the future:
   *  - `"keybinding"`: Via a keydown event according to the configured keybinding for the command.
   */
  trigger_type: 'keybinding' | 'click'
  /**
   * HTML of the opening tag of the target element for the event that triggered this command. When `trigger_type` is
   * `"keybinding"` this is the currently focused element if there is one; otherwise it will be the `<body>`.
   */
  target_element_html?: string
  /** The keybinding (in hotkey string format) configured for this command, if there is one. */
  keybinding?: NormalizedSequenceString
  /** If the handler threw an exception synchronously, this is a string representation of that exception. */
  handler_exception?: string
}
const CommandTriggerEvent = {
  TYPE: 'command.trigger',
  send(context: CommandTriggerEvent) {
    client.sendEvent(CommandTriggerEvent.TYPE, context)
  },
}

/** Get the opening HTML tag of the given element. */
function getOpeningHtmlTag(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase()
  const attributes = Array.from(element.attributes)
    .map(attr => `${attr.name}="${attr.value.replaceAll('"', '\\"')}"`)
    .join(' ')
  return `<${tagName}${attributes ? ` ${attributes}` : ''}>`
}

/** Record a Hydro analytics event for triggering a command. */
export function recordCommandTriggerEvent(commandEvent: CommandEvent, domEvent: KeyboardEvent | MouseEvent) {
  CommandTriggerEvent.send({
    // eslint-disable-next-line camelcase
    command_id: commandEvent.commandId,
    // eslint-disable-next-line camelcase
    trigger_type: domEvent instanceof KeyboardEvent ? 'keybinding' : 'click',
    // eslint-disable-next-line camelcase
    target_element_html: domEvent.target instanceof HTMLElement ? getOpeningHtmlTag(domEvent.target) : undefined,
    keybinding: getKeybinding(commandEvent.commandId),
  })
}
