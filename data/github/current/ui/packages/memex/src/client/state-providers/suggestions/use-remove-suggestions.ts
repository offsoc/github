import {useCallback} from 'react'

import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {useFindMemexItem} from '../memex-items/use-find-memex-item'
import {useSuggestionsStableContext} from './use-suggestions-stable-context'

type RemoveSuggestionsHookReturnType = {
  /**
   * Makes a request to the server to remove a list of items from the project
   * and removes them from the client-side state of items
   * @param itemIds The ids of the items for which the suggestions should be removed
   */
  removeSuggestions: (itemIds: Array<number | SidePanelItem>) => void
}

export const useRemoveSuggestions = (): RemoveSuggestionsHookReturnType => {
  const context = useSuggestionsStableContext()
  const {findMemexItem} = useFindMemexItem()
  const removeSuggestions = useCallback(
    (items: Array<number | SidePanelItem>) => {
      context.removeSuggestions(
        items
          .map(item => {
            if (typeof item === 'number') {
              return findMemexItem(item)?.getSuggestionsCacheKey()
            }
            return item.getSuggestionsCacheKey()
          })
          .filter(id => id?.length) as Array<string>,
      )
    },
    [context, findMemexItem],
  )

  return {removeSuggestions}
}
