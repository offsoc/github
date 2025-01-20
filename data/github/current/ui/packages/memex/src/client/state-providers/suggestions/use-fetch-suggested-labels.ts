import {useCallback} from 'react'

import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {apiGetSuggestedLabels} from '../../api/memex-items/api-get-suggested-labels'
import type {SuggestedLabel} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {apiSidePanelGetSuggestedLabelsForItem} from '../../api/side-panel/api-side-panel-get-suggestions'
import {ItemKeyType} from '../../api/side-panel/contracts'
import {useSetColumnValue} from '../column-values/use-set-column-value'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {makeApiCall} from './suggestions-state-provider'
import {useSuggestionsContext} from './use-suggestions-context'

type FetchSuggestedLabelsHookType = {
  /**
   * Fetches the suggested labels from the server for a given item.
   * Updates the item's labels column with the suggested labels that are marked
   * as selected.
   * @returns A promise that resolves to an array of suggested labels.
   * @param memexItemId The id of the item to fetch the suggested labels for.
   */
  fetchSuggestedLabels: (model: SidePanelItem) => Promise<Array<SuggestedLabel> | Error | undefined>
}

export const useFetchSuggestedLabels = (): FetchSuggestedLabelsHookType => {
  const {findMemexItem} = useFindMemexItem()
  const {setColumnValue} = useSetColumnValue()
  const {getSuggestedLabelsForItem, setSuggestedLabelsForItem} = useSuggestionsContext()

  const fetchSuggestedLabels = useCallback(
    async (model: SidePanelItem) => {
      const suggestionId = model.getSuggestionsCacheKey()
      const labels = getSuggestedLabelsForItem(suggestionId)

      if (!(labels instanceof Error) && labels?.length) {
        return labels
      }

      const {response, error} = await makeApiCall(() => {
        if (model.memexItemId?.()) {
          return apiGetSuggestedLabels({memexProjectItemId: model.memexItemId()})
        } else {
          switch (model.contentType) {
            case ItemType.DraftIssue:
              return apiSidePanelGetSuggestedLabelsForItem({
                kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
                projectItemId: model.id,
              })
            case ItemType.Issue:
              return apiSidePanelGetSuggestedLabelsForItem({
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
          memexProjectColumnId: SystemColumnId.Labels,
          value:
            response?.suggestions
              .filter(suggestedLabel => suggestedLabel.selected)
              .sort((a, b) => a.name.localeCompare(b.name)) || null,
        })
      }

      const result = response?.suggestions ?? error

      setSuggestedLabelsForItem(suggestionId, result)

      return result
    },
    [getSuggestedLabelsForItem, setSuggestedLabelsForItem, findMemexItem, setColumnValue],
  )

  return {fetchSuggestedLabels}
}
