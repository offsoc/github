import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {AssigneesColumnData} from '../../../client/api/columns/contracts/storage'
import type {EnrichedText} from '../../../client/api/columns/contracts/text'
import {type IAssignee, IssueState} from '../../../client/api/common-contracts'
import type {ConvertDraftItemToIssueResponse, MemexItem} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import type {SuggestedRepository} from '../../../client/api/repository/contracts'
import {LIMITED_ACCESS_USER_ID} from '../../../mocks/memex-items'

function getTitleFromDraftIssue(item: MemexItem): EnrichedText {
  if (item.contentType !== ItemType.DraftIssue) {
    throw new Error(`Unable to convert this item to an issue`)
  }

  const titleValue = item.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Title)
  if (!titleValue || titleValue.memexProjectColumnId !== SystemColumnId.Title) {
    throw new Error('Unexpected column found')
  }

  const {title} = titleValue.value

  if (!title) {
    throw new Error(`Title is undefined which is not a valid state`)
  } else if (typeof title === 'string') {
    return {raw: title, html: title}
  } else if ('raw' in title && 'html' in title) {
    return title
  } else {
    throw new Error(`Unexpected payload format for title: ${JSON.stringify(title)}`)
  }
}

function getAssigneesFromDraftIssue(item: MemexItem): Array<IAssignee> | undefined {
  if (item.contentType !== ItemType.DraftIssue) {
    throw new Error(`Unable to convert this item to an issue`)
  }

  const assigneeValue = item.memexProjectColumnValues.find(
    (v): v is AssigneesColumnData => v.memexProjectColumnId === SystemColumnId.Assignees,
  )
  if (!assigneeValue) return

  const assignees = assigneeValue.value
  if (Array.isArray(assignees)) {
    return assignees
  } else if (assignees) {
    throw new Error(`Unexpected payload format for assignees: ${JSON.stringify(assignees)}`)
  }
}

export function generateConvertToIssueResponse(
  draftItem: MemexItem,
  repository: SuggestedRepository,
): ConvertDraftItemToIssueResponse {
  const title = getTitleFromDraftIssue(draftItem)
  const assignees = getAssigneesFromDraftIssue(draftItem)

  let validAssignees: Array<IAssignee> | undefined = assignees
  let invalidAssignees: Array<IAssignee> | undefined = []

  if (assignees && !repository.isPublic) {
    validAssignees = assignees.filter(a => a.id !== LIMITED_ACCESS_USER_ID)
    invalidAssignees = assignees.filter(a => a.id === LIMITED_ACCESS_USER_ID)
  }

  const newItem: MemexItem = {
    contentType: ItemType.Issue,
    content: {
      id: -1,
      url: '',
      globalRelayId: '',
    },
    contentRepositoryId: repository.id,
    id: draftItem.id,
    priority: draftItem.priority,
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value: {title, state: IssueState.Open, number: 12345},
      },
      {
        memexProjectColumnId: SystemColumnId.Repository,
        value: repository,
      },
      {
        memexProjectColumnId: SystemColumnId.Assignees,
        value: validAssignees || [],
      },
    ],
  }

  let response: ConvertDraftItemToIssueResponse = {memexProjectItem: newItem}

  if (invalidAssignees.length > 0) {
    response = {
      ...response,
      warnings: {
        invalidAssigneeLogins: invalidAssignees.map(a => a.login),
      },
    }
  }

  return response
}
