import {useCallback} from 'react'

import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {MemexColumnData} from '../../api/columns/contracts/storage'
import {apiGetSuggestedAssignees} from '../../api/memex-items/api-get-suggested-assignees'
import type {SuggestedAssignee} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {apiSidePanelGetSuggestedAssigneesForItem} from '../../api/side-panel/api-side-panel-get-suggestions'
import {ItemKeyType} from '../../api/side-panel/contracts'
import {useSetColumnValue} from '../column-values/use-set-column-value'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {makeApiCall} from './suggestions-state-provider'
import {useSuggestionsStableContext} from './use-suggestions-stable-context'

type FetchSuggestedAssigneesHookType = {
  /**
   * Fetches the suggested assignees from the server for a given item.
   * Updates the item's assignees column with the suggested assignees that are marked
   * as selected.
   * @returns A promise that resolves to an array of suggested assignees.
   * @param memexItemId The id of the item to fetch the suggested assignees for.
   */
  fetchSuggestedAssignees: (model: SidePanelItem) => Promise<Array<SuggestedAssignee> | Error | undefined>
}

export const useFetchSuggestedAssignees = (): FetchSuggestedAssigneesHookType => {
  const {findMemexItem} = useFindMemexItem()
  const {setColumnValue} = useSetColumnValue()
  const {setSuggestedAssigneesForItem} = useSuggestionsStableContext()

  const fetchSuggestedAssignees = useCallback(
    async (model: SidePanelItem) => {
      setSuggestedAssigneesForItem(model.getSuggestionsCacheKey(), undefined)

      const {response, error} = await makeApiCall(() => {
        if (model.memexItemId?.()) {
          return apiGetSuggestedAssignees({memexProjectItemId: model.memexItemId()})
        } else {
          switch (model.contentType) {
            case ItemType.DraftIssue:
              return apiSidePanelGetSuggestedAssigneesForItem({
                kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
                projectItemId: model.id,
              })
            case ItemType.Issue:
              return apiSidePanelGetSuggestedAssigneesForItem({
                kind: ItemKeyType.ISSUE,
                itemId: model.itemId(),
                repositoryId: model.ownerId(),
              })
            default:
              throw new Error(`Unsupported item type: ${model.contentType}`)
          }
        }
      })

      const memexItemModel = findMemexItem(model.id)

      if (memexItemModel && !error) {
        setColumnValue(memexItemModel, {
          memexProjectColumnId: SystemColumnId.Assignees,
          value:
            response?.suggestions
              ?.filter(suggestedAssignee => suggestedAssignee.selected)
              .sort((a, b) => a.login.localeCompare(b.login)) || null,
        } as MemexColumnData)
      }

      const result = response?.suggestions ?? error

      setSuggestedAssigneesForItem(model.getSuggestionsCacheKey(), result)

      return result
    },
    [setSuggestedAssigneesForItem, setColumnValue, findMemexItem],
  )

  return {fetchSuggestedAssignees}
}
