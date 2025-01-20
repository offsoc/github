import {Factory} from 'fishery'

import type {MemexColumnData} from '../../../client/api/columns/contracts/storage'
import type {PullRequest} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {columnValueFactory} from '../column-values/column-value-factory'
import {memexItemIdFactory} from './memex-item-id-factory'

class PullRequestFactory extends Factory<PullRequest, undefined> {
  withColumnValues(memexProjectColumnValues: Array<MemexColumnData>) {
    return this.params({
      memexProjectColumnValues,
    })
  }

  withTitleColumnValue(title: string) {
    return this.params({
      memexProjectColumnValues: [columnValueFactory.title(title, ItemType.PullRequest).build()],
    })
  }
}

export const pullRequestFactory = PullRequestFactory.define(() => {
  const id = memexItemIdFactory.build()

  const pullRequest: PullRequest = {
    id,
    content: {
      id,
      url: 'https://github.com/github/memex/1111',
    },
    contentType: ItemType.PullRequest,
    contentRepositoryId: id,
    memexProjectColumnValues: [],
    priority: 123,
    updatedAt: new Date().toISOString(),
  }
  return pullRequest
})
