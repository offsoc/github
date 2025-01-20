import invariant from 'tiny-invariant'

import type {ColumnUpdateData} from '../../client/api/columns/contracts/storage'
import type {BulkAddMemexItemsRequest, MemexItem} from '../../client/api/memex-items/contracts'
import type {ItemType} from '../../client/api/memex-items/item-type'
import {MemexRefreshEvents} from '../data/memex-refresh-events'
import type {MockDatabase} from '../in-memory-database/mock-database'
import {BaseJob} from './base-job'
import {JobQueuesTypes} from './job'

/**
 * A limited interface representing the pieces of the mock server needed by this job
 */
interface MockServerInterface {
  memexItems: MemexItemsControllerInterface
  liveUpdate: LiveUpdatesControllerInterface
  db: MockDatabase
}

/**
 * A limited interface representing the pieces of the MemexItemsController needed by this job
 */
interface MemexItemsControllerInterface {
  addMemexItemFromSuggestion: (
    contentType: typeof ItemType.PullRequest | typeof ItemType.Issue,
    repositoryId: number,
    suggestionId: number,
    columnData?: Array<ColumnUpdateData>,
  ) => MemexItem
}

/**
 * A limited interface representing the pieces of the LiveUpdatesController needed by this job
 */
interface LiveUpdatesControllerInterface {
  sendSocketMessage: (args: {type: ObjectValues<typeof MemexRefreshEvents>}) => boolean | undefined
}

export class BulkAddMemexItemsJob extends BaseJob {
  #args: BulkAddMemexItemsRequest
  #server: MockServerInterface
  queue = JobQueuesTypes.BULK_ADD_MEMEX_ITEMS

  constructor(server: MockServerInterface, args: BulkAddMemexItemsRequest) {
    super()
    this.#server = server
    this.#args = args
  }

  async perform() {
    const ownerRepoNumberIdentifiers = this.#args.memexProjectItem.content.title
      .split(',')
      .map(identifier => identifier.trim())
    for (const ownerRepoNumberIdentifier of ownerRepoNumberIdentifiers) {
      const [nameWithOwner, number] = ownerRepoNumberIdentifier.split('#')
      invariant(nameWithOwner && number, 'nwo and number must be defined')
      const repoItemId = parseInt(number, 10)
      const repoItem = this.#server.db.repositoryItems.byId(repoItemId)
      const repos = this.#server.db.repositories.all()
      const repo = repos.find(r => r.nameWithOwner === nameWithOwner)
      if (!repoItem) throw new Error(`RepositoryItem ${repoItemId} not found`)
      if (!repo) throw new Error(`Repository ${nameWithOwner} not found`)
      this.#server.memexItems.addMemexItemFromSuggestion(
        repoItem.type,
        repo.id,
        repoItem.id,
        this.#args.memexProjectItem.memexProjectColumnValues,
      )
      this.#server.liveUpdate.sendSocketMessage({
        type: MemexRefreshEvents.ProjectItemUpdate,
      })
    }
  }
}
