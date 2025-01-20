import {isFeatureEnabled} from '@github-ui/feature-flags'
import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {normalizeSequence} from '@github-ui/hotkey'

import jsonMetadata from './__generated__/ui-commands.json'

const {commands, services} = jsonMetadata

const serviceCommandIds = new Set(Object.keys(commands) as CommandId[])

export type ServiceId = keyof typeof services

/** Full joined command ID (in `serviceId:commandId` form). */
export type CommandId = keyof typeof commands
export const CommandId = {
  is: (str: string): str is CommandId => serviceCommandIds.has(str as CommandId),
  getServiceId: (commandId: CommandId) => commandId.split(':')[0] as ServiceId,
}

export interface CommandMetadata {
  name: string
  description: string
  defaultBinding?: string
  featureFlag?: string
}

/**
 * Get the documentation metadata for the given command. Returns `undefined` if the command is
 * disabled via feature flag.
 */
export const getCommandMetadata = (commandId: CommandId) => {
  const metadata = commands[commandId] as CommandMetadata
  return !metadata.featureFlag || isFeatureEnabled(metadata.featureFlag.toUpperCase()) ? metadata : undefined
}

/** Get the documentation metadata for the given service. */
export const getServiceMetadata = (serviceId: ServiceId) => services[serviceId]

export const getKeybinding = (commandId: CommandId): NormalizedSequenceString | undefined => {
  const metadata = getCommandMetadata(commandId)
  return metadata?.defaultBinding ? normalizeSequence(metadata.defaultBinding) : undefined
}

/** Returns a map of id to keybinding, without entries for commands that don't have keybindings. */
export const getKeybindings = (commandIds: CommandId[]) =>
  new Map(
    commandIds
      .map(id => [id, getKeybinding(id)])
      .filter((entry): entry is [CommandId, NormalizedSequenceString] => entry[1] !== undefined),
  )
