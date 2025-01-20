import type {Owner} from '../api/common-contracts'
import type {TrackedByItem} from '../api/issues-graph/contracts'

export const TRACKED_BY_REGEX = /([a-z]+)\/([a-z]+)#(\d+)/

/** Format the Tracked By item for display */
export function fullDisplayName(item: TrackedByItem): string {
  return `${item.userName}/${item.repoName}#${item.number}`
}

function fullOwnerName(item: TrackedByItem): string {
  return `${item.userName}/${item.repoName}`
}

/**
 * Displays the name with the owner for the Tracked By item, but does not
 * render the issue number.
 */
export function displayNameWithOwnerWithoutId(item: TrackedByItem, projectOwner?: Owner): string {
  if (!projectOwner) {
    return fullOwnerName(item)
  }

  if (item.userName.toLowerCase() === projectOwner.login.toLowerCase()) {
    return item.repoName
  }

  return fullOwnerName(item)
}

export function displayNameWithOwner(item: TrackedByItem, projectOwner?: Owner): string {
  if (!projectOwner) {
    return fullDisplayName(item)
  }

  if (item.userName.toLowerCase() === projectOwner.login.toLowerCase()) {
    return `${item.repoName}#${item.number}`
  }

  return fullDisplayName(item)
}
