import {createContext, useContext} from 'react'

const BasePathContext = createContext<string>('')

export function BasePathProvider({basePath, children}: React.PropsWithChildren<{basePath?: string}>) {
  return <BasePathContext.Provider value={basePath || ''}> {children} </BasePathContext.Provider>
}

export function useBasePath() {
  const context = useContext(BasePathContext)
  if (context === undefined) {
    throw new Error('useBasePath must be within BasePathProvider')
  }
  return context
}
