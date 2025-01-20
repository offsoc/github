import {useMemo, type PropsWithChildren} from 'react'
import {AppContext, type AppContextType} from './app-context'

export function AppContextProvider({routes, history, children}: PropsWithChildren<AppContextType>) {
  const appContextProviderValue = useMemo(() => ({routes, history}), [routes, history])
  return <AppContext.Provider value={appContextProviderValue}>{children}</AppContext.Provider>
}
