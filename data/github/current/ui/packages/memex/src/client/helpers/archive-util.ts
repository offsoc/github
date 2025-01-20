import {parseISO} from 'date-fns'

import {ItemType} from '../api/memex-items/item-type'

export const isMemexItemTypeArchivable = (contentType: ItemType) => {
  return contentType !== ItemType.RedactedItem
}

/**
 * A comparator for sorting archived items
 *
 * Items are sorted by their archived date, with the most recent first.
 * If two items have identicial archived dates, they are sorted by their
 * id, to maintain a stable sort order.
 */
export function archivedAtComparator(
  archivedItemA: {archivedAt: string | undefined; id: number},
  archivedItemB: {archivedAt: string | undefined; id: number},
) {
  let diff = 0

  // If both items have an archivedAt timestamp, then it makes sense to order them by that value.
  // Otherwise, we don't necessarily want all archived items grouped together at the top (or at the bottom), so we
  // fall back to the ID tiebreaker which effectively orders the items by creation time.
  if (archivedItemA.archivedAt && archivedItemB.archivedAt) {
    const itemAArchivedAt = parseISO(archivedItemA.archivedAt)
    const itemBArchivedAt = parseISO(archivedItemB.archivedAt)
    diff = itemBArchivedAt.getTime() - itemAArchivedAt.getTime()
  }

  if (diff !== 0) {
    return diff
  }

  return archivedItemB.id - archivedItemA.id
}
