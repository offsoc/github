import {useCallback} from 'react'

import {useSearch} from '../../../components/filter-bar/search-context'

export const useClickToFilter = (key: string, value: string | number) => {
  const {toggleFilter} = useSearch()

  return useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (event.target instanceof HTMLAnchorElement) {
        event.stopPropagation()
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (!event.shiftKey && !event.metaKey) {
        // If the shift or meta key is held, we are assuming the user wants to
        // select multiple cards, in which case filtering would break
        // expectation and cause them to lose their selections.
        toggleFilter(key, value)
      }
    },
    [key, value, toggleFilter],
  )
}
