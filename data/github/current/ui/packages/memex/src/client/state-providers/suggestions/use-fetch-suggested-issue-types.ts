import {useCallback} from 'react'

import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {apiGetSuggestedIssueTypes} from '../../api/memex-items/api-get-suggested-issue-types'
import type {SuggestedIssueType} from '../../api/memex-items/contracts'
import {ItemType} from '../../api/memex-items/item-type'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {apiSidePanelGetSuggestedIssueTypesForItem} from '../../api/side-panel/api-side-panel-get-suggestions'
import {ItemKeyType} from '../../api/side-panel/contracts'
import {useSetColumnValue} from '../column-values/use-set-column-value'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {makeApiCall} from './suggestions-state-provider'
import {useSuggestionsStableContext} from './use-suggestions-stable-context'

type FetchSuggestedTypesHookType = {
  /**
   * Fetches the suggested issue types from the server for a given item.
   * Updates the item's issue type column with the suggested issue types that are marked
   * as selected.
   * @returns A promise that resolves to an array of suggested issue types.
   * @param model The model of the item to fetch the suggested issue type for.
   */
  fetchSuggestedIssueTypes: (model: SidePanelItem) => Promise<Array<SuggestedIssueType> | Error | undefined>
}

export const useFetchSuggestedIssueTypes = (): FetchSuggestedTypesHookType => {
  const {findMemexItem} = useFindMemexItem()
  const {setColumnValue} = useSetColumnValue()
  const {setSuggestedIssueTypesForItem} = useSuggestionsStableContext()

  const fetchSuggestedIssueTypes = useCallback(
    async (model: SidePanelItem) => {
      setSuggestedIssueTypesForItem(model.getSuggestionsCacheKey(), undefined)

      const {response, error} = await makeApiCall(() => {
        if (model.memexItemId?.()) {
          return apiGetSuggestedIssueTypes({memexProjectItemId: model.memexItemId()})
        } else {
          switch (model.contentType) {
            case ItemType.Issue:
              return apiSidePanelGetSuggestedIssueTypesForItem({
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
          memexProjectColumnId: SystemColumnId.IssueType,
          value: response?.suggestions.find(suggestedType => suggestedType.selected),
        })
      }

      const result = response?.suggestions ?? error

      setSuggestedIssueTypesForItem(model.getSuggestionsCacheKey(), result)

      return result
    },
    [setSuggestedIssueTypesForItem, setColumnValue, findMemexItem],
  )

  return {fetchSuggestedIssueTypes}
}
