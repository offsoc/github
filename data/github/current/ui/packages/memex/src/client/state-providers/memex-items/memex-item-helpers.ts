import type {ServerDateValue} from '../../api/columns/contracts/date'
import type {RemoteUpdatePayload} from '../../api/columns/contracts/domain'
import type {Iteration, IterationValue} from '../../api/columns/contracts/iteration'
import {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../api/columns/contracts/number'
import type {PersistedOption, SingleSelectValue} from '../../api/columns/contracts/single-select'
import type {MemexColumnData, MemexColumnDataValue} from '../../api/columns/contracts/storage'
import type {EnrichedText} from '../../api/columns/contracts/text'
import type {ExtendedRepository, IssueType, Label, LinkedPullRequest, Milestone, User} from '../../api/common-contracts'
import type {TrackedByItem} from '../../api/issues-graph/contracts'
import type {
  IssueContent,
  ItemContent,
  MemexItem,
  MemexItemUpdateData,
  PullRequestContent,
  UpdateMemexItemResponseData,
} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import type {ItemCompletion, SidePanelItem} from '../../api/memex-items/side-panel-item'
import {assertNever} from '../../helpers/assert-never'
import {getAllIterationsForConfiguration} from '../../helpers/iterations'
import {isNumber, parseColumnId} from '../../helpers/parsing'
import type {ColumnModel} from '../../models/column-model'
import type {TrackedByColumnModel} from '../../models/column-model/system/tracked-by'
import type {TracksColumnModel} from '../../models/column-model/system/tracks'
import type {MemexItemModel} from '../../models/memex-item-model'
import {getCurrentColumnValueFromModel} from '../column-values/column-value'

function isUserDefinedColumn(memexProjectColumnId: number | SystemColumnId): memexProjectColumnId is number {
  return isNumber(memexProjectColumnId)
}

/**
 * Draft issues do not support all column types (e.g. Milestones)
 *
 * @param memexProjectColumnId    - the column id to update
 * @returns whether the item column is a valid draft issue column or not
 */
export function isValidDraftItemColumn(memexProjectColumnId: number | SystemColumnId) {
  return (
    isUserDefinedColumn(memexProjectColumnId) ||
    memexProjectColumnId === SystemColumnId.Title ||
    memexProjectColumnId === SystemColumnId.Status ||
    memexProjectColumnId === SystemColumnId.Assignees
  )
}

const TRACKING_FIELDS = [MemexColumnDataType.Tracks, MemexColumnDataType.TrackedBy]
function isTrackingField(field: ColumnModel): field is TracksColumnModel | TrackedByColumnModel {
  return TRACKING_FIELDS.some(type => type === field.dataType)
}

export function sidebarFieldsToDisplay(contentType: ItemType, columns: Array<ColumnModel>) {
  switch (contentType) {
    case ItemType.DraftIssue:
      return columns.filter(
        column => column.id !== SystemColumnId.Title && isValidDraftItemColumn(column.id) && !isTrackingField(column),
      )
    case ItemType.Issue:
      return columns.filter(
        column =>
          column.id !== SystemColumnId.Title && column.id !== SystemColumnId.Reviewers && !isTrackingField(column),
      )
    default:
      return []
  }
}

/**
 * Not all issues support all possible content fields (e.g. RedactedItems)
 *
 * @param content - the content of the item to validate
 * @returns whether the content is valid for an issue or pull request or not
 */
export function isIssueOrPullRequestContent(content: ItemContent): content is IssueContent | PullRequestContent {
  return content && 'id' in content && 'url' in content
}

export function buildMemexItemUpdateData(
  contentType: ItemType,
  memexProjectColumnValues: Array<RemoteUpdatePayload> | undefined,
  previousMemexProjectItemId: number | '' | undefined,
): MemexItemUpdateData | undefined {
  if (memexProjectColumnValues && contentType === ItemType.DraftIssue) {
    memexProjectColumnValues = memexProjectColumnValues.filter(item =>
      isValidDraftItemColumn(item.memexProjectColumnId),
    )
  }

  /**
   * When no fields should update, we don't want to send an empty payload.
   */
  if ((!memexProjectColumnValues || memexProjectColumnValues.length === 0) && previousMemexProjectItemId == null) {
    return undefined
  }
  return {previousMemexProjectItemId, memexProjectColumnValues} as MemexItemUpdateData
}

/**
 * Use to convert ColumnData from a MemexItemModel to array of MemexColumnData
 *
 * @param model - The MemexItemModel to convert to MemexColumnData
 * @returns An array of MemexColumnData
 */
export function convertToMemexColumnData(model: MemexItemModel): Array<MemexColumnData> {
  return Object.keys(model.columns).reduce<Array<MemexColumnData>>((acc, id) => {
    const columnId = parseColumnId(id)

    if (!columnId) {
      return acc
    }

    const columnValue = getCurrentColumnValueFromModel(columnId, model)

    if (!columnValue) {
      return acc
    }

    return [...acc, columnValue]
  }, [])
}

/**
 *
 * @param field - The field to get the value for
 * @param itemColumnValueMap - The map of column id to column value
 * @returns
 */
export function getMemexItemContentForField(
  field: ColumnModel,
  itemColumnValueMap: Map<number | SystemColumnId, MemexColumnDataValue>,
  item: SidePanelItem,
):
  | Array<User>
  | EnrichedText
  | Iteration
  | PersistedOption
  | Array<Label>
  | Milestone
  | Array<LinkedPullRequest>
  | ServerDateValue
  | NumericValue
  | ExtendedRepository
  | ItemCompletion
  | Array<TrackedByItem>
  | IssueType
  | undefined {
  const itemColumnValue = itemColumnValueMap.get(field.id)
  switch (field.dataType) {
    case MemexColumnDataType.Assignees: {
      // Will fetch assignees from item store is api response isn't available yet
      const assignees = itemColumnValue ? (itemColumnValue as Array<User>) : item.getAssignees()
      return assignees
    }
    case MemexColumnDataType.Labels: {
      // Will fetch labels from item store is api response isn't available yet
      const labels = itemColumnValue ? (itemColumnValue as Array<Label>) : item.getLabels()
      return labels
    }
    case MemexColumnDataType.Iteration: {
      // since this field is specific to memex items, we can return undefined until have a valid response
      const selectedIterationOptionId = itemColumnValue
        ? (itemColumnValue as IterationValue)
        : (item.getCustomField(field.id) as IterationValue)
      if (!selectedIterationOptionId) return undefined
      const iterationOptions = field.settings.configuration
        ? getAllIterationsForConfiguration(field.settings.configuration)
        : []
      const selectedIterationOption = iterationOptions.find(option => option.id === selectedIterationOptionId.id)
      return selectedIterationOption
    }
    case MemexColumnDataType.Tracks: {
      const completion = itemColumnValue ? (itemColumnValue as ItemCompletion) : item.getCompletion()
      return completion
    }
    case MemexColumnDataType.SingleSelect: {
      // since this field is specific to memex items, we can return undefined until we have a valid response
      const singleSelectValue = itemColumnValue
        ? (itemColumnValue as SingleSelectValue)
        : field.id === SystemColumnId.Status
          ? item.getStatus()
          : item.getCustomField<SingleSelectValue>(field.id)
      if (!singleSelectValue) return undefined
      const selectedOption = field.settings?.options?.find(option => option.id === singleSelectValue.id)
      return selectedOption
    }
    case MemexColumnDataType.Text: {
      // since this field is specific to memex items, we can return undefined until have a valid response
      const textValue = itemColumnValue
        ? (itemColumnValue as EnrichedText)
        : (item.getCustomField(field.id) as EnrichedText)
      return textValue
    }
    case MemexColumnDataType.Milestone: {
      const milestone = itemColumnValue ? (itemColumnValue as Milestone) : item.getMilestone()
      return milestone
    }
    case MemexColumnDataType.LinkedPullRequests: {
      const linkedPullRequest = itemColumnValue
        ? (itemColumnValue as Array<LinkedPullRequest>)
        : item.getLinkedPullRequests()
      return linkedPullRequest
    }
    case MemexColumnDataType.Date: {
      const dateValue = itemColumnValue
        ? (itemColumnValue as ServerDateValue)
        : (item.getCustomField(field.id) as ServerDateValue)
      return dateValue
    }
    case MemexColumnDataType.Number: {
      const numberValue = itemColumnValue
        ? (itemColumnValue as NumericValue)
        : (item.getCustomField(field.id) as NumericValue)
      return numberValue
    }
    case MemexColumnDataType.Repository: {
      const repository = itemColumnValue ? (itemColumnValue as ExtendedRepository) : item.getExtendedRepository()
      return repository
    }
    case MemexColumnDataType.TrackedBy: {
      const trackedBy = itemColumnValue ? (itemColumnValue as Array<TrackedByItem>) : item.getTrackedBy()
      return trackedBy
    }
    case MemexColumnDataType.IssueType: {
      const type = itemColumnValue ? (itemColumnValue as IssueType) : item.getIssueType()
      return type
    }
    default:
      break
  }
}

/**
 * Use to merge the previous state of an item with updated data from a server request
 *
 * @param model - The previous state of the item
 * @param item  - The next state of the item given a live update or the updated item data from as a result of a server request
 * @returns the next state of the item merged with the previous state
 */
export function mergeItemData(model: MemexItemModel, item: MemexItem | UpdateMemexItemResponseData): MemexItem | null {
  const {
    content,
    contentType,
    id,
    memexProjectColumnValues,
    priority,
    updatedAt,
    createdAt,
    issueCreatedAt,
    issueClosedAt,
    state,
    stateReason,
  } = item

  const columnValues = memexProjectColumnValues ?? convertToMemexColumnData(model)
  let contentRepositoryId = model.contentRepositoryId ?? -1
  // If the item has a repository ID, then copy it. This fixes the case where the
  // old item is a draft issue, and the new item is an issue as the result of conversion.
  if ('contentRepositoryId' in item) {
    contentRepositoryId = item.contentRepositoryId
  }
  const newContent = content ?? model.content
  const prevContent = model.content

  switch (contentType) {
    case ItemType.Issue:
    case ItemType.PullRequest: {
      if (!isIssueOrPullRequestContent(newContent)) {
        return null
      }

      return {
        contentType,
        content: {...prevContent, ...newContent},
        contentRepositoryId,
        memexProjectColumnValues: columnValues,
        id,
        priority,
        updatedAt,
        createdAt,
        issueCreatedAt,
        issueClosedAt,
        state,
        stateReason,
      }
    }
    case ItemType.DraftIssue:
      return {
        contentType,
        content: {...prevContent, ...newContent},
        memexProjectColumnValues: columnValues,
        id,
        priority,
        updatedAt,
        createdAt,
      }
    case ItemType.RedactedItem:
      return {
        contentType,
        content: newContent,
        memexProjectColumnValues: columnValues,
        id,
        priority,
        updatedAt,
        createdAt,
      }
    default: {
      assertNever(contentType)
    }
  }
}
