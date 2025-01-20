import {useCallback} from 'react'

import {Resources} from '../../../client/strings'
import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {MemexItem} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import type {SuggestedRepository} from '../../api/repository/contracts'
import {DraftConvertDroppedAssignee} from '../../api/stats/contracts'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useApiRequest} from '../../hooks/use-api-request'
import type {DraftIssueModel, MemexItemModel} from '../../models/memex-item-model'
import {useConvertToIssue} from '../../state-providers/memex-items/use-convert-to-issue'
import useToasts, {ToastType} from '../toasts/use-toasts'

function getIssueNumber(item: MemexItem): number | null {
  const titleColumn = item.memexProjectColumnValues.find(column => column.memexProjectColumnId === SystemColumnId.Title)
  if (!titleColumn) {
    return null
  }

  if (titleColumn.memexProjectColumnId !== SystemColumnId.Title) {
    // re-check the column id to get better type inference
    return null
  }

  if ('isDraft' in titleColumn.value) {
    // we have a pull request item, return early
    return null
  }

  if ('number' in titleColumn.value) {
    // we have an issue title, return the found value
    return titleColumn.value.number
  }

  // draft issues are ignored
  return null
}

function getRepositoryNameWithOwner(item: MemexItem): string | null {
  const repositoryColumn = item.memexProjectColumnValues.find(
    column => column.memexProjectColumnId === SystemColumnId.Repository,
  )
  if (!repositoryColumn) {
    return null
  }

  if (repositoryColumn.memexProjectColumnId !== SystemColumnId.Repository) {
    // re-check the column id to get better type inference
    return null
  }

  if (!repositoryColumn.value) {
    // no guarantees we have a repository here
    return null
  }

  return repositoryColumn.value.nameWithOwner
}

function isDraftIssueModel(memexItem: MemexItemModel): memexItem is DraftIssueModel {
  return memexItem.contentType === ItemType.DraftIssue
}

interface ConvertToIssueRequest {
  memexProjectItem: MemexItemModel
  repositoryId: number
}

export const useConvertToIssueHook = (onComplete?: () => void) => {
  const {addToast} = useToasts()
  const {postStats} = usePostStats()
  const {convertToIssue} = useConvertToIssue()

  const convertToIssueRequest = useCallback(
    async ({memexProjectItem: item, repositoryId}: ConvertToIssueRequest) => {
      if (isDraftIssueModel(item)) {
        const {memexProjectItem, warnings} = await convertToIssue(item.id, repositoryId)

        const invalidAssigneeLogins = warnings?.invalidAssigneeLogins ?? []
        if (invalidAssigneeLogins.length > 0) {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            message: Resources.unableToAssignUsersToConvertedIssue(invalidAssigneeLogins),
            type: ToastType.error,
          })
          postStats({
            name: DraftConvertDroppedAssignee,
            context: invalidAssigneeLogins.length,
            memexProjectItemId: memexProjectItem.id,
          })
        }

        const issueNumber = getIssueNumber(memexProjectItem)
        const nameWithOwner = getRepositoryNameWithOwner(memexProjectItem)

        if (issueNumber && nameWithOwner) {
          onComplete?.()
        }
      }
    },
    [convertToIssue, addToast, postStats, onComplete],
  )

  const {perform: performConvertToIssue, status: convertToIssueStatus} = useApiRequest<ConvertToIssueRequest>({
    request: convertToIssueRequest,
  })

  const startConvertToIssueFlow = useCallback(
    async (item: MemexItemModel, repository: SuggestedRepository) => {
      await performConvertToIssue({
        memexProjectItem: item,
        repositoryId: repository.id,
      })
    },
    [performConvertToIssue],
  )

  return {start: startConvertToIssueFlow, status: convertToIssueStatus}
}
