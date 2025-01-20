import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {ColumnUpdateData, MemexColumnData} from '../../client/api/columns/contracts/storage'
import type {ExtendedRepository, IAssignee, IssueType, Label, Milestone} from '../../client/api/common-contracts'
import type {
  AddMemexItemRequest,
  AddMemexItemResponse,
  ArchiveMemexItemRequest,
  ArchiveMemexItemResponse,
  BulkAddMemexItemsRequest,
  BulkAddMemexItemsResponse,
  ConvertDraftItemToIssueRequest,
  ConvertDraftItemToIssueResponse,
  GetArchivedMemexItemsRequest,
  GetArchivedMemexItemsResponse,
  GetArchiveStatusResponse,
  GetItemsTrackedByParentResponse,
  GetMemexItemRequest,
  GetMemexItemResponse,
  GetSuggestedAssigneesResponse,
  GetSuggestedIssueTypesResponse,
  GetSuggestedLabelsResponse,
  GetSuggestedMilestonesResponse,
  IGetItemsTrackedByParentRequest,
  IGetSuggestedAssigneesRequest,
  IGetSuggestedIssueTypesRequest,
  IGetSuggestedLabelsRequest,
  IGetSuggestedMilestonesRequest,
  IRemoveMemexItemResponse,
  IUpdateMemexItemRequest,
  MemexItem,
  PaginatedItemsScope,
  RemoveMemexItemRequest,
  UnarchiveMemexItemRequest,
  UnarchiveMemexItemResponse,
  UpdateMemexItemResponse,
} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import type {
  GetPaginatedItemsRequest,
  GetPaginatedItemsResponse,
  SliceData,
} from '../../client/api/memex-items/paginated-views'
import type {RepositoryItem} from '../../client/api/repository/contracts'
import {normalizeToFilterName} from '../../client/components/filter-bar/helpers/search-filter'
import {archivedAtComparator} from '../../client/helpers/archive-util'
import {assertNever} from '../../client/helpers/assert-never'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {
  AFTER_PARAM,
  BEFORE_PARAM,
  FIRST_PARAM,
  HORIZONTAL_GROUPED_BY_COLUMN_KEY,
  HORIZONTAL_GROUPED_BY_COLUMN_VALUE_KEY,
  PER_PAGE_PARAM,
  Q_PARAM,
  SCOPE_PARAM,
  SECONDARY_AFTER_PARAM,
  SLICE_BY_COLUMN_ID_KEY,
  SLICE_VALUE_KEY,
  SORTED_BY_COLUMN_DIRECTION_KEY,
  SORTED_BY_COLUMN_ID_KEY,
  VERTICAL_GROUPED_BY_COLUMN_KEY,
  VERTICAL_GROUPED_BY_COLUMN_VALUE_KEY,
  VISIBLE_FIELDS_PARAM,
} from '../../client/platform/url'
import {generateConvertToIssueResponse} from '../../tests/mocks/models/convert-to-issue'
import {MemexRefreshEvents} from '../data/memex-refresh-events'
import {getUser} from '../data/users'
import {MAX_ARCHIVED_ITEMS} from '../data/workflows'
import {BulkAddMemexItemsJob} from '../jobs/bulk-add-memex-items-job'
import {BulkDeleteMemexItemsJob} from '../jobs/bulk-delete-memex-items-job'
import {BulkUnarchiveMemexItemsJob} from '../jobs/bulk-unarchive-memex-items-job'
import {TrackedByParent} from '../memex-items/tracked-issues'
import {createRequestHandlerWithError} from '../msw-responders'
import {
  delete_destroyMemexItem,
  get_getArchivedItems,
  get_getArchiveStatus,
  get_getItemsTrackedByParent,
  get_getMemexItem,
  get_getPaginatedItems,
  get_getSuggestedAssigneesForMemexItem,
  get_getSuggestedIssueTypesForMemexItem,
  get_getSuggestedLabelsForMemexItem,
  get_getSuggestedMilestonesForMemexItem,
  post_addMemexItem,
  post_archiveMemexItem,
  post_bulkAddMemexItems,
  post_convertDraftItem,
  post_resyncElasticsearchIndex,
  put_bulkUpdateMemexItems,
  put_unarchiveMemexItem,
  put_updateMemexItem,
} from '../msw-responders/memex-items'
import {BaseController} from './base-controller'
import {renderWithEmoji, updateColumnValue} from './column-value-utils'
import {JOB_STATUS_ROUTE_PATH} from './jobs-status-controller'
import {stringToSyntheticId} from './mock-server-parsing'
import {buildPaginatedGroups, buildSlices, sliceNodesAndBuildPageInfo} from './pagination'

const DOTCOM_REGEX = /(https?:\/\/)?(www\.)?github\.com\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

export class MemexItemsController extends BaseController {
  public get({visibleFields}: {visibleFields?: Array<number | SystemColumnId>} = {}): Array<MemexItem> {
    return this.db.memexItems.getActive().map(item => {
      const limitedItem: MemexItem = {...item, memexProjectColumnValues: []}
      for (const itemColumn of item.memexProjectColumnValues) {
        const databaseColumn = this.db.columns.all().find(dbCol => {
          if (!visibleFields) {
            return dbCol.id === itemColumn.memexProjectColumnId && dbCol.defaultColumn
          } else {
            return dbCol.id === itemColumn.memexProjectColumnId && visibleFields.includes(dbCol.id)
          }
        })
        if (databaseColumn) {
          limitedItem.memexProjectColumnValues.push(itemColumn)
        }
      }
      return this.withoutExtendedContent(limitedItem)
    })
  }

  public async getItem({memexProjectItemId: id}: GetMemexItemRequest): Promise<GetMemexItemResponse> {
    const item = this.db.memexItems.byId(id)
    if (!item) {
      throw new Error(`Item with id ${id} not found`)
    }
    await this.server.sleep()
    return {memexProjectItem: item}
  }

  public async add({memexProjectItem: itemCreateData}: AddMemexItemRequest): Promise<AddMemexItemResponse> {
    let memexProjectItem: MemexItem
    if (itemCreateData.contentType === ItemType.DraftIssue) {
      const raw = itemCreateData.content.title
      let columnData: Array<ColumnUpdateData> | undefined = undefined

      // the following block determines if we're dealing with multiple columns
      // and simulates serverside validation where if the MemexItem is a DraftIssue and the
      // title is not a dotcom url the backend will not set assignees
      if (itemCreateData.memexProjectColumnValues) {
        if (DOTCOM_REGEX.test(raw)) {
          columnData = itemCreateData.memexProjectColumnValues
        } else if (itemCreateData.memexProjectColumnValues.length) {
          columnData = itemCreateData.memexProjectColumnValues
        }
      }

      memexProjectItem = this.addMemexItemWithContent(
        {
          contentType: ItemType.DraftIssue,
          content: {
            id: 1,
          },
          id: -1,
          priority: null,
          updatedAt: new Date().toISOString(),
          memexProjectColumnValues: [
            {
              memexProjectColumnId: SystemColumnId.Title,
              value: {title: {raw, html: renderWithEmoji(raw)}},
            },
          ],
        },
        columnData,
      )
    } else if (itemCreateData.contentType === ItemType.Issue || itemCreateData.contentType === ItemType.PullRequest) {
      memexProjectItem = this.addMemexItemFromSuggestion(
        itemCreateData.contentType,
        itemCreateData.content.repositoryId,
        itemCreateData.content.id,
        itemCreateData.memexProjectColumnValues,
      )
    } else {
      throw Error('Cannot add redacted item')
    }
    this.log(`Adding item ${this.getItemTitle(memexProjectItem)}`)
    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.ProjectItemCreate,
    })
    return {memexProjectItem, memexProjectColumn: null}
  }

  public async bulkAddItems(request: BulkAddMemexItemsRequest): Promise<BulkAddMemexItemsResponse> {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    this.log(`Bulk adding ${request} to project`)
    const job = this.db.jobs.performLater(new BulkAddMemexItemsJob(this.server, request))

    return {job: {url: JOB_STATUS_ROUTE_PATH.generateFullPath({jobId: job.id})}, notParsedContent: ''}
  }

  public getById(id: number): MemexItem {
    return this.db.memexItems.byId(id)
  }

  public async update({
    memexProjectItemId: id,
    fieldIds,
    ...payload
  }: IUpdateMemexItemRequest): Promise<UpdateMemexItemResponse> {
    const item = this.db.memexItems.byId(id)
    const previousMemexProjectItemId = payload.previousMemexProjectItemId
    if (previousMemexProjectItemId === '') {
      this.log(`Updating item ${this.getItemTitle(item)} to be at the top of the list`)
      item.priority = 0
      this.db.memexItems.reprioritize(item.id)
      this.server.liveUpdate.queueSocketMessage({
        type: MemexRefreshEvents.ProjectItemUpdate,
      })
    } else if (previousMemexProjectItemId != null) {
      const previousItem = this.getById(previousMemexProjectItemId)
      this.log(`Updating item ${this.getItemTitle(item)} to be after ${this.getItemTitle(previousItem)}`)
      this.db.memexItems.reprioritize(item.id, previousItem.id)
      this.server.liveUpdate.queueSocketMessage({
        type: MemexRefreshEvents.ProjectItemUpdate,
      })
    }

    if (payload.memexProjectColumnValues) {
      if (
        item.contentType === ItemType.DraftIssue &&
        payload.memexProjectColumnValues[0]?.memexProjectColumnId === SystemColumnId.Title &&
        this.isGitHubUrl(payload.memexProjectColumnValues[0].value?.title)
      ) {
        this.log(`Converting URL ${this.getItemTitle(item)} to an existing GitHub issue`)
        this.convertUrlToGitHubIssue(item)
      } else {
        this.log(
          `Updating item ${this.getItemTitle(item)} with changes ${JSON.stringify(payload.memexProjectColumnValues)}`,
        )

        const repository = item.memexProjectColumnValues.find(
          col => col.memexProjectColumnId === SystemColumnId.Repository,
        )?.value as ExtendedRepository

        const milestones = repository ? this.db.milestones.byRepositoryId(repository.id) : []
        const issueTypes = repository ? this.db.issueTypes.byRepositoryId(repository.id) : []

        for (const columnValue of payload.memexProjectColumnValues) {
          updateColumnValue(
            item,
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
    }
    await this.server.sleep()

    item.memexProjectColumnValues = item.memexProjectColumnValues.filter(column =>
      fieldIds.includes(column.memexProjectColumnId),
    )
    return {memexProjectItem: this.withoutExtendedContent(item)}
  }

  public async remove(request: RemoveMemexItemRequest): Promise<IRemoveMemexItemResponse> {
    if ('q' in request) {
      const job = this.db.jobs.performLater(new BulkDeleteMemexItemsJob(this.server, request))
      return {job: {url: JOB_STATUS_ROUTE_PATH.generateFullPath({jobId: job.id})}}
    }

    const {memexProjectItemIds} = request
    if (memexProjectItemIds.length === 0) {
      this.log('No items to remove.')
    } else if (memexProjectItemIds.length === 1) {
      const index = this.db.memexItems.all().findIndex(item => item.id === memexProjectItemIds[0])
      const item = not_typesafe_nonNullAssertion(this.db.memexItems.all().splice(index, 1)[0])
      this.log(`Removing item ${this.getItemTitle(item)} `)
      this.server.liveUpdate.queueSocketMessage({
        type: MemexRefreshEvents.ProjectItemDestroy,
      })
    } else if (memexProjectItemIds.length > 10) {
      const job = this.db.jobs.performLater(new BulkDeleteMemexItemsJob(this.server, request))
      return {job: {url: JOB_STATUS_ROUTE_PATH.generateFullPath({jobId: job.id})}}
    } else {
      this.log(`Removing ${memexProjectItemIds.length} items ...`)
      for (const id of memexProjectItemIds) {
        const index = this.db.memexItems.all().findIndex(item => item.id === id)
        const item = not_typesafe_nonNullAssertion(this.db.memexItems.all().splice(index, 1)[0])
        this.log(`Removing item ${this.getItemTitle(item)}`)
      }
      this.server.liveUpdate.queueSocketMessage({
        type: MemexRefreshEvents.ProjectItemDestroy,
      })
    }
  }

  public convertToIssue({
    memexProjectItemId,
    repositoryId,
  }: ConvertDraftItemToIssueRequest): ConvertDraftItemToIssueResponse {
    const index = this.db.memexItems.all().findIndex(item => item.id === memexProjectItemId)
    const draftItem = not_typesafe_nonNullAssertion(this.db.memexItems.all().splice(index, 1)[0])
    const repository = this.db.repositories.byId(repositoryId)

    const response = generateConvertToIssueResponse(draftItem, repository)

    this.db.memexItems.all().splice(index, 0, response.memexProjectItem)

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.ProjectItemUpdate,
    })
    return response
  }

  public archiveItems({memexProjectItemIds}: ArchiveMemexItemRequest): ArchiveMemexItemResponse {
    if (memexProjectItemIds.length === 0) {
      this.log('No items to archive.')
    } else {
      this.log(`Archiving ${memexProjectItemIds.length} items ...`)
      const items = this.db.memexItems.getActive()
      const archivedBy = getUser('glortho')
      for (const id of memexProjectItemIds) {
        const index = items.findIndex(item => item.id === id)
        const itemAtIndex = not_typesafe_nonNullAssertion(items[index])

        if (itemAtIndex.contentType === ItemType.RedactedItem) {
          this.log(
            `Ignoring received item ${this.getItemTitle(itemAtIndex)} as it is of type ${itemAtIndex.contentType}`,
          )
        } else {
          this.log(`Archiving item ${this.getItemTitle(itemAtIndex)}`)
          this.db.memexItems.archive(itemAtIndex.id, archivedBy)
        }
      }
    }

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.ProjectItemUpdate,
    })
  }

  public async getArchivedItems({
    perPage = 500,
    visibleFields,
  }: GetArchivedMemexItemsRequest): Promise<GetArchivedMemexItemsResponse> {
    const memexProjectItems = this.db.memexItems.getArchived().sort((a, b) => {
      return archivedAtComparator(
        {id: a.id, archivedAt: a.archived?.archivedAt},
        {id: b.id, archivedAt: b.archived?.archivedAt},
      )
    })

    const visibleFieldIds = new Set(visibleFields)

    return {
      totalCount: memexProjectItems.length,
      memexProjectItems: memexProjectItems.slice(0, perPage).map(item => ({
        ...item,
        memexProjectColumnValues: item.memexProjectColumnValues.filter(column => {
          return visibleFieldIds.has(column.memexProjectColumnId)
        }),
      })),
    }
  }

  public async getPaginatedItems({
    after,
    secondaryAfter,
    before,
    first = 100,
    q,
    sortedBy,
    scope,
    horizontalGroupedByColumnId,
    verticalGroupedByColumnId,
    verticalGroupedByGroupValue,
    groupedByGroupValue,
    sliceByColumnId,
    sliceByValue,
  }: GetPaginatedItemsRequest): Promise<GetPaginatedItemsResponse> {
    const collationParams = q || sortedBy ? {columns: this.db.columns.all(), q, sortedBy} : undefined
    let filteredItems: Array<MemexItem>
    let slices: Array<SliceData> | undefined = undefined

    switch (scope) {
      case 'all':
        filteredItems = this.db.memexItems.all(collationParams)
        break
      case 'archived':
        // This returns archived _and_ unarchived items to better mock the eventually consistent nature
        // of the production server: recently restored items may still be marked 'archived' in Elasticsearch.
        // See https://github.com/github/github/pull/285610#discussion_r1305888783
        filteredItems = this.db.memexItems.all(q ? {columns: this.db.columns.all(), q} : undefined).sort((a, b) => {
          return archivedAtComparator(
            {id: a.id, archivedAt: a.archived?.archivedAt},
            {id: b.id, archivedAt: b.archived?.archivedAt},
          )
        })
        break
      case 'unarchived':
      case undefined:
        filteredItems = this.db.memexItems.getActive(collationParams)
        break
      default:
        assertNever(scope)
    }

    if (sliceByColumnId) {
      const column = this.db.columns.byId(sliceByColumnId)

      if (sliceByValue) {
        const normalizedFieldName = normalizeToFilterName(column.name)
        const query =
          sliceByValue === '_noValue' ? `no:${normalizedFieldName}` : `${normalizedFieldName}:"${sliceByValue}"`
        filteredItems = this.db.memexItems.collateItems(filteredItems, {
          columns: this.db.columns.all(),
          q: query,
        })
      } else {
        slices = buildSlices(filteredItems, column)
      }
    }

    // Table grouped by
    if (horizontalGroupedByColumnId && !verticalGroupedByColumnId) {
      const field = this.db.columns.byId(horizontalGroupedByColumnId)

      if (field) {
        return buildPaginatedGroups({
          ungroupedItems: filteredItems,
          field,
          slices,
          before,
          after,
          groupedByGroupValue,
        })
      }
    }

    // Board view
    if (verticalGroupedByColumnId) {
      const field = this.db.columns.byId(verticalGroupedByColumnId)

      if (field) {
        // If vertical and horizontal parameters are provided,
        // use horizontal as a secondary column
        const secondaryField = horizontalGroupedByColumnId
          ? this.db.columns.byId(horizontalGroupedByColumnId)
          : undefined
        return buildPaginatedGroups({
          ungroupedItems: filteredItems,
          field,
          secondaryField,
          slices,
          before,
          after,
          secondaryAfter,
          groupedByGroupValue: verticalGroupedByGroupValue,
          groupedBySecondaryGroupValue: groupedByGroupValue,
        })
      }
    }

    const {nodes, pageInfo} = sliceNodesAndBuildPageInfo(filteredItems, after, before, first)

    return {
      nodes,
      pageInfo,
      totalCount: {
        // Treat 4,000 items as the threshold for determining whether or not to approximate the totalCount
        value: filteredItems.length <= 4000 ? filteredItems.length : Math.floor(filteredItems.length / 1000) * 1000,
        isApproximate: filteredItems.length > 4000,
      },
      slices,
    }
  }

  public unarchiveItems(request: UnarchiveMemexItemRequest): UnarchiveMemexItemResponse {
    if ('q' in request) {
      const job = this.db.jobs.performLater(new BulkUnarchiveMemexItemsJob(this.server, request))
      return {job: {url: JOB_STATUS_ROUTE_PATH.generateFullPath({jobId: job.id})}}
    }

    const {memexProjectItemIds} = request
    if (memexProjectItemIds.length === 0) {
      this.log('No items to unarchive.')
    } else if (memexProjectItemIds.length > 10) {
      const job = this.db.jobs.performLater(new BulkUnarchiveMemexItemsJob(this.server, request))
      return {job: {url: JOB_STATUS_ROUTE_PATH.generateFullPath({jobId: job.id})}}
    } else {
      this.log(`Unarchiving ${memexProjectItemIds.length} items ...`)
      const archivedItems = this.db.memexItems.getArchived()
      if (archivedItems.length === 0) {
        this.log('No items in archive.')
      }
      for (const id of memexProjectItemIds) {
        const archivedItem = archivedItems.find(item => item.id === id)
        if (!archivedItem) {
          this.log(`Tried to restore item ID ${id} but it was not found in the archive, ignoring restoration`)
        } else if (archivedItem.contentType === ItemType.RedactedItem) {
          this.log(
            `Ignoring received item ${this.getItemTitle(archivedItem)} as it is of type ${archivedItem.contentType}`,
          )
        } else {
          this.log(`Unarchiving item ${this.getItemTitle(archivedItem)}`)
          this.db.memexItems.unarchive(archivedItem.id)
        }
      }
      this.server.liveUpdate.queueSocketMessage({
        type: MemexRefreshEvents.ProjectItemUpdate,
      })
    }
  }

  public async getArchiveStatus(): Promise<GetArchiveStatusResponse> {
    const numberOfArchivedItems = this.db.memexItems.getArchived().length

    return {
      totalCount: numberOfArchivedItems,
      isArchiveFull: numberOfArchivedItems >= MAX_ARCHIVED_ITEMS,
      archiveLimit: MAX_ARCHIVED_ITEMS,
    }
  }

  public async getSuggestedAssignees({
    memexProjectItemId,
  }: IGetSuggestedAssigneesRequest): Promise<GetSuggestedAssigneesResponse> {
    const memexItem = this.db.memexItems.byId(memexProjectItemId)
    this.log(`Getting suggested assignees for ${this.getItemTitle(memexItem)}`)
    const currentAssignees =
      (memexItem.memexProjectColumnValues.find(col => col.memexProjectColumnId === SystemColumnId.Assignees)
        ?.value as Array<IAssignee>) || []
    await this.server.sleep()
    const suggestions = this.db.assignees.all().map(assignee => {
      return {
        ...assignee,
        selected: currentAssignees.findIndex(currentAssignee => currentAssignee.id === assignee.id) !== -1,
      }
    })
    return {suggestions}
  }

  public async getSuggestedLabels({
    memexProjectItemId,
  }: IGetSuggestedLabelsRequest): Promise<GetSuggestedLabelsResponse> {
    const memexItem = this.db.memexItems.byId(memexProjectItemId)
    this.log(`Getting suggested labels for ${this.getItemTitle(memexItem)}`)

    if (memexItem.contentType === ItemType.DraftIssue) {
      throw new Error("Suggested labels aren't supported for draft issues.")
    }

    const currentLabels =
      (memexItem.memexProjectColumnValues.find(col => col.memexProjectColumnId === SystemColumnId.Labels)
        ?.value as Array<Label>) || []
    await this.server.sleep()
    const suggestions = this.db.labels.all().map(label => {
      return {...label, selected: currentLabels.findIndex(currentLabel => currentLabel.id === label.id) !== -1}
    })
    return {suggestions}
  }

  public async getSuggestedMilestones({
    memexProjectItemId,
  }: IGetSuggestedMilestonesRequest): Promise<GetSuggestedMilestonesResponse> {
    const memexItem = this.db.memexItems.byId(memexProjectItemId)
    this.log(`Getting suggested milestones for ${this.getItemTitle(memexItem)}`)
    const currentMilestone = memexItem.memexProjectColumnValues.find(
      col => col.memexProjectColumnId === SystemColumnId.Milestone,
    )?.value as Milestone
    await this.server.sleep()

    const repository = memexItem.memexProjectColumnValues.find(
      col => col.memexProjectColumnId === SystemColumnId.Repository,
    )?.value as ExtendedRepository

    const milestones = this.db.milestones.byRepositoryId(repository.id)

    const suggestions = milestones.map(milestone => {
      return {
        ...milestone,
        selected: currentMilestone ? currentMilestone.id === milestone.id : false,
      }
    })
    return {suggestions}
  }

  public async getSuggestedIssueTypes({
    memexProjectItemId,
  }: IGetSuggestedIssueTypesRequest): Promise<GetSuggestedIssueTypesResponse> {
    const memexItem = this.db.memexItems.byId(memexProjectItemId)
    this.log(`Getting suggested types for ${this.getItemTitle(memexItem)}`)
    const currentIssueType = memexItem.memexProjectColumnValues.find(
      col => col.memexProjectColumnId === SystemColumnId.IssueType,
    )?.value as IssueType
    await this.server.sleep()

    const repository = memexItem.memexProjectColumnValues.find(
      col => col.memexProjectColumnId === SystemColumnId.Repository,
    )?.value as ExtendedRepository

    const issueTypes = this.db.issueTypes.byRepositoryId(repository.id)

    const suggestions = issueTypes.map(issueType => {
      return {
        ...issueType,
        selected: currentIssueType ? currentIssueType.id === currentIssueType.id : false,
      }
    })
    return {suggestions}
  }

  public async getItemsTrackedByParent(
    _opts: IGetItemsTrackedByParentRequest,
  ): Promise<GetItemsTrackedByParentResponse> {
    const items = TrackedByParent
    const count = items.length
    const parentCompletion = {total: 2, completed: 1, percent: 50}
    return {items, count, parentCompletion}
  }

  /**
   * This method converts a repository item into a title value for the item
   * based on the repository item's content type.
   *
   * @param item draft Memex Item to replace with a GitHub issue/PR
   * @returns the title value for the item
   */
  private getTitleValue(item: RepositoryItem) {
    const title = {raw: item.title, html: item.title}
    const other = {number: item.number, url: '', state: item.state}

    if (item.type === ItemType.PullRequest) {
      return {...other, title, isDraft: false, issueId: item.id}
    }

    if (item.type === ItemType.Issue) {
      return {...other, issueId: item.id, title}
    }

    return {...other, title}
  }

  /**
   * This method converts a draft issue - where the text is a GitHub-like
   * URL - into a random issue or PR from the available items in the mock data.
   *
   * @param item draft Memex Item to replace with a GitHub issue/PR
   */
  private convertUrlToGitHubIssue(item: MemexItem) {
    const repository = this.db.repositories.getRandom()
    const mockRepositoryItem = this.db.repositoryItems.getRandom()

    const newColumnValues = [...item.memexProjectColumnValues]
    const titleData: MemexColumnData = {
      memexProjectColumnId: SystemColumnId.Title,
      value: this.getTitleValue(mockRepositoryItem),
    }

    const repositoryData: MemexColumnData = {
      memexProjectColumnId: SystemColumnId.Repository,
      value: repository,
    }
    const titleColumnIndex = newColumnValues.findIndex(value => value.memexProjectColumnId === SystemColumnId.Title)
    if (titleColumnIndex !== -1) {
      newColumnValues.splice(titleColumnIndex, 1, titleData)
    } else {
      newColumnValues.push(titleData)
    }

    const repositoryColumnIndex = newColumnValues.findIndex(
      value => value.memexProjectColumnId === SystemColumnId.Repository,
    )
    if (repositoryColumnIndex !== -1) {
      newColumnValues.splice(repositoryColumnIndex, 1, repositoryData)
    } else {
      newColumnValues.push(repositoryData)
    }

    item.contentType = mockRepositoryItem.type
    item.content = {
      id: mockRepositoryItem.id,
      url: '',
      ...(mockRepositoryItem.type === 'Issue' && {globalRelayId: ''}),
    }
    item.memexProjectColumnValues = newColumnValues

    const updateData: Array<ColumnUpdateData> = []
    updateData.push({
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [this.db.assignees.getRandom().id],
    })

    for (const columnValue of updateData) {
      updateColumnValue(
        item,
        columnValue,
        this.db.columns.all(),
        this.db.labels.all(),
        this.db.assignees.all(),
        this.db.milestones.byRepositoryId(repository.id),
        this.db.issueTypes.byRepositoryId(repository.id),
        this.db.parentIssues.all(),
        this.db.trackedBy,
        this.server.liveUpdate,
      )
    }
  }

  private isGitHubUrl(str: string | undefined) {
    if (!str) return false
    try {
      const url = new URL(str)
      return url.hostname === 'github.com'
    } catch (_) {
      return false
    }
  }

  // Ensures we only return the id field for draft issue content
  private withoutExtendedContent(item: MemexItem): MemexItem {
    if (item.contentType === ItemType.DraftIssue) {
      return {
        ...item,
        content: {
          id: item.content.id,
        },
      }
    }

    return item
  }

  public override errorHandlers = [
    createRequestHandlerWithError('post', 'memex-item-create-api-data', 'Failed to add new item'),
    createRequestHandlerWithError('post', 'memex-item-create-bulk-api-data', 'Failed to add new items'),
    createRequestHandlerWithError('put', 'memex-item-update-bulk-api-data', 'Failed to update items'),
    createRequestHandlerWithError('put', 'memex-item-update-api-data', 'Failed to update item'),
    createRequestHandlerWithError('delete', 'memex-item-delete-api-data', 'Failed to delete item(s)'),
    createRequestHandlerWithError('post', 'memex-item-archive-api-data', 'Failed to archive item(s)'),
    createRequestHandlerWithError('put', 'memex-item-unarchive-api-data', 'Failed to unarchive item(s)'),
    createRequestHandlerWithError(
      'get',
      'memex-item-suggested-assignees-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to assign users'],
      },
      403,
    ),
    createRequestHandlerWithError(
      'get',
      'memex-item-suggested-labels-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to label items'],
      },
      403,
    ),
    createRequestHandlerWithError(
      'get',
      'memex-item-suggested-milestones-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to set milestones'],
      },
      403,
    ),
    createRequestHandlerWithError(
      'get',
      'memex-item-suggested-issue-types-api-data',
      {
        code: 'Forbidden',
        errors: ['User does not have permission to set types'],
      },
      403,
    ),
    createRequestHandlerWithError('get', 'memex-tracked-by-api-data', 'Failed to get tracked by data'),
  ]

  public override handlers = [
    get_getArchivedItems((_body, req) => {
      const url = new URL(req.url)
      const perPage = url.searchParams.get(PER_PAGE_PARAM) ?? '500'
      const visibleFieldIds = getVisibleFieldIds(url.searchParams)
      return this.getArchivedItems({
        perPage: parseInt(perPage, 10),
        visibleFields: visibleFieldIds,
      })
    }),
    get_getArchiveStatus(async _body => {
      return this.getArchiveStatus()
    }),
    post_addMemexItem(async body => {
      return this.add(body)
    }),
    post_bulkAddMemexItems(async body => {
      const response = await this.bulkAddItems(body)
      // simulate bulk adding 25 items from a repository which contains 28 items, so that on the next
      // get request only 3 remaining items are returned instead of all of them
      if (this.db.repositoryItems.getManyItems().length > 25) {
        this.db.repositoryItems.removeAddedItems()
      }
      return response
    }),
    get_getMemexItem(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const memexProjectItemId = not_typesafe_nonNullAssertion(params.get('memexProjectItemId'))
      return this.getItem({memexProjectItemId: parseInt(memexProjectItemId, 10)})
    }),
    put_updateMemexItem(async body => {
      return this.update(body)
    }),
    delete_destroyMemexItem(async body => {
      return this.remove(body)
    }),
    post_convertDraftItem(async body => {
      return this.convertToIssue(body)
    }),
    post_archiveMemexItem(async body => {
      return this.archiveItems(body)
    }),
    put_unarchiveMemexItem(async body => {
      return this.unarchiveItems(body)
    }),
    get_getSuggestedAssigneesForMemexItem(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const memexProjectItemId = not_typesafe_nonNullAssertion(params.get('memexProjectItemId'))
      return this.getSuggestedAssignees({memexProjectItemId: parseInt(memexProjectItemId, 10)})
    }),
    get_getSuggestedLabelsForMemexItem(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const memexProjectItemId = not_typesafe_nonNullAssertion(params.get('memexProjectItemId'))
      return this.getSuggestedLabels({memexProjectItemId: parseInt(memexProjectItemId, 10)})
    }),
    get_getSuggestedMilestonesForMemexItem(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const memexProjectItemId = not_typesafe_nonNullAssertion(params.get('memexProjectItemId'))
      return this.getSuggestedMilestones({memexProjectItemId: parseInt(memexProjectItemId, 10)})
    }),
    get_getSuggestedIssueTypesForMemexItem(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const memexProjectItemId = not_typesafe_nonNullAssertion(params.get('memexProjectItemId'))
      return this.getSuggestedIssueTypes({memexProjectItemId: parseInt(memexProjectItemId, 10)})
    }),
    get_getItemsTrackedByParent(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const issueId = not_typesafe_nonNullAssertion(params.get('issueId'))
      return this.getItemsTrackedByParent({issueId: parseInt(issueId, 10)})
    }),
    get_getPaginatedItems((_body, req) => {
      const params = new URL(req.url).searchParams
      const after = params.get(AFTER_PARAM) || undefined
      const secondaryAfter = params.get(SECONDARY_AFTER_PARAM) || undefined
      const before = params.get(BEFORE_PARAM) || undefined
      const firstString = params.get(FIRST_PARAM)
      const first = firstString ? parseInt(firstString, 10) : undefined
      const q = params.get(Q_PARAM) || undefined
      const scope = (params.get(SCOPE_PARAM) as PaginatedItemsScope | null) || undefined
      const sortedByColumnId = params.getAll(SORTED_BY_COLUMN_ID_KEY)
      const sortedByDirection = params.getAll(SORTED_BY_COLUMN_DIRECTION_KEY)
      let sortedBy: Array<{columnId: number; direction: 'asc' | 'desc'}> | undefined = undefined

      if (sortedByColumnId.length) {
        sortedBy = []
        for (let i = 0; i < sortedByColumnId.length; i++) {
          const columnId = sortedByColumnId[i]
          // Explicitly narrow down to 'desc' or 'asc'
          const direction = sortedByDirection[i] === 'desc' ? 'desc' : 'asc'

          if (columnId) {
            sortedBy.push({columnId: parseInt(columnId), direction})
          }
        }
      }

      const horizontalGroupedByColumnIdAsString = params.get(HORIZONTAL_GROUPED_BY_COLUMN_KEY)
      const horizontalGroupedByColumnId = horizontalGroupedByColumnIdAsString
        ? stringToSyntheticId(horizontalGroupedByColumnIdAsString)
        : undefined
      const verticalGroupedByColumnIdAsString = params.get(VERTICAL_GROUPED_BY_COLUMN_KEY)
      const verticalGroupedByColumnId = verticalGroupedByColumnIdAsString
        ? stringToSyntheticId(verticalGroupedByColumnIdAsString)
        : undefined
      const groupedByGroupValue = params.get(HORIZONTAL_GROUPED_BY_COLUMN_VALUE_KEY) || undefined
      const verticalGroupedByGroupValue = params.get(VERTICAL_GROUPED_BY_COLUMN_VALUE_KEY) || undefined

      const sliceByColumnIdAsString = params.get(SLICE_BY_COLUMN_ID_KEY)
      const sliceByColumnId = sliceByColumnIdAsString ? stringToSyntheticId(sliceByColumnIdAsString) : undefined
      const sliceByValue = params.get(SLICE_VALUE_KEY) || undefined

      return this.getPaginatedItems({
        after,
        secondaryAfter,
        before,
        first,
        q,
        sortedBy,
        scope,
        horizontalGroupedByColumnId,
        verticalGroupedByColumnId,
        groupedByGroupValue,
        verticalGroupedByGroupValue,
        sliceByColumnId,
        sliceByValue,
      })
    }),
    post_resyncElasticsearchIndex(async () => {
      return {
        job: {
          url: 'http://localhost:3000/-/jobs/1',
        },
      }
    }),
    put_bulkUpdateMemexItems(async ({memexProjectItems, fieldIds}) => {
      const results = await Promise.all(
        memexProjectItems.map(({id, memexProjectColumnValues}) =>
          this.update({memexProjectItemId: id, memexProjectColumnValues, fieldIds}),
        ),
      )
      return {
        totalUpdatedItems: results.length,
        memexProjectItems: results.map(({memexProjectItem}) => memexProjectItem),
      }
    }),
  ]
}

function getVisibleFieldIds(searchParams: URLSearchParams): Array<SystemColumnId | number> {
  const param = searchParams.get(VISIBLE_FIELDS_PARAM)
  if (param) {
    return JSON.parse(param) as Array<SystemColumnId | number>
  }
  return [SystemColumnId.Title]
}
