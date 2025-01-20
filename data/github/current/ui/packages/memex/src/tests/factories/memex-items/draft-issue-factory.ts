import {Factory} from 'fishery'

import type {DraftIssue} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {columnValueFactory} from '../column-values/column-value-factory'
import {memexItemIdFactory} from './memex-item-id-factory'

class DraftIssueFactory extends Factory<DraftIssue, undefined> {
  withTitleColumnValue(title: string) {
    return this.params({
      memexProjectColumnValues: [columnValueFactory.title(title, ItemType.DraftIssue).build()],
    })
  }
}

export const draftIssueFactory = DraftIssueFactory.define(() => {
  const id = memexItemIdFactory.build()
  const draftIssue: DraftIssue = {
    id,
    content: {
      id,
    },
    contentType: ItemType.DraftIssue,
    memexProjectColumnValues: [],
    priority: 123,
    updatedAt: new Date().toISOString(),
  }
  return draftIssue
})
