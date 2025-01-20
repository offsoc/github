import type {RemoveMemexItemRequest} from '../../client/api/memex-items/contracts'
import {MemexRefreshEvents} from '../data/memex-refresh-events'
import type {MockDatabase} from '../in-memory-database/mock-database'
import {BaseJob} from './base-job'
import {JobQueuesTypes} from './job'

/**
 * A limited interface representing the pieces of the mock server needed by this job
 */
interface MockServerInterface {
  liveUpdate: LiveUpdatesControllerInterface
  db: MockDatabase
  sleep: (delay?: number) => Promise<unknown>
}

/**
 * A limited interface representing the pieces of the LiveUpdatesController needed by this job
 */
interface LiveUpdatesControllerInterface {
  sendSocketMessage: (args: {type: ObjectValues<typeof MemexRefreshEvents>}) => boolean | undefined
}

export class BulkDeleteMemexItemsJob extends BaseJob {
  #args: RemoveMemexItemRequest
  #server: MockServerInterface
  queue = JobQueuesTypes.BULK_DELETE_MEMEX_ITEMS

  constructor(server: MockServerInterface, args: RemoveMemexItemRequest) {
    super()
    this.#server = server
    this.#args = args
  }

  async perform() {
    let memexProjectItemIds = 'memexProjectItemIds' in this.#args ? this.#args.memexProjectItemIds : []
    if ('q' in this.#args && this.#args.scope === 'archived') {
      memexProjectItemIds = this.#server.db.memexItems.getArchived({columns: [], q: this.#args.q}).map(item => item.id)
    }

    const sleepTime = memexProjectItemIds.length > 100 ? 5 : 50

    for (const id of memexProjectItemIds) {
      await this.#server.sleep(sleepTime)
      this.#server.db.memexItems.remove(id)
    }

    this.#server.liveUpdate.sendSocketMessage({
      type: MemexRefreshEvents.ProjectItemDestroy,
    })
  }
}
