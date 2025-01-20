import {noop} from '@github-ui/noop'
import {createContext, type ReactNode, useContext, useMemo, useState} from 'react'
import {useLocation} from 'react-router-dom'

type QueryContextType = {
  activeSearchQuery: string
  setActiveSearchQuery: (query: string) => void
}

const QueryContext = createContext<QueryContextType>({
  activeSearchQuery: '',
  setActiveSearchQuery: noop,
})

type QueryContextProviderType = {
  children: ReactNode
}

export function QueryContextProvider({children}: QueryContextProviderType) {
  const {search} = useLocation()
  const urlSearchParams = new URLSearchParams(search)
  const urlQuery = urlSearchParams.get('q') ?? ''
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>(urlQuery)

  const queryContextValue = useMemo<QueryContextType>(() => {
    return {
      activeSearchQuery,
      setActiveSearchQuery,
    }
  }, [activeSearchQuery])

  return <QueryContext.Provider value={queryContextValue}>{children}</QueryContext.Provider>
}

export function useQueryContext() {
  return useContext(QueryContext)
}
