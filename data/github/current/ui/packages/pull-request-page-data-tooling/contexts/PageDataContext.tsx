import type {PropsWithChildren} from 'react'
import {createContext, useContext, useMemo} from 'react'

interface Props {
  basePageDataUrl: string
}

export const PageDataContext = createContext<Props | null>(null)

export function PageDataContextProvider({children, basePageDataUrl}: PropsWithChildren & Props) {
  const value = useMemo(() => ({basePageDataUrl}), [basePageDataUrl])
  return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>
}

export function usePageDataContext(): Props {
  const contextData = useContext(PageDataContext)
  if (!contextData) {
    throw new Error('usePageDataContext must be used within a PageDataContextProvider')
  }
  return contextData
}
