import {
  paginatedRefreshEvent,
  type PaginatedRefreshSocketMessageData,
  type SocketMessageData,
  type SocketMessageIssueData,
} from '../api/SocketMessage/contracts'
import type {AliveChannelType, AliveConfig} from '../services/types'
import {fetchJSONIslandData} from './json-island'

let config: AliveConfig | undefined = undefined
let liveUpdatesConfig: {refreshEvents: Set<string>} | undefined = undefined

export function isValidMemexRefreshEventShape(data: unknown): data is SocketMessageData {
  if (!hasTypeKey(data)) return false

  if (typeof data.type !== 'string') return false

  return 'payload' in data
}

export function isValidBulkUpdateEventShape(data: unknown): data is SocketMessageData {
  if (!isObject(data)) return false
  return 'bulkUpdateSuccess' in data && 'actor' in data && isObject(data.actor) && 'id' in data.actor
}

export function isValidBulkCopyEventShape(data: unknown): data is SocketMessageData {
  if (!isObject(data)) return false
  return 'bulkCopySuccess' in data && 'actor' in data && isObject(data.actor) && 'id' in data.actor
}

export function isValidRefreshEventType(eventType: string) {
  if (!liveUpdatesConfig) {
    liveUpdatesConfig = {refreshEvents: new Set(fetchJSONIslandData('memex-refresh-events'))}
  }
  return liveUpdatesConfig.refreshEvents.has(eventType)
}

export function isValidPaginatedRefreshEvent(data: unknown): data is PaginatedRefreshSocketMessageData {
  if (!hasTypeKey(data)) return false

  return data.type === paginatedRefreshEvent
}

export function getChannel(channelType: AliveChannelType) {
  if (!config) {
    config = fetchJSONIslandData('memex-alive')
  }
  const channelKey = `${channelType}Channel` as const
  return config?.[channelKey]
}

export function isValidSidePanelRefreshEventShape(data: unknown): data is SocketMessageIssueData {
  if (!hasReasonKey(data)) return false

  return typeof data.reason === 'string'
}
export function isValidProjectMigrationEventShape(data: unknown): data is SocketMessageData {
  return isObject(data) && Object.prototype.hasOwnProperty.call(data, 'project_migration')
}

function isObject(data: unknown): data is object {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
}

function hasTypeKey(data: unknown): data is SocketMessageData {
  return isObject(data) && Object.prototype.hasOwnProperty.call(data, 'type')
}

function hasReasonKey(data: unknown): data is SocketMessageIssueData {
  return isObject(data) && Object.prototype.hasOwnProperty.call(data, 'reason')
}

/**
 * Test helper to reset the alive config
 * allowing us to test different configs between tests
 *
 * Should only be called within tests
 */
export function resetAliveConfigForTests() {
  config = undefined
  liveUpdatesConfig = undefined
}
