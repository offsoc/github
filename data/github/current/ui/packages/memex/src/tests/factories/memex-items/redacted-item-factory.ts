import {Factory} from 'fishery'

import type {RedactedItem} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {columnValueFactory} from '../column-values/column-value-factory'
import {memexItemIdFactory} from './memex-item-id-factory'

export const redactedItemFactory = Factory.define<RedactedItem>(() => {
  const id = memexItemIdFactory.build()

  const titleColumnValue = columnValueFactory.title('', ItemType.RedactedItem).build()

  return {
    id,
    content: {
      id,
      url: 'https://github.com/github/memex/1111',
    },
    contentType: ItemType.RedactedItem,
    contentRepositoryId: id,
    memexProjectColumnValues: [titleColumnValue],
    priority: 123,
    updatedAt: new Date().toISOString(),
  }
})
