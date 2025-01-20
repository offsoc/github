import {noop} from '@github-ui/noop'
import {type PropsWithChildren, createContext, useContext, useMemo, useState} from 'react'

export type SearchContextProps = {
  isSearching: boolean
  setIsSearching: (bool: boolean) => void
  refetchOnSearch: boolean
  setRefetchOnSearch: (bool: boolean) => void
}

const SearchContext = createContext<SearchContextProps>({
  isSearching: false,
  setIsSearching: noop,
  refetchOnSearch: false,
  setRefetchOnSearch: noop,
})

export const ItemPickerLabelsSearchProvider = ({children}: PropsWithChildren) => {
  const [isSearching, setIsSearching] = useState(false)
  const [refetchOnSearch, setRefetchOnSearch] = useState(false)
  const contextProps = useMemo(
    () =>
      ({
        isSearching,
        setIsSearching,
        refetchOnSearch,
        setRefetchOnSearch,
      }) satisfies SearchContextProps,
    [isSearching, refetchOnSearch],
  )
  return <SearchContext.Provider value={contextProps}>{children}</SearchContext.Provider>
}

export const useItemPickerLabelsSearch = () => {
  return useContext(SearchContext)
}
