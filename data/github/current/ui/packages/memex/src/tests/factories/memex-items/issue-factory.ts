import {Factory} from 'fishery'

import type {MemexColumnData} from '../../../client/api/columns/contracts/storage'
import type {Issue} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {columnValueFactory} from '../column-values/column-value-factory'
import {memexItemIdFactory} from './memex-item-id-factory'

class IssueFactory extends Factory<Issue, undefined> {
  withColumnValues(memexProjectColumnValues: Array<MemexColumnData>) {
    return this.params({
      memexProjectColumnValues,
    })
  }

  withTitleColumnValue(title: string) {
    return this.params({
      memexProjectColumnValues: [columnValueFactory.title(title, ItemType.Issue).build()],
    })
  }
}

export const issueFactory = IssueFactory.define(() => {
  const id = memexItemIdFactory.build()

  const issue: Issue = {
    id,
    content: {
      id,
      url: 'https://github.com/github/memex/1111',
      globalRelayId: '',
    },
    contentType: ItemType.Issue,
    contentRepositoryId: id,
    memexProjectColumnValues: [],
    priority: 123,
    updatedAt: new Date().toISOString(),
  }
  return issue
})
