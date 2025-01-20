import {CommandId} from './commands'

export class CommandEvent<Id extends CommandId = CommandId> {
  constructor(public readonly commandId: Id) {}
}

export type CommandEventHandler<Id extends CommandId = CommandId> = (event: CommandEvent<Id>) => void

export type CommandEventHandlersMapEntry<Id extends CommandId = CommandId> = [key: Id, handler: CommandEventHandler<Id>]

export type CommandEventHandlersMap = {
  [Id in CommandId]?: CommandEventHandler<Id>
}
export const CommandEventHandlersMap = {
  /**
   * Iterate over the entries in a handlers map.
   *
   * `Object.entries` will broaden the entry type to `[string, CommandEventHandler]` because objects can have unknown
   * keys (ie, `{a: 1, b: 2}` is assignable to `{a: number}`), so this narrows it back down.
   */
  entries: (map: CommandEventHandlersMap) =>
    Object.entries(map).filter(
      (entry): entry is CommandEventHandlersMapEntry => CommandId.is(entry[0]) && entry[1] !== undefined,
    ),
  keys: (map: CommandEventHandlersMap) => Object.keys(map).filter(CommandId.is),
}
