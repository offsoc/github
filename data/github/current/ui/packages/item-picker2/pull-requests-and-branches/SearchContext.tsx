import {noop} from '@github-ui/noop'
import {type PropsWithChildren, createContext, useContext, useMemo, useState} from 'react'

export type SearchContextProps = {
  isSearching: boolean
  setIsSearching: (bool: boolean) => void
}

const SearchContext = createContext<SearchContextProps>({
  isSearching: false,
  setIsSearching: noop,
})

export const ItemPickerPullRequestsAndBranchesSearchProvider = ({children}: PropsWithChildren) => {
  const [isSearching, setIsSearching] = useState(false)
  const contextProps = useMemo(
    () =>
      ({
        isSearching,
        setIsSearching,
      }) satisfies SearchContextProps,
    [isSearching],
  )
  return <SearchContext.Provider value={contextProps}>{children}</SearchContext.Provider>
}

export const useItemPickerPullRequestsAndBranchesSearch = () => {
  return useContext(SearchContext)
}
