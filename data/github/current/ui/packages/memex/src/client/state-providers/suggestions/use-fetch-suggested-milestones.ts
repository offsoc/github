import {useCallback} from 'react'

import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {apiGetSuggestedMilestones} from '../../api/memex-items/api-get-suggested-milestones'
import type {SuggestedMilestone} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {apiSidePanelGetSuggestedMilestonesForItem} from '../../api/side-panel/api-side-panel-get-suggestions'
import {ItemKeyType} from '../../api/side-panel/contracts'
import {useSetColumnValue} from '../column-values/use-set-column-value'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {makeApiCall} from './suggestions-state-provider'
import {useSuggestionsStableContext} from './use-suggestions-stable-context'

type FetchSuggestedMilestonesHookType = {
  /**
   * Fetches the suggested milestones from the server for a given item.
   * Updates the item's milestone column with the first suggested milestone that is
   * marked as selected.
   * @returns A promise that resolves to an array of suggested milestones.
   * @param memexItemId The id of the item to fetch the suggested milestones for.
   */
  fetchSuggestedMilestones: (model: SidePanelItem) => Promise<Array<SuggestedMilestone> | Error | undefined>
}

export const useFetchSuggestedMilestones = (): FetchSuggestedMilestonesHookType => {
  const {findMemexItem} = useFindMemexItem()
  const {setColumnValue} = useSetColumnValue()
  const {setSuggestedMilestonesForItem} = useSuggestionsStableContext()

  const fetchSuggestedMilestones = useCallback(
    async (model: SidePanelItem) => {
      setSuggestedMilestonesForItem(model.getSuggestionsCacheKey(), undefined)

      const {response, error} = await makeApiCall(() => {
        if (model.memexItemId?.()) {
          return apiGetSuggestedMilestones({memexProjectItemId: model.memexItemId()})
        } else {
          switch (model.contentType) {
            case ItemType.DraftIssue:
              return apiSidePanelGetSuggestedMilestonesForItem({
                kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
                projectItemId: model.id,
              })
            case ItemType.Issue:
              return apiSidePanelGetSuggestedMilestonesForItem({
                kind: ItemKeyType.ISSUE,
                itemId: model.itemId(),
                repositoryId: model.ownerId(),
              })
            default:
              throw new Error(`Unsupported item type: ${model.contentType}`)
          }
        }
      })

      const memexItem = findMemexItem(model.id)

      if (memexItem && !error) {
        setColumnValue(memexItem, {
          memexProjectColumnId: SystemColumnId.Milestone,
          value: response?.suggestions.find(suggestedMilestone => suggestedMilestone.selected),
        })
      }

      const result = response?.suggestions ?? error

      setSuggestedMilestonesForItem(model.getSuggestionsCacheKey(), result)

      return result
    },
    [setSuggestedMilestonesForItem, findMemexItem, setColumnValue],
  )

  return {fetchSuggestedMilestones}
}
