import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {RedactedItem} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'

const DefaultRedactedItemTitle = "You don't have permission to access this item"

export const DefaultRedactedItem: RedactedItem = {
  id: 8,
  contentType: ItemType.RedactedItem,
  content: {
    id: -1,
  },
  priority: 7,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {title: DefaultRedactedItemTitle},
    },
  ],
}
