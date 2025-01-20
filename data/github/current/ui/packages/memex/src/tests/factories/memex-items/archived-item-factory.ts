import {Factory} from 'fishery'

import type {MemexItem} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {columnValueFactory} from '../column-values/column-value-factory'
import {issueFactory} from './issue-factory'

class ArchivedItemFactory extends Factory<MemexItem, undefined> {
  withTitleColumnValue(title: string) {
    return this.params({
      memexProjectColumnValues: [columnValueFactory.title(title, ItemType.Issue).build()],
    })
  }

  redacted() {
    return this.params({
      memexProjectColumnValues: [
        columnValueFactory.title("You don't have permission to access this item", ItemType.RedactedItem).build(),
      ],
      contentType: ItemType.RedactedItem,
    })
  }

  restored() {
    return this.params({
      archived: undefined,
    })
  }
}

export const archivedItemFactory = ArchivedItemFactory.define(() => {
  const issue = issueFactory.build()

  issue.archived = {
    archivedAt: new Date().toISOString(),
    archivedBy: undefined,
  }

  return issue as MemexItem
})
