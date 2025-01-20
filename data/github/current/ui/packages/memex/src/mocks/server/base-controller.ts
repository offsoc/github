import type {HttpHandler} from 'msw'

import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {ColumnUpdateData} from '../../client/api/columns/contracts/storage'
import type {IssueTitleValue, PullRequestTitleValue} from '../../client/api/columns/contracts/title'
import type {ExtendedRepository} from '../../client/api/common-contracts'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {isValidDraftItemColumn} from '../../client/state-providers/memex-items/memex-item-helpers'
import {DefaultSuggestedRepositoryItems} from '../data/suggestions'
import type {MockDatabase} from '../in-memory-database/mock-database'
import {updateColumnValue} from './column-value-utils'
import {formDecodeToObject} from './form-decode-to-object'
import type {MockServer} from './mock-server'

let nextItemId = 100000

export abstract class BaseController {
  public declare db: MockDatabase
  protected server: MockServer

  /**
   * A list of handlers for intercepting requests
   * through the service worker
   */
  public handlers: Array<HttpHandler> = []

  /**
   * A list of handlers to override the initial handlers when
   * in `ErrorMode`.
   */
  public errorHandlers: Array<HttpHandler> = []

  constructor(db: MockDatabase, server: MockServer) {
    this.db = db
    this.server = server
  }

  protected log(message: string) {
    if (process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'development') {
      console.log(message)
    }
  }

  protected get formDecodeToObject() {
    return formDecodeToObject
  }

  protected getItemTitle(item: MemexItem) {
    for (const columnData of item.memexProjectColumnValues) {
      if (columnData.memexProjectColumnId === SystemColumnId.Title) {
        if (typeof columnData.value.title === 'string') {
          return columnData.value.title
        } else {
          return columnData.value.title.raw
        }
      }
    }
    return ''
  }

  private mergeDefaultVisibleColumnValues(populatedData: Array<ColumnUpdateData> | undefined): Array<ColumnUpdateData> {
    const excludedIds: Array<number | SystemColumnId> = populatedData
      ? populatedData.map(c => c.memexProjectColumnId)
      : []

    const data = this.db.columns
      .all()
      .filter(c => c.defaultColumn && excludedIds.indexOf(c.id) === -1)
      .map(c => {
        return {memexProjectColumnId: c.id, value: null} as ColumnUpdateData
      })

    return populatedData ? data.concat(populatedData) : data
  }

  protected addMemexItemWithContent(memexItem: MemexItem, columnData?: Array<ColumnUpdateData>) {
    memexItem.id = nextItemId++
    memexItem.content.id = memexItem.id
    this.db.memexItems.all().push(memexItem)
    columnData = this.mergeDefaultVisibleColumnValues(columnData)
    // Remove fields that cannot be set on the item (e.g., labels for draft items)
    columnData = columnData.filter(column => {
      if (memexItem.contentType === ItemType.RedactedItem) return false
      if (memexItem.contentType === ItemType.DraftIssue) {
        return isValidDraftItemColumn(column.memexProjectColumnId)
      }
      return true
    })
    if (columnData) {
      const repository = memexItem.memexProjectColumnValues.find(
        col => col.memexProjectColumnId === SystemColumnId.Repository,
      )?.value as ExtendedRepository

      const milestones = repository ? this.db.milestones.byRepositoryId(repository.id) : []
      const issueTypes = repository ? this.db.issueTypes.byRepositoryId(repository.id) : []

      for (const columnValue of columnData) {
        updateColumnValue(
          memexItem,
          columnValue,
          this.db.columns.all(),
          this.db.labels.all(),
          this.db.assignees.all(),
          milestones,
          issueTypes,
          this.db.parentIssues.all(),
          this.db.trackedBy,
          this.server.liveUpdate,
        )
      }
    }
    return memexItem
  }

  public addMemexItemFromSuggestion(
    contentType: typeof ItemType.PullRequest | typeof ItemType.Issue,
    repositoryId: number,
    suggestionId: number,
    columnData?: Array<ColumnUpdateData>,
  ) {
    const mockRepositoryItem = not_typesafe_nonNullAssertion(
      DefaultSuggestedRepositoryItems.find(item => item.id === suggestionId),
    )
    const repository = this.db.repositories.byId(repositoryId)

    if (contentType === ItemType.Issue && mockRepositoryItem.type === ItemType.Issue) {
      const titleValue: IssueTitleValue = {
        title: {raw: mockRepositoryItem.title, html: mockRepositoryItem.title},
        state: mockRepositoryItem.state,
        stateReason: mockRepositoryItem.stateReason,
        number: mockRepositoryItem.number,
        issueId: 2424252,
      }

      const newItem: MemexItem = {
        contentType: ItemType.Issue,
        content: {
          id: mockRepositoryItem.id,
          url: '',
          globalRelayId: '',
        },
        contentRepositoryId: repository.id,
        id: -1,
        priority: null,
        updatedAt: new Date().toISOString(),
        memexProjectColumnValues: [
          {
            memexProjectColumnId: SystemColumnId.Title,
            value: titleValue,
          },
          {
            memexProjectColumnId: SystemColumnId.Repository,
            value: repository,
          },
          {
            memexProjectColumnId: SystemColumnId.Assignees,
            value: [this.db.assignees.getRandom()],
          },
        ],
      }
      return this.addMemexItemWithContent(newItem, columnData)
    } else if (contentType === ItemType.PullRequest && mockRepositoryItem.type === ItemType.PullRequest) {
      const titleValue: PullRequestTitleValue = {
        title: {raw: mockRepositoryItem.title, html: mockRepositoryItem.title},
        number: mockRepositoryItem.number,
        state: mockRepositoryItem.state,
        isDraft: mockRepositoryItem.isDraft || false,
        issueId: 2424252,
      }

      const newItem: MemexItem = {
        contentType: ItemType.PullRequest,
        content: {
          id: mockRepositoryItem.id,
          url: '',
        },
        contentRepositoryId: repositoryId,
        id: -1,
        priority: null,
        updatedAt: new Date().toISOString(),
        memexProjectColumnValues: [
          {
            memexProjectColumnId: SystemColumnId.Title,
            value: titleValue,
          },
          {
            memexProjectColumnId: SystemColumnId.Repository,
            value: repository,
          },
        ],
      }
      return this.addMemexItemWithContent(newItem, columnData)
    } else {
      throw Error("Couldn't find item")
    }
  }
}
